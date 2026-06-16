'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './reset.css';

type Screen = 'email' | 'sent' | 'new-password' | 'success' | 'expired';

export default function ResetPasswordPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  
  // Timer resend
  const [resendSeconds, setResendSeconds] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  // Token Timer
  const [tokenSeconds, setTokenSeconds] = useState(3600); // 1 hour
  
  // Password validation
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Refs for intervals
  const resendIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  // ── VALIDATION RULES ──
  const reqLength = password.length >= 8;
  const reqUpper = /[A-Z]/.test(password);
  const reqDigit = /[0-9]/.test(password);
  const reqSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [reqLength, reqUpper, reqDigit, reqSpecial].filter(Boolean).length;
  
  const cls = ['', 'weak', 'weak', 'medium', 'strong'];
  const lbl = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'];

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // ── ACTIONS ──
  const handleSendEmail = () => {
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setEmailError(true);
      return;
    }
    setIsLoadingSend(true);
    setTimeout(() => {
      setIsLoadingSend(false);
      setCurrentScreen('sent');
      startResendTimer();
    }, 1600);
  };

  const startResendTimer = () => {
    setResendSeconds(60);
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendSeconds(prev => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      triggerToast('Email renvoyé avec succès !');
      startResendTimer();
    }, 1200);
  };

  const simulateLinkClick = () => {
    setCurrentScreen('new-password');
    startTokenTimer();
  };

  const startTokenTimer = () => {
    setTokenSeconds(3600);
    if (tokenIntervalRef.current) clearInterval(tokenIntervalRef.current);
    tokenIntervalRef.current = setInterval(() => {
      setTokenSeconds(prev => {
        if (prev <= 1) {
          clearInterval(tokenIntervalRef.current!);
          setCurrentScreen('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReset = () => {
    if (score < 4) {
      setPwdError(true);
      triggerToast('Le mot de passe ne répond pas aux exigences de sécurité.');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(true);
      return;
    }
    setIsLoadingReset(true);
    if (tokenIntervalRef.current) clearInterval(tokenIntervalRef.current);
    setTimeout(() => {
      setIsLoadingReset(false);
      setCurrentScreen('success');
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
      if (tokenIntervalRef.current) clearInterval(tokenIntervalRef.current);
    };
  }, []);

  return (
    <div className="reset-container">
      <div className="split">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="panel-left">
          <div className="panel-bg"></div>
          <div className="panel-grid"></div>
          <svg className="panel-ship" viewBox="0 0 800 300" fill="none">
            <path d="M80 240 L720 240 L640 170 L400 110 L160 170 Z" fill="#b8985a" />
            <path d="M400 110 L400 30 L270 110 Z" fill="#b8985a" />
            <path d="M400 110 L400 20 L530 110 Z" fill="#b8985a" opacity=".5" />
            <path d="M60 255 Q200 275 400 255 Q600 235 740 255" stroke="#b8985a" strokeWidth="2" fill="none" opacity=".4" />
          </svg>
          <div className="panel-overlay"></div>
          <div className="panel-content">
            <Link href="/" className="panel-logo">VOYYACHT</Link>
            <div className="panel-hero">
              <span className="panel-eyebrow">Accès sécurisé</span>
              <h2 className="panel-title">Récupérez l'accès<br />à votre <em>espace</em></h2>
              <p className="panel-desc">Le processus de réinitialisation de mot de passe est simple, rapide et sécurisé. Votre nouveau mot de passe sera actif immédiatement.</p>
              <div className="panel-steps">
                <div className="panel-step">
                  <div className="panel-step-num">1</div>
                  <div className="panel-step-text"><strong>Saisissez votre email</strong> — Nous vous envoyons un lien de réinitialisation sécurisé.</div>
                </div>
                <div className="panel-step">
                  <div className="panel-step-num">2</div>
                  <div className="panel-step-text"><strong>Consultez votre boîte mail</strong> — Le lien est valable pendant <strong>1 heure</strong>.</div>
                </div>
                <div className="panel-step">
                  <div className="panel-step-num">3</div>
                  <div className="panel-step-text"><strong>Créez votre nouveau mot de passe</strong> — Choisissez un mot de passe fort et unique.</div>
                </div>
                <div className="panel-step">
                  <div className="panel-step-num">4</div>
                  <div className="panel-step-text"><strong>Reconnectez-vous</strong> — Accédez immédiatement à votre espace.</div>
                </div>
              </div>
            </div>
            <div className="panel-security">
              <div className="panel-sec-item">🔒 Lien chiffré</div>
              <div className="panel-sec-item">⏱ Valide 1h</div>
              <div className="panel-sec-item">🛡 Usage unique</div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="panel-right">
          <div className="panel-right-inner">

            {/* ══ SCREEN 1 : SAISIE EMAIL ══ */}
            <div className={`screen ${currentScreen === 'email' ? 'active' : ''}`}>
              <Link href="/auth" className="back-link">← Retour à la connexion</Link>
              <span className="form-eyebrow">Étape 1 / 3</span>
              <h1 className="form-title">Mot de passe<br /><em>oublié ?</em></h1>
              <p className="form-sub">Saisissez l'adresse email associée à votre compte. Nous vous enverrons un lien de réinitialisation valable <strong>1 heure</strong>.</p>

              <div className="field">
                <label className="field-label">Adresse email <span className="req">*</span></label>
                <input 
                  className={`field-input ${emailError ? 'error' : ''}`} 
                  type="email" 
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                />
                <span className={`field-error ${emailError ? 'show' : ''}`}>Veuillez saisir une adresse email valide.</span>
              </div>

              <div className="info-box warn">
                ⚠️ Si vous n'avez pas de compte avec cet email, vous ne recevrez pas d'email. Vérifiez l'adresse saisie.
              </div>

              <button className={`submit-btn ${isLoadingSend ? 'loading' : ''}`} onClick={handleSendEmail} disabled={isLoadingSend}>
                Envoyer le lien de réinitialisation
                <div className="submit-btn-loader"><div className="spinner"></div></div>
              </button>

              <div className="switch-link">
                Vous vous souvenez de votre mot de passe ? <Link href="/auth">Se connecter</Link>
              </div>
            </div>

            {/* ══ SCREEN 2 : EMAIL ENVOYÉ ══ */}
            <div className={`screen ${currentScreen === 'sent' ? 'active' : ''}`}>
              <span className="sent-icon">📧</span>
              <div className="sent-title">Email envoyé !</div>
              <p className="sent-sub">Un lien de réinitialisation a été envoyé à</p>
              <div className="sent-email-badge">{email}</div>

              <div className="tips-card">
                <div className="tips-title">Vous ne trouvez pas l'email ?</div>
                <div className="tip-item"><span>📁</span> Vérifiez votre dossier <strong>Spam / Indésirables</strong></div>
                <div className="tip-item"><span>⏱</span> L'email peut prendre <strong>1 à 5 minutes</strong> à arriver</div>
                <div className="tip-item"><span>✉️</span> L'expéditeur est <strong>noreply@voyyacht.com</strong></div>
                <div className="tip-item"><span>🔍</span> Cherchez "VoyYacht" dans votre boîte mail</div>
              </div>

              <div className="info-box success">
                🔒 Le lien de réinitialisation est <strong>valable 1 heure</strong> et ne peut être utilisé qu'<strong>une seule fois</strong>.
              </div>

              <div className="resend-row">
                {resendSeconds > 0 ? (
                  <span className="resend-timer">Renvoi disponible dans <strong>{resendSeconds}s</strong></span>
                ) : (
                  <span className="resend-timer">Vous pouvez renvoyer l'email.</span>
                )}
                <button className="resend-btn" onClick={handleResend} disabled={resendSeconds > 0 || isResending}>
                  {isResending ? 'Envoi…' : "Renvoyer l'email"}
                </button>
              </div>

              {/* Demo btn */}
              <button className="submit-btn" style={{ marginTop: '1.5rem', background: 'var(--gold)', borderColor: 'var(--gold)' }} onClick={simulateLinkClick}>
                🔗 Simuler le clic sur le lien (démo)
              </button>

              <div className="switch-link" style={{ marginTop: '1rem' }}>
                <a onClick={() => setCurrentScreen('email')}>← Changer d'adresse email</a>
              </div>
            </div>

            {/* ══ SCREEN 3 : NOUVEAU MOT DE PASSE ══ */}
            <div className={`screen ${currentScreen === 'new-password' ? 'active' : ''}`}>
              <button className="back-link" onClick={() => setCurrentScreen('email')}>← Retour</button>
              <span className="form-eyebrow">Étape 3 / 3</span>
              <h1 className="form-title">Nouveau<br /><em>mot de passe</em></h1>
              <p className="form-sub">Choisissez un mot de passe fort et unique pour sécuriser votre compte.</p>

              <div className="token-display">
                <div>Lien de réinitialisation pour <strong>{email || 'votre@email.com'}</strong></div>
                <div className="token-expiry">
                  ⏱ Expire dans <span className="token-timer">{Math.floor(tokenSeconds / 60)}:{String(tokenSeconds % 60).padStart(2, '0')}</span>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Nouveau mot de passe <span className="req">*</span></label>
                <div className="field-input-wrap">
                  <input 
                    className={`field-input ${pwdError ? 'error' : ''}`} 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Min. 8 caractères" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPwdError(false); }}
                  />
                  <button className="field-eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁'}</button>
                </div>
                <span className={`field-error ${pwdError ? 'show' : ''}`}>Le mot de passe ne répond pas aux exigences.</span>
                
                {password.length > 0 && (
                  <div className="pwd-strength-wrap">
                    <div className="pwd-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`pwd-bar ${i <= score ? cls[score] : ''}`}></div>
                      ))}
                    </div>
                    <span className="pwd-label">Force : {lbl[score]}</span>
                  </div>
                )}
                
                <div className="pwd-requirements">
                  <div className={`pwd-req ${reqLength ? 'met' : ''}`}><span className="pwd-req-icon">{reqLength ? '✓' : '○'}</span>Au moins 8 caractères</div>
                  <div className={`pwd-req ${reqUpper ? 'met' : ''}`}><span className="pwd-req-icon">{reqUpper ? '✓' : '○'}</span>Une lettre majuscule</div>
                  <div className={`pwd-req ${reqDigit ? 'met' : ''}`}><span className="pwd-req-icon">{reqDigit ? '✓' : '○'}</span>Un chiffre</div>
                  <div className={`pwd-req ${reqSpecial ? 'met' : ''}`}><span className="pwd-req-icon">{reqSpecial ? '✓' : '○'}</span>Un caractère spécial (!@#$…)</div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Confirmer le mot de passe <span className="req">*</span></label>
                <div className="field-input-wrap">
                  <input 
                    className={`field-input ${confirmError ? 'error' : passwordsMatch ? 'success-input' : ''}`} 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setConfirmError(false); }}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                  />
                  <button className="field-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '🙈' : '👁'}</button>
                </div>
                <span className={`field-error ${confirmError ? 'show' : ''}`}>Les mots de passe ne correspondent pas.</span>
                {passwordsMatch && (
                  <span className="field-hint" style={{ color: 'var(--success)' }}>✓ Les mots de passe correspondent</span>
                )}
              </div>

              <button className={`submit-btn ${isLoadingReset ? 'loading' : ''}`} onClick={handleReset} disabled={isLoadingReset}>
                Réinitialiser mon mot de passe
                <div className="submit-btn-loader"><div className="spinner"></div></div>
              </button>
            </div>

            {/* ══ SCREEN 4 : SUCCÈS ══ */}
            <div className={`screen ${currentScreen === 'success' ? 'active' : ''}`}>
              <div className="final-success">
                <span className="final-icon">🔓</span>
                <div className="final-title">Mot de passe<br />réinitialisé !</div>
                <p className="final-sub">Votre nouveau mot de passe est actif. Vous pouvez maintenant vous connecter à votre espace VoyYacht.</p>
                <div className="final-security-note">
                  🛡 Pour votre sécurité, toutes vos autres sessions actives ont été déconnectées. Si vous n'êtes pas à l'origine de cette réinitialisation, <a href="#" style={{ color: 'var(--success)' }}>contactez notre support immédiatement</a>.
                </div>
                <div className="final-btns">
                  <Link href="/auth"><button className="btn btn-primary">Se connecter maintenant</button></Link>
                  <Link href="/"><button className="btn btn-outline">Retour à l'accueil</button></Link>
                </div>
              </div>
            </div>

            {/* ══ SCREEN 5 : TOKEN EXPIRÉ ══ */}
            <div className={`screen ${currentScreen === 'expired' ? 'active' : ''}`}>
              <div className="expired-screen">
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1.25rem' }}>⌛</div>
                <h1 className="form-title" style={{ textAlign: 'center' }}>Lien <em>expiré</em></h1>
                <p className="form-sub" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>Ce lien de réinitialisation n'est plus valide. Il a peut-être déjà été utilisé ou a expiré après 1 heure.</p>
                <div className="info-box error">
                  ❌ Les liens de réinitialisation sont à usage unique et valables 1 heure seulement pour votre sécurité.
                </div>
                <button className="submit-btn" onClick={() => setCurrentScreen('email')}>
                  Demander un nouveau lien
                </button>
                <div className="switch-link" style={{ marginTop: '1rem' }}>
                  <Link href="/auth">← Retour à la connexion</Link>
                </div>
              </div>
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
