'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import './verify.css';

type Screen = 'intro' | 'camera' | 'uploading' | 'success' | 'pending';

export default function VerificationPage() {
  const { data: session } = (useSession() || {}) as any;
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Camera State
  const [camStatus, setCamStatus] = useState({ type: 'default', text: 'Initialisation…' });
  const [cameraError, setCameraError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSteps, setUploadSteps] = useState([false, false, false, false]);

  const MAX_DURATION = 15;
  const RING_CIRC = 125.6;

  // Refs
  const feedRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3500);
  };

  const switchScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── CAMERA ACTIONS ──
  const startCamera = async () => {
    switchScreen('camera');
    setCamStatus({ type: 'loading', text: "Demande d'accès à la caméra…" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      mediaStreamRef.current = stream;
      if (feedRef.current) {
        feedRef.current.srcObject = stream;
        feedRef.current.style.display = 'block';
      }
      setIsCameraReady(true);
      setCamStatus({ type: 'green', text: 'Caméra active · Prêt à enregistrer' });
    } catch (err: any) {
      let msg = "Impossible d'accéder à la caméra.";
      if (err.name === 'NotAllowedError') msg = "Permission refusée. Autorisez l'accès à la caméra dans les paramètres de votre navigateur.";
      else if (err.name === 'NotFoundError') msg = "Aucune caméra détectée sur cet appareil.";
      setCameraError(msg);
      setCamStatus({ type: 'default', text: '❌ Caméra inaccessible' });
    }
  };

  const startCountdown = () => {
    setIsCameraReady(false); // hides ready overlay
    setIsCountingDown(true);
    setCountdownNum(3);

    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count); // state will update, triggering re-render
      } else {
        clearInterval(timer);
        setIsCountingDown(false);
        startRecording();
      }
    }, 1000);
  };

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) { triggerToast('Caméra non disponible.'); return; }
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setIsRecording(true);
    
    const mimeType = getSupportedMimeType();
    const options = mimeType ? { mimeType } : undefined;
    mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, options);
    
    mediaRecorderRef.current.ondataavailable = e => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = onRecordingStop;
    mediaRecorderRef.current.start(100);

    setCamStatus({ type: 'red', text: '🔴 Enregistrement en cours…' });

    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds(prev => {
        const next = prev + 1;
        if (next >= MAX_DURATION) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const onRecordingStop = () => {
    const blob = new Blob(recordedChunksRef.current, { type: (recordedChunksRef.current[0] as any)?.type || 'video/webm' });
    const url = URL.createObjectURL(blob);
    if (feedRef.current) feedRef.current.style.display = 'none';
    if (playbackRef.current) {
      playbackRef.current.src = url;
      playbackRef.current.style.display = 'block';
    }
    setIsPreviewMode(true);
    setCamStatus({ type: 'green', text: `Vidéo prête · ${recordingSeconds}s enregistrées` });
    triggerToast("Enregistrement terminé. Visionnez votre vidéo avant d'envoyer.");
  };

  const retakeVideo = () => {
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setIsPreviewMode(false);
    if (playbackRef.current) {
      playbackRef.current.style.display = 'none';
      playbackRef.current.src = '';
    }
    if (feedRef.current) feedRef.current.style.display = 'block';
    setIsCameraReady(true);
    setCamStatus({ type: 'green', text: 'Caméra active · Prêt à enregistrer' });
  };

  const submitVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    switchScreen('uploading');
    simulateUpload();
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    setUploadSteps([false, false, false, false]);

    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(100, pct + 2);
      setUploadProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 80);

    const steps = [
      { idx: 0, delay: 0, done: 800 },
      { idx: 1, delay: 900, done: 2200 },
      { idx: 2, delay: 2300, done: 3200 },
      { idx: 3, delay: 3300, done: 4200 },
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setUploadSteps(prev => {
          const next = [...prev];
          next[s.idx] = true; // Set active/done (simplified visual logic)
          return next;
        });
        if (s.idx === steps.length - 1) {
          setTimeout(() => switchScreen('success'), 1000);
        }
      }, s.done);
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="verify-container">


      {/* PROGRESS STEPS */}
      <div className="progress-wrap">
        <div className="steps-row">
          <div className="step-wrap">
            <div className="step-dot done">✓</div>
            <div className="step-label">Inscription</div>
          </div>
          <div className="step-line done"></div>
          <div className="step-wrap">
            <div className="step-dot done">✓</div>
            <div className="step-label">Email vérifié</div>
          </div>
          <div className="step-line done"></div>
          <div className="step-wrap">
            <div className={`step-dot ${currentScreen === 'success' ? 'done' : 'active'}`}>
              {currentScreen === 'success' ? '✓' : '3'}
            </div>
            <div className="step-label" style={currentScreen !== 'success' ? { color: 'var(--navy)', fontWeight: 500 } : {}}>Vérification vidéo</div>
          </div>
          <div className={`step-line ${currentScreen === 'success' ? 'done' : ''}`}></div>
          <div className="step-wrap">
            <div className={`step-dot ${currentScreen === 'success' ? 'active' : ''}`}>4</div>
            <div className="step-label">Publier</div>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* ══ SCREEN 1 : INTRO ══ */}
        <div className={`screen ${currentScreen === 'intro' ? 'active' : ''}`}>
          <div className="intro-grid">
            <div>
              <span className="intro-eyebrow">Vérification d'identité</span>
              <h1 className="intro-title">Prouvez votre<br /><em>identité</em> en vidéo</h1>
              <p className="intro-desc">Pour garantir la sécurité de notre plateforme et la confiance de nos clients, chaque annonceur doit passer une vérification d'identité vidéo. Cette étape est <strong>obligatoire et effectuée une seule fois</strong>.</p>

              <div className="why-card">
                <div className="why-title">Pourquoi cette vérification ?</div>
                <div className="why-item"><span className="why-icon">🛡</span><span className="why-text"><strong>Sécurité :</strong> Nous garantissons que chaque annonceur est une vraie personne, propriétaire réel du yacht annoncé.</span></div>
                <div className="why-item"><span className="why-icon">⭐</span><span className="why-text"><strong>Badge Vérifié :</strong> Une fois validé, le badge ✓ Vérifié s'affiche sur toutes vos annonces, augmentant vos réservations.</span></div>
                <div className="why-item"><span className="why-icon">🔒</span><span className="why-text"><strong>Confidentialité :</strong> Votre vidéo est chiffrée, stockée sécurisée et n'est jamais diffusée publiquement.</span></div>
                <div className="why-item"><span className="why-icon">⏱</span><span className="why-text"><strong>Rapide :</strong> La vérification prend moins de 2 minutes. Notre équipe valide votre dossier sous 24–48h ouvrées.</span></div>
              </div>

              <div className="security-row">
                <div className="sec-chip">🔒 Chiffrement SSL</div>
                <div className="sec-chip">🗑️ Vidéo supprimée après validation</div>
                <div className="sec-chip">👁 Visible uniquement par notre équipe</div>
              </div>
            </div>

            <div>
              <div className="guide-card">
                <div className="guide-title">Comment ça se passe ?</div>
                <div className="guide-steps">
                  <div className="guide-step">
                    <div className="guide-step-num">1</div>
                    <div className="guide-step-text"><strong>Préparez votre pièce d'identité</strong><br />Passeport, carte d'identité ou permis de conduire. Le document doit être lisible et non expiré.</div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-num">2</div>
                    <div className="guide-step-text"><strong>Autorisez l'accès à votre caméra</strong><br />Votre navigateur vous demandera la permission. Acceptez pour pouvoir enregistrer.</div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-num">3</div>
                    <div className="guide-step-text"><strong>Enregistrez une vidéo de 10–15 secondes</strong><br />Regardez la caméra, tenez votre document face à l'objectif de façon lisible, et prononcez votre prénom.</div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-num">4</div>
                    <div className="guide-step-text"><strong>Soumettez et attendez la validation</strong><br />Notre équipe examine votre vidéo sous 24 à 48h ouvrées et vous notifie par email.</div>
                  </div>
                </div>
                <div className="guide-note">
                  💡 Assurez-vous d'être dans un endroit bien éclairé et silencieux. Évitez les contre-jours (ne vous positionnez pas devant une fenêtre).
                </div>
              </div>

              <button className="btn btn-gold" style={{ width: '100%', marginTop: '1.25rem', padding: '1rem', fontSize: '.82rem' }} onClick={startCamera}>
                🎥 Commencer la vérification →
              </button>
              <p style={{ fontSize: '.7rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '.6rem', lineHeight: 1.6 }}>En continuant, vous acceptez que votre vidéo soit examinée par notre équipe à des fins de vérification d'identité.</p>
            </div>
          </div>
        </div>

        {/* ══ SCREEN 2 : CAMERA ══ */}
        <div className={`screen ${currentScreen === 'camera' ? 'active' : ''}`}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="intro-eyebrow">Étape 3 / 4 — Enregistrement</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 300, color: 'var(--navy)' }}>Enregistrez votre <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>vidéo de vérification</em></h2>
          </div>

          <div className="camera-section">
            <div className="camera-wrap">
              <div className={`camera-frame ${isRecording ? 'recording' : ''} ${isPreviewMode ? 'preview-mode' : ''}`} style={{ borderColor: (isCameraReady && !isRecording && !isPreviewMode) ? 'rgba(184,152,90,.4)' : undefined }}>
                <div className="corner tl"></div><div className="corner tr"></div>
                <div className="corner bl"></div><div className="corner br"></div>
                
                <video ref={feedRef} autoPlay muted playsInline style={{ display: 'none' }}></video>
                <video ref={playbackRef} controls style={{ display: 'none' }}></video>

                {(!isCameraReady && !isCountingDown && !isRecording && !isPreviewMode && !cameraError) && (
                  <div className="cam-overlay">
                    <div className="cam-overlay-icon">📷</div>
                    <div className="cam-overlay-text">Initialisation de la caméra…<br /><small style={{ fontSize: '.72rem', opacity: .6 }}>Votre navigateur va vous demander l'autorisation</small></div>
                  </div>
                )}

                {(isCameraReady) && (
                  <div className="cam-overlay">
                    <div className="cam-overlay-icon">🎬</div>
                    <div className="cam-overlay-text" style={{ fontSize: '.9rem' }}>Caméra prête !<br /><small style={{ opacity: .6 }}>Cliquez sur "Démarrer" ci-dessous</small></div>
                  </div>
                )}

                {isRecording && (
                  <div className="rec-indicator" style={{ display: 'flex' }}>
                    <div className="rec-dot"></div>
                    <span className="rec-timer">{Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
                  </div>
                )}

                {isCountingDown && (
                  <div className="countdown-overlay" style={{ display: 'flex' }}>
                    <div className="countdown-num" key={countdownNum}>{countdownNum}</div>
                    <div className="countdown-text">Préparez votre pièce d'identité…</div>
                  </div>
                )}

                {isRecording && (
                  <div className="progress-ring-wrap" style={{ display: 'block' }}>
                    <svg className="progress-ring" width="48" height="48" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="4" />
                      <circle className="ring-fill" cx="24" cy="24" r="20" fill="none" stroke="var(--danger)" strokeWidth="4"
                        strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC - (RING_CIRC * (recordingSeconds / MAX_DURATION))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                  </div>
                )}
              </div>

              {!isRecording && !isPreviewMode && (
                <div className="cam-controls">
                  <button className="cam-btn cam-btn-primary" onClick={startCountdown} disabled={!isCameraReady || !!cameraError}>
                    🔴 Démarrer l'enregistrement
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="cam-controls">
                  <button className="cam-btn cam-btn-danger" onClick={stopRecording}>
                    ⏹ Arrêter l'enregistrement
                  </button>
                </div>
              )}

              {isPreviewMode && (
                <div className="cam-controls">
                  <button className="cam-btn cam-btn-outline" onClick={retakeVideo}>🔄 Recommencer</button>
                  <button className="cam-btn cam-btn-gold" onClick={submitVideo}>✅ Envoyer la vidéo →</button>
                </div>
              )}

              {cameraError && (
                <div className="error-card">
                  <span>⚠️</span>
                  <div>{cameraError}</div>
                </div>
              )}
            </div>

            <div className="camera-sidebar">
              <div className="cam-status-card">
                <div className="cam-status-lbl">Statut caméra</div>
                <div className="cam-status-val">
                  <div className={`cam-status-dot ${camStatus.type === 'green' ? 'green' : camStatus.type === 'red' ? 'red' : ''}`}></div>
                  <span>{camStatus.text}</span>
                </div>
              </div>

              <div className="cam-instructions">
                <div className="cam-instr-title">Instructions</div>
                <div className="cam-instr-item"><span className="cam-instr-icon">☀️</span><span className="cam-instr-text"><strong>Éclairage :</strong> Placez-vous face à une source de lumière, évitez les contre-jours.</span></div>
                <div className="cam-instr-item"><span className="cam-instr-icon">👁</span><span className="cam-instr-text"><strong>Regard :</strong> Regardez directement la caméra, pas l'écran.</span></div>
                <div className="cam-instr-item"><span className="cam-instr-icon">🪪</span><span className="cam-instr-text"><strong>Document :</strong> Tenez votre pièce d'identité bien visible, lisible, à hauteur de visage.</span></div>
                <div className="cam-instr-item"><span className="cam-instr-icon">🎙</span><span className="cam-instr-text"><strong>Voix :</strong> Prononcez clairement votre prénom et nom à voix haute.</span></div>
                <div className="cam-instr-item"><span className="cam-instr-icon">⏱</span><span className="cam-instr-text"><strong>Durée :</strong> La vidéo dure <strong>10 à 15 secondes</strong> maximum. L'enregistrement s'arrête automatiquement.</span></div>
              </div>

              <div className="id-sample">
                <span className="id-sample-icon">🪪</span>
                <div className="id-sample-text">
                  <strong>Documents acceptés :</strong><br />
                  Passeport · Carte d'identité nationale<br />Permis de conduire<br /><br />
                  <span style={{ color: 'var(--danger)', fontSize: '.7rem' }}>✗ Documents expirés non acceptés</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ SCREEN 3 : UPLOADING ══ */}
        <div className={`screen ${currentScreen === 'uploading' ? 'active' : ''}`}>
          <div className="upload-screen">
            <span className="upload-icon">📤</span>
            <div className="upload-title">Envoi en cours…</div>
            <p className="upload-sub">Votre vidéo est en cours de chiffrement et d'envoi sécurisé vers nos serveurs. Ne fermez pas cette page.</p>
            <div className="upload-progress-wrap">
              <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <div className="upload-progress-text">{uploadProgress}%</div>
            <div className="upload-steps">
              <div className={`upload-step-item ${uploadSteps[0] ? 'done' : 'active'}`}><span className="upload-step-icon">🔐</span>Chiffrement de la vidéo…</div>
              <div className={`upload-step-item ${uploadSteps[1] ? 'done' : uploadSteps[0] ? 'active' : ''}`}><span className="upload-step-icon">📡</span>Envoi sécurisé vers Cloudinary…</div>
              <div className={`upload-step-item ${uploadSteps[2] ? 'done' : uploadSteps[1] ? 'active' : ''}`}><span className="upload-step-icon">💾</span>Enregistrement de votre dossier…</div>
              <div className={`upload-step-item ${uploadSteps[3] ? 'done' : uploadSteps[2] ? 'active' : ''}`}><span className="upload-step-icon">📨</span>Notification à l'équipe de validation…</div>
            </div>
          </div>
        </div>

        {/* ══ SCREEN 4 : SUCCESS ══ */}
        <div className={`screen ${currentScreen === 'success' ? 'active' : ''}`}>
          <div className="success-screen">
            <div className="success-checkmark-anim">✅</div>
            <div className="success-title">Vidéo envoyée avec succès !</div>
            <p style={{ fontSize: '.87rem', color: 'var(--text-mid)', lineHeight: 1.9, marginBottom: '1.25rem' }}>
              Votre vidéo de vérification a bien été reçue par notre équipe. Vous recevrez un email de confirmation à <strong>{session?.user?.email || 'votre adresse email'}</strong> dans les <strong>24 à 48 heures ouvrées</strong>.
            </p>
            <div className="success-badge">⏳ Validation en cours · 24–48h ouvrées</div>
            <div className="next-steps-grid">
              <div className="next-step-card">
                <span className="ns-icon">📧</span>
                <div className="ns-title">Email de confirmation</div>
                <div className="ns-desc">Vous recevrez un email dès que votre identité sera validée par notre équipe.</div>
              </div>
              <div className="next-step-card">
                <span className="ns-icon">✓ Vérifié</span>
                <div className="ns-title">Badge annonceur</div>
                <div className="ns-desc">Le badge ✓ Vérifié apparaîtra automatiquement sur toutes vos annonces.</div>
              </div>
              <div className="next-step-card">
                <span className="ns-icon">⚓</span>
                <div className="ns-title">Publier vos annonces</div>
                <div className="ns-desc">En attendant la validation, préparez votre première annonce depuis le tableau de bord.</div>
              </div>
              <div className="next-step-card">
                <span className="ns-icon">📞</span>
                <div className="ns-title">Questions ?</div>
                <div className="ns-desc">Notre équipe répond 7j/7 à contact@azuryachts.com pour toute question sur la vérification.</div>
              </div>
            </div>
            <div className="success-btns">
              <Link href="/publish"><button className="btn btn-gold">⚓ Préparer mon annonce</button></Link>
              <Link href="/dashboard"><button className="btn btn-outline">Tableau de bord</button></Link>
            </div>
          </div>
        </div>

        {/* ══ SCREEN 5 : ALREADY PENDING ══ */}
        <div className={`screen ${currentScreen === 'pending' ? 'active' : ''}`}>
          <div className="pending-screen">
            <span className="pending-icon">⏳</span>
            <div className="pending-title">Vérification en cours</div>
            <p style={{ fontSize: '.85rem', color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '1rem' }}>
              Votre vidéo de vérification a déjà été soumise. Notre équipe l'examine actuellement.<br />
              Vous serez notifié par email dès validation.
            </p>
            <div className="pending-timeline">
              <div className="pending-tl-item done"><span className="ptl-icon">✅</span><div className="ptl-text"><strong>Vidéo soumise</strong> le 3 juin 2025 à 10h14</div></div>
              <div className="pending-tl-item active"><span className="ptl-icon">👀</span><div className="ptl-text"><strong>En cours d'examen</strong> par notre équipe de modération</div></div>
              <div className="pending-tl-item"><span className="ptl-icon">📧</span><div className="ptl-text"><strong>Email de confirmation</strong> — dans les 24–48h ouvrées</div></div>
              <div className="pending-tl-item"><span className="ptl-icon">🏅</span><div className="ptl-text"><strong>Badge ✓ Vérifié</strong> affiché sur vos annonces</div></div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              <Link href="/dashboard"><button className="btn btn-outline">← Tableau de bord</button></Link>
              <button className="btn btn-primary" onClick={() => triggerToast("Envoi d'un email de contact…")}>Contacter le support</button>
            </div>
          </div>
        </div>

      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span id="toast-msg">{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
