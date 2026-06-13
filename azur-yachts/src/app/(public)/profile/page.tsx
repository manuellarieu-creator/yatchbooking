'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import './profile.css';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('infos');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [modalOpen, setModalOpen] = useState('');

  const [pwdValue, setPwdValue] = useState('');
  const [tags, setTags] = useState(['Français', 'Anglais', 'Espagnol']);
  const [tagInput, setTagInput] = useState('');

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEmailEnabled: false,
    twoFactorSmsEnabled: false,
  });
  const [sessions, setSessions] = useState<any[]>([]);

  const isModal = typeof window !== 'undefined' && window.location.search.includes('modal=true');

  useEffect(() => {
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
          if (data.profile.languages?.length) {
            setTags(data.profile.languages);
          }
          if (data.profile.notificationPreferences) {
            // Merge with default to ensure no missing keys
            setNotifs(prev => ({ ...prev, ...data.profile.notificationPreferences }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    fetch('/api/profile/security')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSecuritySettings(data);
      })
      .catch(console.error);

    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error);
  }, []);

  // Notif toggles state (mock)
  const [notifs, setNotifs] = useState<Record<string, Record<string, boolean>>>({
    resa: { email: true, push: true, sms: false },
    rappel: { email: true, push: false, sms: true },
    paiement: { email: true, push: true, sms: true },
    msg: { email: true, push: true, sms: false },
    offres: { email: true, push: false, sms: false },
    news: { email: true, push: false, sms: false },
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const saveNotifs = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifs)
      });
      if (res.ok) {
        triggerToast('Préférences de notifications sauvegardées.');
      } else {
        triggerToast('Erreur lors de la sauvegarde des notifications.');
      }
    } catch (e) {
      triggerToast('Erreur serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
      countryResidence: formData.get('country'),
      languages: tags
    };

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        setProfile(result.profile);
        triggerToast('Informations sauvegardées avec succès.');
      } else {
        triggerToast(result.error || 'Erreur de sauvegarde.');
      }
    } catch (err) {
      triggerToast('Erreur serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const toggleNotif = async (category: string, channel: string) => {
    const isCurrentlyOn = notifs[category][channel];
    const willBeOn = !isCurrentlyOn;

    setNotifs(prev => ({
      ...prev,
      [category]: { ...prev[category], [channel]: willBeOn }
    }));

    if (channel === 'push' && willBeOn) {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        triggerToast("Les notifications Push ne sont pas supportées sur ce navigateur.");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn("Clé VAPID publique manquante !");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        const res = await fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        if (res.ok) {
          triggerToast("Notifications Push activées !");
        } else {
          throw new Error("Erreur serveur lors de l'abonnement");
        }
      } catch (error) {
        console.error("Erreur Push:", error);
        triggerToast("Erreur lors de l'activation des Push.");
        // Revert UI
        setNotifs(prev => ({
          ...prev,
          [category]: { ...prev[category], [channel]: false }
        }));
      }
    }
  };

  const toggle2FA = async (type: 'email' | 'sms') => {
    const updated = {
      ...securitySettings,
      [type === 'email' ? 'twoFactorEmailEnabled' : 'twoFactorSmsEnabled']: !securitySettings[type === 'email' ? 'twoFactorEmailEnabled' : 'twoFactorSmsEnabled']
    };
    setSecuritySettings(updated);
    try {
      await fetch('/api/profile/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      triggerToast(`2FA par ${type} mise à jour.`);
    } catch (err) {
      triggerToast('Erreur serveur.');
    }
  };

  const deleteSession = async (id?: string) => {
    try {
      const url = id ? `/api/sessions?id=${id}` : '/api/sessions';
      await fetch(url, { method: 'DELETE' });
      triggerToast(id ? 'Session déconnectée.' : 'Toutes les autres sessions déconnectées.');
      fetch('/api/sessions').then(res => res.json()).then(data => { if(Array.isArray(data)) setSessions(data) });
    } catch (err) {
      triggerToast('Erreur serveur.');
    }
  };

  const getPwdStrength = () => {
    let score = 0;
    if (pwdValue.length > 7) score++;
    if (/[A-Z]/.test(pwdValue)) score++;
    if (/[0-9]/.test(pwdValue)) score++;
    if (/[^A-Za-z0-9]/.test(pwdValue)) score++;
    return score;
  };

  const pwdScore = getPwdStrength();

  return (
    <div className="profile-container">
      
      {/* ── MAIN CONTENT ── */}

      <div className="page-wrap">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="profile-card">
            <div className="avatar-wrap">
              <div className="avatar" title="Changer la photo">
                <span>{profile?.firstName?.[0] || 'J'}{profile?.lastName?.[0] || 'D'}</span>
              </div>
              <div className="avatar-edit">✏️</div>
            </div>
            <div className="profile-name">{profile?.firstName} {profile?.lastName}</div>
            <div className="profile-email">{profile?.email}</div>
            <div className="profile-badge">
              {profile?.role === 'ADMIN' ? '👑 Administrateur' : profile?.role === 'ADVERTISER' ? '⚓ Annonceur' : '⚓ Client'}
            </div>
            <div className="verified-tick"><span className="tick">✓</span> Email vérifié</div>
          </div>

          <nav className="sidebar-nav">
            <a className={`sidebar-nav-item ${activeTab === 'infos' ? 'active' : ''}`} onClick={() => setActiveTab('infos')}>
              <span className="nav-icon">👤</span> Informations personnelles
            </a>
            <a className={`sidebar-nav-item ${activeTab === 'securite' ? 'active' : ''}`} onClick={() => setActiveTab('securite')}>
              <span className="nav-icon">🔒</span> Sécurité & mot de passe
            </a>
            <a className={`sidebar-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <span className="nav-icon">🔔</span> Notifications
              {profile?.unreadNotifications > 0 && <span className="nav-badge">{profile.unreadNotifications}</span>}
            </a>
            <a className={`sidebar-nav-item ${activeTab === 'paiement' ? 'active' : ''}`} onClick={() => setActiveTab('paiement')}>
              <span className="nav-icon">💳</span> Moyens de paiement
            </a>
            <a className={`sidebar-nav-item ${activeTab === 'activite' ? 'active' : ''}`} onClick={() => setActiveTab('activite')}>
              <span className="nav-icon">📱</span> Activité du compte
            </a>
            <a className={`sidebar-nav-item ${activeTab === 'zone-sensible' ? 'active' : ''}`} onClick={() => setActiveTab('zone-sensible')}>
              <span className="nav-icon" style={{ color: '#ef4444' }}>⚠️</span> Zone sensible
            </a>
            
            {profile?.role === 'ADMIN' && (
              <div style={{ marginTop: '2rem', padding: '0 1.5rem' }}>
                <Link 
                  href="/admin" 
                  target="_blank"
                  className="nav-btn-gold" 
                  style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem', cursor: 'pointer', textDecoration: 'none' }}
                >
                  Aller à l'Espace Admin
                </Link>
              </div>
            )}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">

          {/* SECTION INFOS */}
          {activeTab === 'infos' && (
            <form className="section-panel active stagger" onSubmit={handleSave}>
              <div className="section-hd">
                <div>
                  <span className="section-eyebrow">Compte {profile?.role === 'ADVERTISER' ? 'annonceur' : 'client'}</span>
                  <h1 className="section-title">Informations <em>personnelles</em></h1>
                </div>
                <span style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="stats-mini">
                <Link href="/reservations" className="stat-mini-card" style={{ textDecoration: 'none', color: 'inherit' }}><div className="stat-mini-num">{profile?._count?.bookings || 0}</div><div className="stat-mini-lbl">Réservations</div></Link>
                <Link href="/favorites" className="stat-mini-card" style={{ textDecoration: 'none', color: 'inherit' }}><div className="stat-mini-num">{profile?._count?.favorites || 0}</div><div className="stat-mini-lbl">Favoris</div></Link>
                {profile?.role === 'CLIENT' ? (
                  <Link href="/reservations?tab=cancelled" className="stat-mini-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stat-mini-num">{profile?.cancelledCount || 0}</div>
                    <div className="stat-mini-lbl">Annulations</div>
                  </Link>
                ) : (
                  <Link href="/dashboard?tab=listings" className="stat-mini-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stat-mini-num">{profile?._count?.listings || 0}</div>
                    <div className="stat-mini-lbl">Annonces publiées</div>
                  </Link>
                )}
              </div>

              <div className="form-card">
                <div className="form-card-title">Identité</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom <span className="required">*</span></label>
                    <input className="form-input" name="firstName" type="text" defaultValue={profile?.firstName || ''} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom <span className="required">*</span></label>
                    <input className="form-input" name="lastName" type="text" defaultValue={profile?.lastName || ''} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date de naissance</label>
                    <input className="form-input" type="date" defaultValue="1985-04-22" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nationalité</label>
                    <select className="form-select" defaultValue="fr">
                      <option value="fr">🇫🇷 Française</option>
                      <option value="be">🇧🇪 Belge</option>
                      <option value="ch">🇨🇭 Suisse</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
                <div className="form-row full">
                  <div className="form-group">
                    <label className="form-label">Biographie <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(optionnel)</span></label>
                    <textarea className="form-textarea" name="bio" defaultValue={profile?.bio || ''} />
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Coordonnées</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Adresse email <span className="required">*</span></label>
                    <input className="form-input" type="email" defaultValue={profile?.email || ''} readOnly disabled style={{ opacity: 0.7 }} />
                    <span className="form-hint" style={{ color: 'var(--success)' }}>✓ Email vérifié</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input className="form-input" name="phone" type="tel" defaultValue={profile?.phone || ''} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pays de résidence</label>
                    <select className="form-select" name="country" defaultValue={profile?.countryResidence || "fr"}>
                      <option value="fr">🇫🇷 France</option>
                      <option value="be">🇧🇪 Belgique</option>
                      <option value="ch">🇨🇭 Suisse</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input className="form-input" type="text" defaultValue="Paris" />
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Préférences de navigation</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type de bateau préféré</label>
                    <select className="form-select" defaultValue="catamaran">
                      <option value="voilier">Voilier</option>
                      <option value="catamaran">Catamaran</option>
                      <option value="motor">Motor Yacht</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination favorite</label>
                    <input className="form-input" type="text" defaultValue="Méditerranée" />
                  </div>
                </div>
                <div className="form-row full">
                  <div className="form-group">
                    <label className="form-label">Langues parlées</label>
                    <div className="tags-wrap">
                      {tags.map((t, i) => (
                        <span key={i} className="tag">{t} <span className="tag-remove" onClick={() => setTags(tags.filter(tag => tag !== t))}>×</span></span>
                      ))}
                      <input className="tag-input" placeholder="Ajouter…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagAdd} />
                    </div>
                    <span className="form-hint">Appuyez sur Entrée pour ajouter une langue</span>
                  </div>
                </div>
              </div>

              <div className="save-bar">
                <span className="save-bar-text">Les champs marqués <strong>*</strong> sont obligatoires</span>
                <div className="save-btns">
                  <button type="button" className="btn btn-outline" onClick={() => triggerToast('Modifications annulées.')}>Annuler</button>
                  <button type="submit" className="btn btn-gold" disabled={isSaving}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
                </div>
              </div>
            </form>
          )}

          {/* SECTION SECURITE */}
          {activeTab === 'securite' && (
            <div className="section-panel active stagger">
              <div className="section-hd">
                <div><span className="section-eyebrow">Sécurité</span><h1 className="section-title">Mot de <em>passe</em></h1></div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Modifier le mot de passe</div>
                <div className="form-row full">
                  <div className="form-group">
                    <label className="form-label">Mot de passe actuel <span className="required">*</span></label>
                    <input className="form-input" type="password" placeholder="••••••••••••" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe <span className="required">*</span></label>
                    <input className="form-input" type="password" placeholder="Min. 8 caractères" value={pwdValue} onChange={e => setPwdValue(e.target.value)} />
                    {pwdValue.length > 0 && (
                      <div className="pwd-strength">
                        <div className="pwd-bars">
                          <div className={`pwd-bar ${pwdScore > 0 ? (pwdScore < 3 ? 'weak' : pwdScore === 3 ? 'medium' : 'strong') : ''}`}></div>
                          <div className={`pwd-bar ${pwdScore > 1 ? (pwdScore < 3 ? 'weak' : pwdScore === 3 ? 'medium' : 'strong') : ''}`}></div>
                          <div className={`pwd-bar ${pwdScore > 2 ? (pwdScore === 3 ? 'medium' : 'strong') : ''}`}></div>
                          <div className={`pwd-bar ${pwdScore > 3 ? 'strong' : ''}`}></div>
                        </div>
                        <span className="pwd-text">Force : {pwdScore < 2 ? 'Faible' : pwdScore === 3 ? 'Moyenne' : 'Forte'}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmer le nouveau mot de passe <span className="required">*</span></label>
                    <input className="form-input" type="password" placeholder="••••••••••••" />
                  </div>
                </div>
                <div style={{ background: 'var(--sand-light)', borderLeft: '3px solid var(--gold)', padding: '.75rem 1rem', marginTop: '.5rem' }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
                    Le mot de passe doit contenir au moins <strong>8 caractères</strong>, <strong>1 majuscule</strong>, <strong>1 chiffre</strong> et <strong>1 caractère spécial</strong>.
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Authentification à deux facteurs</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">Activer la 2FA par SMS</div>
                    <div className="toggle-desc">Un code de confirmation sera envoyé à votre téléphone.</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={securitySettings.twoFactorSmsEnabled} onChange={() => toggle2FA('sms')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">Activer la 2FA par email</div>
                    <div className="toggle-desc">Un lien de connexion sécurisé sera envoyé par email.</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={securitySettings.twoFactorEmailEnabled} onChange={() => toggle2FA('email')} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Sessions actives</div>
                {sessions.map((session, i) => (
                  <div className="activity-item" key={session.id || i}>
                    <div className={`activity-dot ${i === 0 ? '' : 'grey'}`}></div>
                    <div className="activity-text">
                      <strong>{session.deviceInfo || 'Appareil inconnu'}</strong><br/>
                      {session.location || 'Localisation inconnue'} · {i === 0 ? 'Session actuelle' : 'Dernière activité: ' + new Date(session.lastActiveAt).toLocaleString('fr-FR')}
                    </div>
                    {i === 0 ? (
                      <span style={{ fontSize: '.7rem', background: 'var(--success-bg)', color: 'var(--success)', padding: '.2rem .6rem', border: '1px solid var(--success-bdr)' }}>Actuelle</span>
                    ) : (
                      <button className="btn btn-sm btn-outline" onClick={() => deleteSession(session.id)}>Déconnecter</button>
                    )}
                  </div>
                ))}
                {sessions.length > 1 && (
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--sand)', marginTop: '.5rem' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => { setModalOpen('deconnect'); deleteSession(); }}>Déconnecter toutes les autres sessions</button>
                  </div>
                )}
                {sessions.length === 0 && <div className="activity-item"><div className="activity-text">Chargement des sessions...</div></div>}
              </div>
            </div>
          )}

          {/* SECTION NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="section-panel active stagger">
              <div className="section-hd">
                <div><span className="section-eyebrow">Préférences</span><h1 className="section-title">Mes <em>notifications</em></h1></div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Réservations</div>
                <div className="notif-row">
                  <div className="notif-info"><div className="notif-label">Confirmation de réservation</div><div className="notif-desc">Lorsqu'une réservation est confirmée</div></div>
                  <div className="notif-channels">
                    <button className={`notif-ch ${notifs.resa.email ? 'on' : ''}`} onClick={() => toggleNotif('resa', 'email')}>Email</button>
                    <button className={`notif-ch ${notifs.resa.push ? 'on' : ''}`} onClick={() => toggleNotif('resa', 'push')}>Push</button>
                    <button className={`notif-ch ${notifs.resa.sms ? 'on' : ''}`} onClick={() => toggleNotif('resa', 'sms')}>SMS</button>
                  </div>
                </div>
                <div className="notif-row">
                  <div className="notif-info"><div className="notif-label">Rappel de départ</div><div className="notif-desc">48h avant le début</div></div>
                  <div className="notif-channels">
                    <button className={`notif-ch ${notifs.rappel.email ? 'on' : ''}`} onClick={() => toggleNotif('rappel', 'email')}>Email</button>
                    <button className={`notif-ch ${notifs.rappel.push ? 'on' : ''}`} onClick={() => toggleNotif('rappel', 'push')}>Push</button>
                    <button className={`notif-ch ${notifs.rappel.sms ? 'on' : ''}`} onClick={() => toggleNotif('rappel', 'sms')}>SMS</button>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Messagerie & offres</div>
                <div className="notif-row">
                  <div className="notif-info"><div className="notif-label">Nouveau message</div><div className="notif-desc">Lorsqu'un propriétaire vous contacte</div></div>
                  <div className="notif-channels">
                    <button className={`notif-ch ${notifs.msg.email ? 'on' : ''}`} onClick={() => toggleNotif('msg', 'email')}>Email</button>
                    <button className={`notif-ch ${notifs.msg.push ? 'on' : ''}`} onClick={() => toggleNotif('msg', 'push')}>Push</button>
                    <button className={`notif-ch ${notifs.msg.sms ? 'on' : ''}`} onClick={() => toggleNotif('msg', 'sms')}>SMS</button>
                  </div>
                </div>
              </div>

              <div className="save-bar">
                <span className="save-bar-text">Modifiez vos préférences puis enregistrez.</span>
                <div className="save-btns">
                  <button className="btn btn-gold" onClick={saveNotifs} disabled={isSaving}>
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION PAIEMENT */}
          {activeTab === 'paiement' && (
            <div className="section-panel active stagger">
              <div className="section-hd">
                <div><span className="section-eyebrow">Paiement</span><h1 className="section-title">Moyens de <em>paiement</em></h1></div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Cartes enregistrées</div>
                <div style={{ border: '1px solid var(--sand)', padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '54px', height: '36px', background: 'linear-gradient(135deg,var(--navy),var(--navy-light))', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.55rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>VISA</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.88rem', fontWeight: 500 }}>Visa •••• •••• •••• 4242</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-light)', marginTop: '.2rem' }}>Expire 09/27 · Par défaut</div>
                  </div>
                  <span style={{ fontSize: '.65rem', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-bdr)', padding: '.2rem .7rem', textTransform: 'uppercase' }}>Défaut</span>
                  <button className="btn btn-sm btn-outline" onClick={() => triggerToast('Carte supprimée.')}>Supprimer</button>
                </div>
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--sand)' }}>
                  <button className="btn btn-primary" onClick={() => setModalOpen('addcard')}>+ Ajouter une carte</button>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Comptes liés</div>
                <div className="toggle-row">
                  <div className="toggle-info"><div className="toggle-label">PayPal</div><div className="toggle-desc">jean.dupont@gmail.com · Compte lié</div></div>
                  <button className="btn btn-sm btn-outline" onClick={() => triggerToast('Compte dissocié.')}>Dissocier</button>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info"><div className="toggle-label">Virement bancaire</div><div className="toggle-desc">Pour les remboursements</div></div>
                  <button className="btn btn-sm btn-gold" onClick={() => setModalOpen('iban')}>Ajouter un IBAN</button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION ACTIVITE */}
          {activeTab === 'activite' && (
            <div className="section-panel active stagger">
              <div className="section-hd">
                <div><span className="section-eyebrow">Journal</span><h1 className="section-title">Activité du <em>compte</em></h1></div>
                <button className="btn btn-outline btn-sm" onClick={() => triggerToast('Export CSV téléchargé.')}>📄 Exporter CSV</button>
              </div>

              <div className="form-card">
                <div className="form-card-title">Historique récent</div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-text"><strong>Connexion réussie</strong> — Chrome · MacOS<br/>Paris, France</div>
                    <span className="activity-time">Aujourd'hui, 09h14</span>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-text"><strong>Réservation créée</strong> — REF-CK7X9M<br/>Azura Prestige 68</div>
                    <span className="activity-time">Hier, 14h18</span>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="form-card-title">Données personnelles</div>
                <div className="toggle-row">
                  <div className="toggle-info"><div className="toggle-label">Télécharger mes données</div><div className="toggle-desc">Archive complète (RGPD)</div></div>
                  <button className="btn btn-sm btn-outline" onClick={() => triggerToast('Demande envoyée. Vous recevrez un email sous 48h.')}>Demander</button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION DANGER */}
          {activeTab === 'danger' && (
            <div className="section-panel active stagger">
              <div className="section-hd">
                <div><span className="section-eyebrow">Zone sensible</span><h1 className="section-title">Actions <em>irréversibles</em></h1></div>
              </div>

              <div style={{ background: 'var(--sand-light)', borderLeft: '3px solid var(--gold)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '.82rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
                ⚠️ Les actions de cette section sont <strong>définitives</strong>.
              </div>

              <div className="danger-zone">
                <div className="danger-zone-title">Actions sensibles</div>
                <div className="danger-item">
                  <div className="danger-item-info">
                    <div className="danger-item-title">Suspendre temporairement mon compte</div>
                    <div className="danger-item-desc">Votre profil sera masqué.</div>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => setModalOpen('suspend')}>Suspendre</button>
                </div>
                <div className="danger-item">
                  <div className="danger-item-info">
                    <div className="danger-item-title">Supprimer définitivement mon compte</div>
                    <div className="danger-item-desc">Toutes vos données seront effacées.</div>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => setModalOpen('delete')}>Supprimer</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>

      {/* ── MODALS ── */}
      <div className={`modal-overlay ${modalOpen !== '' ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">
              {modalOpen === 'deconnect' && 'Déconnecter les sessions'}
              {modalOpen === 'addcard' && 'Ajouter une carte'}
              {modalOpen === 'iban' && 'Ajouter un IBAN'}
              {modalOpen === 'suspend' && 'Suspendre le compte'}
              {modalOpen === 'delete' && 'Supprimer le compte'}
            </h3>
            <button className="modal-close" onClick={() => setModalOpen('')}>×</button>
          </div>
          <div className="modal-body">
            {modalOpen === 'deconnect' && <p style={{ fontSize: '.85rem' }}>Êtes-vous sûr de vouloir déconnecter toutes les autres sessions ? Vous resterez connecté uniquement sur cet appareil.</p>}
            {modalOpen === 'delete' && (
              <>
                <p style={{ fontSize: '.85rem', color: 'var(--danger)', marginBottom: '1rem' }}>Cette action est irréversible. Toutes vos données seront perdues.</p>
                <input className="form-input" type="password" placeholder="Mot de passe pour confirmer" />
              </>
            )}
            {modalOpen === 'suspend' && (
              <select className="form-select">
                <option>1 mois</option>
                <option>3 mois</option>
                <option>Indéterminé</option>
              </select>
            )}
            {modalOpen === 'addcard' && (
              <>
                <input className="form-input" type="text" placeholder="Numéro de carte" style={{ marginBottom: '1rem' }} />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input className="form-input" type="text" placeholder="MM/AA" />
                  <input className="form-input" type="text" placeholder="CVC" />
                </div>
              </>
            )}
            {modalOpen === 'iban' && (
              <input className="form-input" type="text" placeholder="FR76..." />
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setModalOpen('')}>Annuler</button>
            <button className={`btn ${['delete', 'suspend'].includes(modalOpen) ? 'btn-danger' : 'btn-primary'}`} onClick={() => { triggerToast('Action confirmée.'); setModalOpen(''); }}>Confirmer</button>
          </div>
        </div>
      </div>

    </div>
  );
}
