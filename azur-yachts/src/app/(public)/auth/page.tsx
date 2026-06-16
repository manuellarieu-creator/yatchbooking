'use client';

import { useState, KeyboardEvent } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import './auth.css';

type Mode = 'login' | 'register' | 'forgot';
type Role = 'client' | 'advertiser' | null;

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState<number>(1);
  const [loginStep, setLoginStep] = useState<number>(1);
  const [otpInput, setOtpInput] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwd2Visible, setPwd2Visible] = useState(false);
  
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPwd: '',
    regPrenom: '',
    regNom: '',
    regEmail: '',
    regPwd: '',
    regPwd2: '',
    regPays: '',
    forgotEmail: ''
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [langs, setLangs] = useState<string[]>([]);
  const [langInput, setLangInput] = useState('');
  
  const [cguChecked, setCguChecked] = useState(false);
  const [newsChecked, setNewsChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [rememberChecked, setRememberChecked] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: false }));
  };

  const getPwdStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const pwdScore = getPwdStrength(formData.regPwd);
  const pwdClasses = ['', 'weak', 'weak', 'medium', 'strong'];
  const pwdLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'];

  const addLang = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = langInput.trim();
      if (val && !langs.includes(val)) {
        setLangs([...langs, val]);
        setLangInput('');
      }
    }
  };

  const removeLang = (lang: string) => {
    setLangs(langs.filter(l => l !== lang));
  };

  const validateStep2 = () => {
    const newErrors: Record<string, boolean> = {};
    let ok = true;
    if (!formData.regPrenom) { newErrors.regPrenom = true; ok = false; }
    if (!formData.regNom) { newErrors.regNom = true; ok = false; }
    if (!formData.regEmail || !formData.regEmail.includes('@')) { newErrors.regEmail = true; ok = false; }
    if (formData.regPwd.length < 8) { newErrors.regPwd = true; ok = false; }
    if (formData.regPwd !== formData.regPwd2) { newErrors.regPwd2 = true; ok = false; }
    setErrors(newErrors);
    return ok;
  };

  const handleLogin = async () => {
    const newErrors: Record<string, boolean> = {};
    let ok = true;
    if (!formData.loginEmail || !formData.loginEmail.includes('@')) { newErrors.loginEmail = true; ok = false; }
    if (!formData.loginPwd) { newErrors.loginPwd = true; ok = false; }
    setErrors(newErrors);
    if (!ok) return;

    setLoading(true);
    try {
      const payload: any = {
        email: formData.loginEmail,
        password: formData.loginPwd,
        redirect: false,
      };
      if (loginStep === 2 && otpInput) {
        payload.otp = otpInput;
      }

      const res = await signIn('credentials', payload) as any;

      if (res?.error) {
        if (res.error.includes('2FA_REQUIRED')) {
          setLoginStep(2);
          triggerToast('Code de sécurité envoyé.');
        } else if (res.error.includes('OTP_INVALID')) {
          triggerToast('Code de sécurité invalide.');
        } else {
          triggerToast('Email ou mot de passe incorrect.');
        }
      } else {
        triggerToast('Connexion réussie — redirection...');
        window.location.href = '/dashboard'; // Redirection vers le dashboard comme demandé
      }
    } catch (err) {
      triggerToast('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!cguChecked) return triggerToast('Veuillez accepter les CGU.');
    if (!ageChecked) return triggerToast('Vous devez confirmer avoir 18 ans ou plus.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.regPrenom,
          lastName: formData.regNom,
          email: formData.regEmail,
          password: formData.regPwd,
          role: role === 'advertiser' ? 'ADVERTISER' : 'CLIENT'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
      
      if (data.user?.role === 'ADVERTISER') {
        triggerToast('Un code de vérification vous a été envoyé.');
        setStep(4);
      } else {
        setShowSuccess(true);
      }
    } catch (err: any) {
      triggerToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.regEmail, otp: otpInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Code invalide');
      
      triggerToast('Email vérifié ! Redirection vers la vérification d\'identité...');
      setTimeout(() => {
        signIn('credentials', { email: formData.regEmail, password: formData.regPwd, redirect: true, callbackUrl: '/verify' });
      }, 1000);
      
    } catch (err: any) {
      triggerToast(err.message);
      setLoading(false);
    }
  };

  const handleForgot = () => {
    if (!formData.forgotEmail || !formData.forgotEmail.includes('@')) return triggerToast('Veuillez saisir un email valide.');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSuccess(true);
    }, 1400);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(1);
    setLoginStep(1);
    setShowSuccess(false);
    setForgotSuccess(false);
  };

  return (
    <div className="auth-page-container">
      <div className="split">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="panel-left">
          <div className="panel-left-bg"></div>
          <div className="panel-left-grid"></div>
          <svg className="panel-left-ship" viewBox="0 0 800 300" fill="none">
            <path d="M80 240 L720 240 L640 170 L400 110 L160 170 Z" fill="#b8985a"/>
            <path d="M400 110 L400 30 L270 110 Z" fill="#b8985a"/>
            <path d="M400 110 L400 20 L530 110 Z" fill="#b8985a" opacity=".5"/>
            <path d="M60 255 Q200 275 400 255 Q600 235 740 255" stroke="#b8985a" strokeWidth="2" fill="none" opacity=".4"/>
          </svg>
          <div className="panel-left-overlay"></div>
          <div className="panel-left-content">
            <Link href="/" className="panel-logo">VOYYACHT</Link>
            <div className="panel-hero">
              <span className="panel-eyebrow">Bienvenue à bord</span>
              <h2 className="panel-title">Votre aventure<br/>en mer commence<br/><em>ici</em></h2>
              <p className="panel-desc">Accédez à la plus grande flotte de yachts de prestige vérifiés. Réservez en toute sérénité, profitez en toute liberté.</p>
              <div className="panel-stats">
                <div className="panel-stat"><div className="panel-stat-num">340+</div><div className="panel-stat-lbl">Yachts disponibles</div></div>
                <div className="panel-stat"><div className="panel-stat-num">68</div><div className="panel-stat-lbl">Destinations</div></div>
                <div className="panel-stat"><div className="panel-stat-num">4.8★</div><div className="panel-stat-lbl">Note moyenne</div></div>
              </div>
            </div>
            <div className="panel-testimonial">
              <p className="panel-testi-text">"La réservation était simple et le yacht exactement comme sur les photos. La Côte d'Azur depuis la mer, c'est tout simplement magique."</p>
              <div className="panel-testi-author">
                <div className="panel-testi-av">SL</div>
                <div>
                  <div className="panel-testi-name">Sophie Lemaire</div>
                  <div className="panel-testi-loc">Paris, France · ★★★★★</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="panel-right">
          <div className="panel-right-inner">

            {/* Mode switcher (hide if success or forgot) */}
            {!showSuccess && mode !== 'forgot' && !forgotSuccess && (
              <div className="mode-switcher">
                <button className={`mode-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Connexion</button>
                <button className={`mode-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>Inscription</button>
              </div>
            )}

            {/* ══ LOGIN ══ */}
            {mode === 'login' && !showSuccess && (
              <div className="form-panel active">
                <div className="form-header">
                  <span className="form-eyebrow">Bon retour</span>
                  <h1 className="form-title">Connectez-vous<br/>à votre <em>espace</em></h1>
                  <p className="form-subtitle">Accédez à vos réservations, vos favoris et votre profil.</p>
                </div>

                {loginStep === 1 ? (
                  <>
                    <div className="field">
                      <label className="field-label">Adresse email <span className="req">*</span></label>
                      <div className="field-input-wrap">
                        <input className={`field-input ${errors.loginEmail ? 'error' : ''}`} type="email" id="loginEmail" value={formData.loginEmail} onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="votre@email.com" />
                      </div>
                      {errors.loginEmail && <span className="field-error visible">Email invalide ou introuvable.</span>}
                    </div>

                    <div className="field">
                      <label className="field-label">Mot de passe <span className="req">*</span></label>
                      <div className="field-input-wrap">
                        <input className={`field-input ${errors.loginPwd ? 'error' : ''}`} type={pwdVisible ? 'text' : 'password'} id="loginPwd" value={formData.loginPwd} onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="••••••••••" />
                        <button className="field-eye" onClick={() => setPwdVisible(!pwdVisible)}>{pwdVisible ? '🙈' : '👁'}</button>
                      </div>
                      {errors.loginPwd && <span className="field-error visible">Mot de passe incorrect.</span>}
                      <a className="forgot-link" onClick={() => switchMode('forgot')}>Mot de passe oublié ?</a>
                    </div>

                    <div className="check-row">
                      <div className={`check-box-custom ${rememberChecked ? 'checked' : ''}`} onClick={() => setRememberChecked(!rememberChecked)}></div>
                      <label className="check-label" onClick={() => setRememberChecked(!rememberChecked)}>Se souvenir de moi (30 jours)</label>
                    </div>

                    <button className={`submit-btn ${loading ? 'loading' : ''}`} onClick={handleLogin} disabled={loading}>
                      Se connecter
                      <div className="submit-btn-loader"><div className="spinner"></div></div>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="info-box info" style={{marginBottom: '1rem'}}>
                      🔒 Une double authentification est activée sur votre compte. Un code vient de vous être envoyé.
                    </div>
                    <div className="field">
                      <label className="field-label" style={{textAlign: 'center', display: 'block'}}>Code de sécurité</label>
                      <input 
                        className="field-input" 
                        style={{letterSpacing:'0.4em', fontSize:'1.4rem', textAlign:'center', fontWeight: 'bold'}} 
                        type="text" 
                        value={otpInput} 
                        onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))} 
                        onKeyDown={(e) => e.key === 'Enter' && otpInput.length === 6 && handleLogin()}
                        placeholder="123456" 
                        maxLength={6} 
                      />
                    </div>
                    <button className={`submit-btn ${loading ? 'loading' : ''}`} onClick={handleLogin} disabled={loading || otpInput.length !== 6}>
                      Valider le code
                      <div className="submit-btn-loader"><div className="spinner"></div></div>
                    </button>
                    <button className="back-link" style={{marginTop:'1rem', display:'block', textAlign:'center', width:'100%'}} onClick={() => setLoginStep(1)}>← Retour</button>
                  </>
                )}

                <div className="or-divider">ou</div>
                <div className="social-auth">
                  <button className="social-btn" onClick={() => triggerToast('Connexion Google en cours…')}><span className="social-icon">🌐</span>Continuer avec Google</button>
                  <button className="social-btn" onClick={() => triggerToast('Connexion Facebook en cours…')}><span className="social-icon">📘</span>Continuer avec Facebook</button>
                </div>

                <div className="switch-link">Pas encore de compte ? <a onClick={() => switchMode('register')}>S'inscrire gratuitement</a></div>
              </div>
            )}

            {/* ══ REGISTER ══ */}
            {mode === 'register' && !showSuccess && (
              <div className="form-panel active">
                
                {/* Step 1 */}
                {step === 1 && (
                  <div>
                    <div className="form-header">
                      <span className="form-eyebrow">Étape 1 / 3</span>
                      <h1 className="form-title">Créer votre<br/><em>compte</em></h1>
                      <p className="form-subtitle">Commencez par choisir votre profil.</p>
                    </div>

                    <div className="steps-bar">
                      <div className="step-item"><div className="step-dot active">1</div><div className="step-line"></div></div>
                      <div className="step-item"><div className="step-dot">2</div><div className="step-line"></div></div>
                      <div className="step-item"><div className="step-dot">3</div></div>
                    </div>

                    <div style={{fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'.18em', color:'var(--text-light)', marginBottom:'.9rem'}}>Vous êtes <span className="req" style={{color:'var(--gold)'}}>*</span></div>
                    <div className="role-selector">
                      <div className={`role-card ${role === 'client' ? 'selected' : ''}`} onClick={() => setRole('client')}>
                        <span className="role-icon">👤</span>
                        <div className="role-label">Client</div>
                        <div className="role-desc">Je souhaite louer un yacht pour mes vacances ou événements.</div>
                      </div>
                      <div className={`role-card ${role === 'advertiser' ? 'selected' : ''}`} onClick={() => setRole('advertiser')}>
                        <span className="role-icon">⚓</span>
                        <div className="role-label">Annonceur</div>
                        <div className="role-desc">Je possède un yacht et souhaite le mettre en location.</div>
                      </div>
                    </div>

                    <button className="submit-btn" onClick={() => { if(role) setStep(2); else triggerToast('Veuillez choisir un profil.'); }} disabled={!role} style={{opacity: role ? 1 : 0.5}}>Continuer →</button>
                    <div className="switch-link">Déjà un compte ? <a onClick={() => switchMode('login')}>Se connecter</a></div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div>
                    <button className="back-link" onClick={() => setStep(1)}>← Retour</button>
                    <div className="form-header">
                      <span className="form-eyebrow">Étape 2 / 3</span>
                      <h1 className="form-title">Vos <em>informations</em></h1>
                      <p className="form-subtitle">{role === 'advertiser' ? 'Informations de votre compte annonceur.' : 'Créez votre compte client en quelques secondes.'}</p>
                    </div>
                    <div className="steps-bar">
                      <div className="step-item"><div className="step-dot done">✓</div><div className="step-line done"></div></div>
                      <div className="step-item"><div className="step-dot active">2</div><div className="step-line"></div></div>
                      <div className="step-item"><div className="step-dot">3</div></div>
                    </div>

                    <div className="field-row">
                      <div className="field" style={{marginBottom:0}}>
                        <label className="field-label">Prénom <span className="req">*</span></label>
                        <input className={`field-input ${errors.regPrenom ? 'error' : ''}`} type="text" id="regPrenom" value={formData.regPrenom} onChange={handleInputChange} placeholder="Jean" />
                        {errors.regPrenom && <span className="field-error visible">Champ requis.</span>}
                      </div>
                      <div className="field" style={{marginBottom:0}}>
                        <label className="field-label">Nom <span className="req">*</span></label>
                        <input className={`field-input ${errors.regNom ? 'error' : ''}`} type="text" id="regNom" value={formData.regNom} onChange={handleInputChange} placeholder="Dupont" />
                        {errors.regNom && <span className="field-error visible">Champ requis.</span>}
                      </div>
                    </div>

                    <div className="field" style={{marginTop:'1.1rem'}}>
                      <label className="field-label">Adresse email <span className="req">*</span></label>
                      <input className={`field-input ${errors.regEmail ? 'error' : ''}`} type="email" id="regEmail" value={formData.regEmail} onChange={handleInputChange} placeholder="votre@email.com" />
                      {errors.regEmail && <span className="field-error visible">Email invalide.</span>}
                    </div>

                    <div className="field">
                      <label className="field-label">Mot de passe <span className="req">*</span></label>
                      <div className="field-input-wrap">
                        <input className={`field-input ${errors.regPwd ? 'error' : ''}`} type={pwdVisible ? 'text' : 'password'} id="regPwd" value={formData.regPwd} onChange={handleInputChange} placeholder="Min. 8 caractères" />
                        <button className="field-eye" onClick={() => setPwdVisible(!pwdVisible)}>{pwdVisible ? '🙈' : '👁'}</button>
                      </div>
                      {errors.regPwd && <span className="field-error visible">Mot de passe trop faible.</span>}
                      {formData.regPwd.length > 0 && (
                        <div className="pwd-strength">
                          <div className="pwd-bars">
                            {[1,2,3,4].map(i => <div key={i} className={`pwd-bar ${i <= pwdScore ? pwdClasses[pwdScore] : ''}`}></div>)}
                          </div>
                          <span className="pwd-lbl">Force : {pwdLabels[pwdScore]}</span>
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label className="field-label">Confirmer le mot de passe <span className="req">*</span></label>
                      <div className="field-input-wrap">
                        <input className={`field-input ${errors.regPwd2 ? 'error' : ''}`} type={pwd2Visible ? 'text' : 'password'} id="regPwd2" value={formData.regPwd2} onChange={handleInputChange} placeholder="••••••••" />
                        <button className="field-eye" onClick={() => setPwd2Visible(!pwd2Visible)}>{pwd2Visible ? '🙈' : '👁'}</button>
                      </div>
                      {errors.regPwd2 && <span className="field-error visible">Les mots de passe ne correspondent pas.</span>}
                    </div>

                    {role === 'advertiser' && (
                      <div>
                        <div className="info-box info" style={{marginBottom:'1.1rem'}}>⚓ En tant qu'annonceur, vous devrez compléter une vérification d'identité vidéo après inscription.</div>
                        <div className="field">
                          <label className="field-label">Pays de résidence</label>
                          <select className="field-select" id="regPays" value={formData.regPays} onChange={handleInputChange}>
                            <option value="">Sélectionner…</option>
                            <option value="FR">🇫🇷 France</option>
                            <option value="BE">🇧🇪 Belgique</option>
                            <option value="CH">🇨🇭 Suisse</option>
                            <option value="MC">🇲🇨 Monaco</option>
                            <option value="IT">🇮🇹 Italie</option>
                            <option value="ES">🇪🇸 Espagne</option>
                            <option value="UK">🇬🇧 Royaume-Uni</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="field-label">Langues parlées</label>
                          <div className="tags-wrap" onClick={() => document.getElementById('langInput')?.focus()}>
                            {langs.map(l => (
                              <span key={l} className="tag">{l} <span className="tag-x" onClick={(e) => { e.stopPropagation(); removeLang(l); }}>×</span></span>
                            ))}
                            <input className="tag-input" id="langInput" value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={addLang} placeholder="Ajouter une langue…" />
                          </div>
                          <span className="field-hint">Appuyez sur Entrée pour ajouter</span>
                        </div>
                      </div>
                    )}

                    <button className="submit-btn" onClick={() => { if(validateStep2()) setStep(3); }}>Continuer →</button>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div>
                    <button className="back-link" onClick={() => setStep(2)}>← Retour</button>
                    <div className="form-header">
                      <span className="form-eyebrow">Étape 3 / 3</span>
                      <h1 className="form-title">Dernière <em>étape</em></h1>
                      <p className="form-subtitle">Acceptez les conditions pour finaliser votre inscription.</p>
                    </div>
                    <div className="steps-bar">
                      <div className="step-item"><div className="step-dot done">✓</div><div className="step-line done"></div></div>
                      <div className="step-item"><div className="step-dot done">✓</div><div className="step-line done"></div></div>
                      <div className="step-item"><div className="step-dot active">3</div></div>
                    </div>

                    <div className="info-box info" style={{marginBottom:'1.25rem'}}>
                      📋 Récapitulatif : <strong>{formData.regPrenom} {formData.regNom}</strong> · <strong>{formData.regEmail}</strong> · <span>{role === 'advertiser' ? '⚓ Annonceur' : '👤 Client'}</span>
                    </div>

                    <div className="check-row">
                      <div className={`check-box-custom ${cguChecked ? 'checked' : ''}`} onClick={() => setCguChecked(!cguChecked)}></div>
                      <label className="check-label" onClick={() => setCguChecked(!cguChecked)}>
                        J'accepte les <Link href="/legal" target="_blank">Conditions Générales d'Utilisation</Link> et la <Link href="/legal" target="_blank">Politique de Confidentialité</Link> d'VoyYacht. <span className="req">*</span>
                      </label>
                    </div>

                    <div className="check-row">
                      <div className={`check-box-custom ${newsChecked ? 'checked' : ''}`} onClick={() => setNewsChecked(!newsChecked)}></div>
                      <label className="check-label" onClick={() => setNewsChecked(!newsChecked)}>
                        Je souhaite recevoir les offres exclusives, codes promo et actualités d'VoyYacht par email. (Optionnel)
                      </label>
                    </div>

                    <div className="check-row">
                      <div className={`check-box-custom ${ageChecked ? 'checked' : ''}`} onClick={() => setAgeChecked(!ageChecked)}></div>
                      <label className="check-label" onClick={() => setAgeChecked(!ageChecked)}>
                        Je confirme avoir 18 ans ou plus. <span className="req">*</span>
                      </label>
                    </div>

                    <button className={`submit-btn ${loading ? 'loading' : ''}`} onClick={handleRegister} disabled={loading}>
                      Créer mon compte
                      <div className="submit-btn-loader"><div className="spinner"></div></div>
                    </button>
                  </div>
                )}

                {/* Step 4: OTP */}
                {step === 4 && role === 'advertiser' && (
                  <div>
                    <div className="form-header">
                      <span className="form-eyebrow">Dernière étape</span>
                      <h1 className="form-title">Vérifiez votre <em>email</em></h1>
                      <p className="form-subtitle">Un code à 6 chiffres a été envoyé à {formData.regEmail}.</p>
                    </div>

                    <div className="field">
                      <label className="field-label" style={{textAlign: 'center', display: 'block'}}>Code de vérification</label>
                      <input 
                        className="field-input" 
                        style={{letterSpacing:'0.4em', fontSize:'1.4rem', textAlign:'center', fontWeight: 'bold'}} 
                        type="text" 
                        value={otpInput} 
                        onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))} 
                        placeholder="123456" 
                        maxLength={6} 
                      />
                    </div>

                    <button className={`submit-btn ${loading ? 'loading' : ''}`} onClick={handleVerifyOtp} disabled={loading || otpInput.length !== 6}>
                      Vérifier et continuer
                      <div className="submit-btn-loader"><div className="spinner"></div></div>
                    </button>
                    
                    <div className="switch-link" style={{marginTop:'1.5rem'}}>
                      <a onClick={() => triggerToast("L'email a été renvoyé !")}>Renvoyer le code</a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success screen (Register) */}
            {mode === 'register' && showSuccess && (
              <div className="success-screen" style={{display:'block'}}>
                <span className="success-icon-big">✅</span>
                <div className="success-title">Compte créé !</div>
                <p className="success-text">Votre compte a été créé avec succès. Un email de confirmation a été envoyé à</p>
                <div className="success-email-badge">{formData.regEmail}</div>
                <p className="success-text">Cliquez sur le lien dans l'email pour activer votre compte. Si vous ne le trouvez pas, vérifiez vos spams.</p>
                {role === 'advertiser' && (
                  <div className="info-box warn" style={{textAlign:'left', marginTop:'1rem'}}>⚓ Prochaine étape : complétez votre <strong>vérification d'identité vidéo</strong> pour pouvoir publier vos annonces.</div>
                )}
                <button className="submit-btn" style={{marginTop:'1.5rem'}} onClick={() => switchMode('login')}>Aller à la connexion</button>
              </div>
            )}

            {/* ══ FORGOT PASSWORD ══ */}
            {mode === 'forgot' && !forgotSuccess && (
              <div className="form-panel active">
                <button className="back-link" onClick={() => switchMode('login')}>← Retour à la connexion</button>
                <div className="form-header">
                  <span className="form-eyebrow">Mot de passe oublié</span>
                  <h1 className="form-title">Réinitialiser<br/>votre <em>accès</em></h1>
                  <p className="form-subtitle">Saisissez votre email pour recevoir un lien de réinitialisation valable 1 heure.</p>
                </div>

                <div className="field">
                  <label className="field-label">Adresse email <span className="req">*</span></label>
                  <input className="field-input" type="email" id="forgotEmail" value={formData.forgotEmail} onChange={handleInputChange} placeholder="votre@email.com" />
                </div>
                <button className={`submit-btn ${loading ? 'loading' : ''}`} onClick={handleForgot} disabled={loading}>
                  Envoyer le lien
                  <div className="submit-btn-loader"><div className="spinner"></div></div>
                </button>
              </div>
            )}

            {mode === 'forgot' && forgotSuccess && (
              <div className="reset-sent" style={{display:'block'}}>
                <span style={{fontSize:'2.5rem', display:'block', marginBottom:'1rem'}}>📧</span>
                <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.6rem', color:'var(--navy)', marginBottom:'.5rem'}}>Email envoyé !</div>
                <p style={{fontSize:'.83rem', color:'var(--text-mid)', lineHeight:1.8}}>Un lien de réinitialisation a été envoyé à <strong>{formData.forgotEmail}</strong>. Vérifiez votre boîte mail et vos spams.</p>
                <button className="submit-btn" style={{marginTop:'1.5rem'}} onClick={() => switchMode('login')}>Retour à la connexion</button>
              </div>
            )}

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
