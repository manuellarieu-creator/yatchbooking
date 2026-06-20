'use client';

import { useState, useRef, useEffect, ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import '@/app/(public)/publish/publish.css';

const TOTAL_STEPS = 7;
const PREDEFINED_FEATURES = [
  'Taud de soleil', 'Douche extérieure', 'Table extérieure', 'Enceintes extérieures', 'Pont en teck', 'Échelle de bain',
  'Eau chaude', 'Dessalinisateur', 'Air conditionné', 'WC électrique', 'Serviettes de bain', 'Prise USB',
  'Annexe', 'Guindeau électrique', 'Pilote automatique', 'GPS', 'VHF',
  'Four/cuisinière', 'Machine à café',
  'Caméra vidéo', 'Système audio',
  'Grand-voile lattée', 'Génois',
  'Générateur', 'Panneaux solaires', 'Inverseur électrique', 'Prise 220V',
  'Ski nautique', 'Filet de sécurité', 'Wi-Fi', 'Paddle', 'Canoë-kayak'
];

type Service = {
  id: string;
  name: string;
  price: number;
  unit: string;
  desc?: string;
  isRequired?: boolean;
};

function PublishForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [savedStatus, setSavedStatus] = useState('💾 Sauvegardé');
  const isModal = searchParams.get('modal') === 'true';
  const editId = searchParams.get('edit');

  // Admin logic
  const [isAdmin, setIsAdmin] = useState(true);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  
  // Step 1
  const [firstName, setFirstName] = useState('Jean');
  const [lastName, setLastName] = useState('Dupont');
  const [country, setCountry] = useState('🇫🇷 France');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState<string[]>(['Français', 'Anglais']);
  const [langInput, setLangInput] = useState('');

  // Step 2
  const [title, setTitle] = useState('');
  const [boatType, setBoatType] = useState('');
  const [year, setYear] = useState('');
  const [portCountry, setPortCountry] = useState('France');
  const [portCity, setPortCity] = useState('');
  const [length, setLength] = useState('');
  const [cabins, setCabins] = useState('');
  const [berths, setBerths] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [boatPlanUrl, setBoatPlanUrl] = useState('');
  const [adults, setAdults] = useState(8);
  const [children, setChildren] = useState(2);
  const [hours, setHours] = useState('');
  const [captainReq, setCaptainReq] = useState(false);
  const [skipperOpt, setSkipperOpt] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');
  const [isAtSea, setIsAtSea] = useState(false);
  const [customBoatType, setCustomBoatType] = useState('');

  // Step 3
  const [photos, setPhotos] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4
  const [priceDay, setPriceDay] = useState('');
  const [cleaningFee, setCleaningFee] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [fuelIncluded, setFuelIncluded] = useState(false);
  const [captainPrice, setCaptainPrice] = useState('');
  const [skipperPrice, setSkipperPrice] = useState('');

  // Step 5
  const [services, setServices] = useState<Service[]>([]);
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcUnit, setSvcUnit] = useState('PER_BOOKING');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcIsRequired, setSvcIsRequired] = useState(false);
  const [deliveryToggle, setDeliveryToggle] = useState(false);
  const [deliveryPricing, setDeliveryPricing] = useState<{distance: string, fee: string}[]>([]);

  // Step 6
  const [calMode, setCalMode] = useState<'available' | 'blocked'>('available');
  const [calMonthOffset, setCalMonthOffset] = useState(0); // 0 = current month
  const [markedDays, setMarkedDays] = useState<Record<string, string>>({});
  const [immediateAvail, setImmediateAvail] = useState(false);

  // General State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users/list');
        const data = await res.json();
        if (data.users) {
          setAdvertisers(data.users);
        }
      } catch (err) {}
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editId) {
      fetch(`/api/listings/${editId}`).then(r => r.json()).then(data => {
        if (data.listing) {
          const l = data.listing;
          setSelectedOwnerId(l.ownerId);
          setFirstName(l.owner?.firstName || '');
          setLastName(l.owner?.lastName || '');
          setPhone(l.owner?.phone || '');
          const langs = l.owner?.languages;
          setLanguages(Array.isArray(langs) ? langs : ['Français', 'Anglais']);

          setTitle(l.title);
          setBoatType(l.boatType);
          setYear(l.boatYear?.toString() || '');
          setPortCountry(l.country);
          setPortCity(l.location);
          setLength(l.boatLength?.toString() || '');
          setCabins(l.cabins?.toString() || '');
          setBerths(l.berths?.toString() || '');
          setBathrooms(l.bathrooms?.toString() || '');
          setBoatPlanUrl(l.boatPlanUrl || '');
          setAdults(l.maxAdults);
          setChildren(l.maxChildren);
          setHours(l.maxRentalHours?.toString() || '24');
          setCaptainReq(l.requiresCaptain);
          setSkipperOpt(l.skipperAvailable);
          setFuelIncluded(l.fuelIncluded || false);
          setCaptainPrice(l.captainPrice?.toString() || '');
          setSkipperPrice(l.skipperPrice?.toString() || '');
          setIsAtSea(l.isAtSea || false);
          if (l.features) setFeatures(l.features);
          setDesc(l.description);
          setPriceDay(l.price?.toString() || '');
          setCleaningFee(l.cleaningFee?.toString() || '');
          setSecurityDeposit(l.securityDeposit?.toString() || '');
          if (l.services) setServices(l.services);
          setDeliveryToggle(l.deliveryAvailable);
          if (l.deliveryPricing) setDeliveryPricing(l.deliveryPricing as any);
          if (l.images) setPhotos(l.images);
        }
      });
    }
  }, [editId]);

  useEffect(() => {
    setSavedStatus('⏳ Sauvegarde…');
    const t = setTimeout(() => setSavedStatus('💾 Sauvegardé'), 800);
    return () => clearTimeout(t);
  }, [
    currentStep, firstName, lastName, country, phone, languages, 
    title, boatType, year, portCountry, portCity, length, cabins, berths, bathrooms, boatPlanUrl, adults, children, hours, captainReq, skipperOpt, features, isAtSea,
    photos, desc, priceDay, cleaningFee, securityDeposit, services, deliveryToggle, deliveryPricing, markedDays, immediateAvail, selectedOwnerId
  ]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFeature = (f: string) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const addCustomFeature = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customFeature.trim()) {
      e.preventDefault();
      if (!features.includes(customFeature.trim())) {
        setFeatures([...features, customFeature.trim()]);
      }
      setCustomFeature('');
    }
  };

  const removeLang = (l: string) => setLanguages(languages.filter(x => x !== l));
  const addLang = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && langInput.trim()) {
      if (!languages.includes(langInput.trim())) setLanguages([...languages, langInput.trim()]);
      setLangInput('');
    }
  };

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles].slice(0, 40));
    }
  };
  const handlePhotoDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setPhotos(prev => [...prev, ...newFiles].slice(0, 40));
    }
  };
  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const addService = () => {
    if (!svcName || !svcPrice) return;
    setServices([...services, {
      id: Math.random().toString(),
      name: svcName,
      price: parseFloat(svcPrice),
      unit: svcUnit,
      desc: svcDesc,
      isRequired: svcIsRequired
    }]);
    setSvcName('');
    setSvcPrice('');
    setSvcDesc('');
    setSvcIsRequired(false);
  };
  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const renderCalendar = () => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDayOfMonth(y, m);
    
    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = new Date(y, m, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = new Date(y, m, d).getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const status = markedDays[dateStr];
      
      let className = 'cal-day';
      if (isPast) className += ' past';
      if (isToday) className += ' today';
      if (status === 'available') className += ' available';
      if (status === 'blocked') className += ' blocked';
      
      grid.push(
        <div key={dateStr} className={className} onClick={() => {
          if (isPast) return;
          setMarkedDays(prev => {
            const next = { ...prev };
            if (next[dateStr] === calMode) delete next[dateStr];
            else next[dateStr] = calMode;
            return next;
          });
        }}>
          {d}
        </div>
      );
    }
    return grid;
  };

  const getMonthName = () => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'azur_yachts'); // Standardize preset name
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dt7v4cuxm'}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Cloudinary upload error:', data);
        alert(`Erreur d'upload de photo : ${data.error?.message || 'Erreur inconnue'}`);
        return 'https://placehold.co/600x400/223/fff?text=Upload+Failed';
      }
      return data.secure_url;
    } catch (e) {
      console.error(e);
      return 'https://placehold.co/600x400/223/fff?text=Upload+Failed';
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    
    try {
      const processedImages = await Promise.all(photos.map(async (p, idx) => {
        if (p.url) return p;
        const secure_url = await uploadToCloudinary(p);
        return { url: secure_url, publicId: `new_${idx}_${Date.now()}` };
      }));

      const payload = {
        title, description: desc, price: Number(priceDay) || 0, country: portCountry, location: portCity,
        latitude: null, longitude: null, maxAdults: Number(adults) || 1, maxChildren: Number(children) || 0,
        boatType: boatType === 'Autre' ? customBoatType : boatType, boatLength: Number(length) || 0, cabins: Number(cabins) || null, boatYear: Number(year) || 2000, requiresCaptain: captainReq,
        skipperAvailable: skipperOpt, isAtSea, maxRentalHours: Number(hours) || 24, deliveryAvailable: deliveryToggle,
        deliveryPricing: deliveryPricing.map(dp => ({ distance: dp.distance, fee: Number(dp.fee) || 0 })), features,
        fuelIncluded, captainPrice: captainReq ? (Number(captainPrice) || 0) : null, skipperPrice: skipperOpt ? (Number(skipperPrice) || 0) : null,
        cleaningFee: Number(cleaningFee) || 0,
        securityDeposit: Number(securityDeposit) || 0,
        images: processedImages, services, availabilities: [], ownerId: isAdmin ? selectedOwnerId : undefined
      };
      
      const url = editId ? `/api/listings/${editId}` : '/api/listings';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errData = await res.json().catch(() => ({}));
        alert("Erreur lors de la publication : " + (errData.error || ""));
      }
    } catch (e) {
      alert("Erreur réseau");
    }
    setLoading(false);
  };

  // Validations
  const isValidProfil = firstName && lastName && country;
  const isValidTitle = title.length > 0;
  const isValidType = boatType !== '';
  const isValidPhotos = photos.length >= 3;
  const isValidDesc = desc.length > 0;
  const isValidPrice = priceDay && parseFloat(priceDay) > 0;
  const isValidCleaning = cleaningFee && parseFloat(cleaningFee) >= 0;
  const canPublish = isValidProfil && isValidTitle && isValidType && isValidPhotos && isValidDesc && isValidPrice && isValidCleaning;

  const years = Array.from({length: 76}, (_, i) => 2025 - i); // 2025 down to 1950

  const tips = {
    1: [
      {icon:'💡', text:<strong>Prénom et nom</strong>, desc:' seront affichés sur votre annonce. Utilisez vos vrais nom et prénom pour inspirer confiance.'},
      {icon:'🌍', text:<strong>Langues parlées</strong>, desc:' : indiquez toutes les langues dans lesquelles vous pouvez communiquer avec vos clients.'},
      {icon:'📞', text:'Votre numéro de téléphone ne sera jamais affiché publiquement — il sert uniquement à notre équipe.'},
    ],
    2: [
      {icon:'✍️', text:<strong>Le titre</strong>, desc:' est le premier élément vu par les clients. Soyez précis et accrocheur.'},
      {icon:'📏', text:'Renseignez la longueur exacte en mètres — c\'est un critère de recherche important.'},
      {icon:'⚓', text:'Si un capitaine est requis, précisez-le clairement pour éviter les malentendus.'},
    ],
    3: [
      {icon:'📸', text:<strong>Les photos</strong>, desc:' sont le facteur numéro 1 de réservation. Prenez des photos par temps ensoleillé.'},
      {icon:'🖼', text:'La <strong>1ère photo</strong>, desc: est votre photo principale — choisissez la plus flatteuse.'},
      {icon:'📝', text:'La description doit répondre aux questions : Que faire ? Où ? Qu\'est-ce qui est inclus ?'},
    ],
    4: [
      {icon:'💶', text:<strong>Le prix</strong>, desc:' s\'affiche comme prix de base par jour. Étudiez les annonces similaires.'},
      {icon:'🧹', text:<strong>Les frais de nettoyage</strong>, desc:' sont obligatoires et non négociables.'},
      {icon:'📊', text:'Les annonces bien tarifées reçoivent en moyenne 40% plus de demandes.'},
    ],
    5: [
      {icon:'⚙️', text:'Les <strong>services additionnels</strong>, desc: augmentent significativement votre revenu par réservation.'},
      {icon:'🚢', text:'La <strong>livraison dans le port souhaité</strong>, desc: est très appréciée des clients.'},
      {icon:'💡', text:'Définissez des prix cohérents pour vos services.'},
    ],
    6: [
      {icon:'📅', text:'Gardez votre calendrier <strong>toujours à jour</strong>, desc: pour éviter les refus de réservation.'},
      {icon:'🔒', text:'Bloquez immédiatement les dates où vous prévoyez d\'utiliser votre yacht.'},
      {icon:'⚡', text:'L\'option <strong>Disponible immédiatement</strong>, desc: booste votre visibilité.'},
    ],
    7: [
      {icon:'👁', text:'Prenez le temps de <strong>relire attentivement</strong>, desc: chaque section de l\'aperçu.'},
      {icon:'📋', text:'Une fois soumis, votre annonce sera examinée manuellement par notre équipe.'},
      {icon:'🚀', text:'Les annonces complètes avec de belles photos sont validées plus rapidement.'},
    ]
  };

  return (
    <div className="publish-page-container">
      {isModal && (
        <style>{`
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
          .publish-page-container { min-height: 100% !important; }
        `}</style>
      )}
      {/* NAV */}
      {!isModal && (
        <nav className="pub-nav">
          <button className="nav-exit" onClick={() => window.history.back()}>← Quitter</button>
          <a href="/" className="nav-logo">VOY<span>YACHT</span></a>
          <div className="nav-right">
            <span className="nav-save">{savedStatus}</span>
          </div>
        </nav>
      )}

      {/* PROGRESS */}
      {!success && (
        <div className="progress-wrap">
          <div className="progress-bar-fill" style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}></div>
          <div className="steps-nav">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <div key={num} className={`step-nav-item ${currentStep === num ? 'active' : currentStep > num ? 'done' : ''}`} onClick={() => setCurrentStep(num)}>
                <div className="step-nav-num">{currentStep > num ? '✓' : num}</div>
                <div className="step-nav-label">
                  {['Profil', 'Le bateau', 'Photos', 'Tarifs', 'Services', 'Calendrier', 'Publication'][num - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE BODY */}
      <div className="page-body">
        <div className="main-col">

          {/* SUCCESS SCREEN */}
          {success && (
            <div className="success-screen" style={{ display: 'block' }}>
              <span className="success-icon">🎉</span>
              <div className="success-title">Annonce soumise !</div>
              <p className="success-sub">Votre annonce a bien été envoyée à notre équipe de validation. Vous recevrez un email de confirmation à <strong>jean.dupont@gmail.com</strong> dans les 24 à 48 heures ouvrées.<br/><br/>En attendant, vous pouvez la consulter et la modifier depuis votre tableau de bord annonceur.</p>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>Mon tableau de bord</button>
                <button className="btn btn-outline" onClick={() => window.location.reload()}>Publier une autre annonce</button>
              </div>
            </div>
          )}

          {/* STEPS */}
          {!success && (
            <>
              {/* STEP 1 */}
              <div className={`step-panel ${currentStep === 1 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 1 / 7</span>
                  <h1 className="step-title">Votre <em>profil</em> annonceur</h1>
                  <p className="step-desc">Ces informations seront affichées sur votre annonce pour que les clients puissent vous connaître.</p>
                </div>
                <div className="form-card">
                  <div className="form-card-title">Identité</div>
                  {isAdmin && (
                    <div className="field" style={{ background: '#fdf8f0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #f3e8d2' }}>
                      <label className="label" style={{ color: '#927334' }}>[Admin] Attribuer cette annonce à :</label>
                      <select className="select" value={selectedOwnerId} onChange={e => {
                        const val = e.target.value;
                        setSelectedOwnerId(val);
                        const adv = advertisers.find(a => a.id === val);
                        if (adv) {
                          setFirstName(adv.firstName || '');
                          setLastName(adv.lastName || '');
                          setPhone(adv.phone || '');
                          if (adv.countryResidence) setCountry(adv.countryResidence);
                          if (adv.languages && adv.languages.length > 0) setLanguages(adv.languages);
                        }
                      }}>
                        <option value="">(Moi-même)</option>
                        {advertisers.filter(adv => adv.isManagedByAdmin).map(adv => (
                          <option key={adv.id} value={adv.id}>
                            {adv.firstName} {adv.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Prénom <span className="req">*</span></label>
                      <input className="input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label">Nom <span className="req">*</span></label>
                      <input className="input" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Pays de résidence <span className="req">*</span></label>
                      <select className="select" value={country} onChange={e => setCountry(e.target.value)}>
                        <option>🇫🇷 France</option>
                        <option>🇧🇪 Belgique</option>
                        <option>🇨🇭 Suisse</option>
                        <option>🇲🇨 Monaco</option>
                        <option>🇮🇹 Italie</option>
                        <option>🇪🇸 Espagne</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="label">Téléphone</label>
                      <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 XX XX XX XX" />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Langues parlées <span className="req">*</span></label>
                    <div className="tags-wrap" onClick={() => document.getElementById('langs-input')?.focus()}>
                      {languages.map(l => (
                        <span key={l} className="tag">{l} <span className="tag-x" onClick={(e) => { e.stopPropagation(); removeLang(l); }}>×</span></span>
                      ))}
                      <input className="tag-input" id="langs-input" value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={addLang} placeholder="Ajouter une langue…" />
                    </div>
                    <span className="hint">Appuyez sur Entrée pour ajouter</span>
                  </div>
                </div>
                <div className="step-nav-btns">
                  <button className="btn btn-primary" onClick={handleNext}>Continuer →</button>
                </div>
              </div>

              {/* STEP 2 */}
              <div className={`step-panel ${currentStep === 2 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 2 / 7</span>
                  <h1 className="step-title">Votre <em>yacht</em></h1>
                  <p className="step-desc">Renseignez les caractéristiques techniques et pratiques de votre embarcation.</p>
                </div>
                <div className="form-card">
                  <div className="form-card-title">Informations générales</div>
                  <div className="field">
                    <label className="label">Titre de l'annonce <span className="req">*</span></label>
                    <input className="input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Azura Prestige 68 — Côte d'Azur" maxLength={100} />
                    <div className="char-count">{title.length} / 100</div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Type de bateau <span className="req">*</span></label>
                      <select className="select" value={boatType} onChange={e => setBoatType(e.target.value)}>
                        <option value="">Sélectionner…</option>
                        <option>Voilier</option>
                        <option>Catamaran</option>
                        <option>Motor Yacht</option>
                        <option>Superyacht</option>
                        <option value="Autre">Autre</option>
                      </select>
                      {boatType === 'Autre' && (
                        <input className="input" type="text" style={{ marginTop: '0.5rem' }} value={customBoatType} onChange={e => setCustomBoatType(e.target.value)} placeholder="Précisez le type de bateau" />
                      )}
                    </div>
                    <div className="field">
                      <label className="label">Année de mise en service <span className="req">*</span></label>
                      <select className="select" value={year} onChange={e => setYear(e.target.value)}>
                        <option value="">Année…</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Pays du port d'attache <span className="req">*</span></label>
                      <select className="select" value={portCountry} onChange={e => setPortCountry(e.target.value)}>
                        <option value="">Sélectionner…</option>
                        <option>France</option>
                        <option>Grèce</option>
                        <option>Italie</option>
                        <option>Espagne</option>
                        <option>Croatie</option>
                        <option>Monaco</option>
                        <option>Caraïbes</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="label">Ville / Port d'attache <span className="req">*</span></label>
                      <input className="input" type="text" value={portCity} onChange={e => setPortCity(e.target.value)} placeholder="Ex : Nice, Port Lympia" />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Longueur (en mètres)</label>
                    <input className="input" type="number" min="1" max="200" value={length} onChange={e => setLength(e.target.value)} placeholder="Ex : 20.5" />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Cabines</label>
                      <input type="number" className="input" min="0" max="50" value={cabins} onChange={e => setCabins(e.target.value)} placeholder="0" />
                    </div>
                    <div className="field">
                      <label className="label">Couchages</label>
                      <input type="number" className="input" min="0" max="50" value={berths} onChange={e => setBerths(e.target.value)} placeholder="0" />
                    </div>
                    <div className="field">
                      <label className="label">Salles de bain</label>
                      <input type="number" className="input" min="0" max="50" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-card-title">Plan du bateau (Optionnel)</div>
                  <div className="field">
                    <label className="label">Plan du bateau</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        id="boatPlanInputAdmin"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const url = await uploadToCloudinary(e.target.files[0]);
                            setBoatPlanUrl(url);
                          }
                        }} 
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => document.getElementById('boatPlanInputAdmin')?.click()}
                      >
                        Uploader une image
                      </button>
                      <input type="text" className="input" style={{ flex: 1 }} value={boatPlanUrl} onChange={e => setBoatPlanUrl(e.target.value)} placeholder="URL de l'image ou upload..." />
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-card-title">Capacité à bord</div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Adultes (18+) <span className="req">*</span></label>
                      <div className="counter-wrap">
                        <button className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}>−</button>
                        <span className="counter-val">{adults}</span>
                        <button className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Enfants (1-7 ans)</label>
                      <div className="counter-wrap">
                        <button className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}>−</button>
                        <span className="counter-val">{children}</span>
                        <button className="counter-btn" onClick={() => setChildren(children + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Heures de location autorisées par jour <span className="req">*</span></label>
                    <select className="select" value={hours} onChange={e => setHours(e.target.value)}>
                      <option value="">Sélectionner…</option>
                      <option value="4">4 heures</option>
                      <option value="8">8 heures</option>
                      <option value="12">12 heures</option>
                      <option value="24">24 heures (journée complète)</option>
                    </select>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-card-title">Équipage & navigation</div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <div className="toggle-label">Carburant inclus</div>
                      <div className="toggle-desc">Cochez si le carburant est inclus dans le prix de la location</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={fuelIncluded} onChange={e => setFuelIncluded(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="toggle-row" style={{ marginTop: '1rem' }}>
                    <div className="toggle-info">
                      <div className="toggle-label">Capitaine (Optionnel)</div>
                      <div className="toggle-desc">Vous proposez un capitaine en option pour les clients</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={captainReq} onChange={e => setCaptainReq(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  {captainReq && (
                    <div className="field" style={{ marginTop: '0.5rem', marginBottom: '1rem', marginLeft: '1rem' }}>
                      <label className="label">Coût par jour (€) pour le capitaine</label>
                      <input className="input" type="number" min="0" value={captainPrice} onChange={e => setCaptainPrice(e.target.value)} placeholder="Ex: 200" />
                    </div>
                  )}
                  <div className="toggle-row" style={{ marginTop: '1rem' }}>
                    <div className="toggle-info">
                      <div className="toggle-label">Skipper (Optionnel)</div>
                      <div className="toggle-desc">Vous proposez un skipper en option pour les clients</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={skipperOpt} onChange={e => setSkipperOpt(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  {skipperOpt && (
                    <div className="field" style={{ marginTop: '0.5rem', marginBottom: '1rem', marginLeft: '1rem' }}>
                      <label className="label">Coût par jour (€) pour le skipper</label>
                      <input className="input" type="number" min="0" value={skipperPrice} onChange={e => setSkipperPrice(e.target.value)} placeholder="Ex: 150" />
                    </div>
                  )}
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <div className="toggle-label">Bateau en mer / Hors port d'attache</div>
                      <div className="toggle-desc">Affiche une alerte pour indiquer que le bateau n'est pas au port (des frais de convoyage peuvent s'appliquer)</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={isAtSea} onChange={e => setIsAtSea(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-card-title">Équipements à bord</div>
                  <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {Array.from(new Set([...PREDEFINED_FEATURES, ...features])).map(f => (
                      <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }} />
                        {f}
                      </label>
                    ))}
                  </div>
                  <div className="field">
                    <label className="label">Ajouter un équipement personnalisé</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Appuyez sur Entrée pour ajouter..." 
                      value={customFeature} 
                      onChange={e => setCustomFeature(e.target.value)} 
                      onKeyDown={addCustomFeature} 
                    />
                  </div>
                </div>

                <div className="step-nav-btns">
                  <button className="btn btn-outline" onClick={handlePrev}>← Retour</button>
                  <button className="btn btn-primary" onClick={handleNext}>Continuer →</button>
                </div>
              </div>

              {/* STEP 3 */}
              <div className={`step-panel ${currentStep === 3 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 3 / 7</span>
                  <h1 className="step-title">Photos &amp; <em>description</em></h1>
                  <p className="step-desc">Des photos de qualité multiplient les réservations par 3. Minimum 3 photos requises, maximum 40.</p>
                </div>
                <div className="form-card">
                  <div className="form-card-title">Photos du yacht</div>
                  <div className="photo-counter">
                    <span className="photo-counter-text">Photos ajoutées</span>
                    <span className="photo-counter-num"><span>{photos.length}</span> / 40</span>
                  </div>
                  <input type="file" ref={fileInputRef} multiple accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
                  <div className="photo-drop-zone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                    onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                    onDrop={handlePhotoDrop}>
                    <span className="drop-icon">🖼</span>
                    <div className="drop-title">Glissez vos photos ici</div>
                    <div className="drop-hint">JPG, PNG, WEBP — 10 Mo max par image</div>
                    <div className="drop-btn">Choisir des fichiers</div>
                  </div>
                  <div className="photo-grid">
                    {photos.map((f, i) => (
                      <div 
                        key={i} 
                        className={`photo-thumb ${i === 0 ? 'first-photo' : ''}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedIdx(i);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedIdx === null || draggedIdx === i) return;
                          const newPhotos = [...photos];
                          const draggedPhoto = newPhotos[draggedIdx];
                          newPhotos.splice(draggedIdx, 1);
                          newPhotos.splice(i, 0, draggedPhoto);
                          setPhotos(newPhotos);
                          setDraggedIdx(null);
                        }}
                        style={{ cursor: 'grab' }}
                      >
                        <img src={f instanceof File ? URL.createObjectURL(f) : (f.url || 'https://placehold.co/600x400/223/fff?text=No+Image')} className="photo-thumb-img" alt="Yacht preview" />
                        <div className="photo-thumb-overlay">
                          <button className="photo-thumb-del" onClick={(e) => { e.stopPropagation(); removePhoto(i); }}>✕</button>
                        </div>
                        <div className="photo-thumb-num">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-card">
                  <div className="form-card-title">Description</div>
                  <div className="field">
                    <label className="label">Description complète <span className="req">*</span></label>
                    <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Décrivez votre yacht en détail : ses atouts, les expériences possibles, la destination, les équipements remarquables…" rows={6}></textarea>
                    <div className="char-count">{desc.length} / 2000</div>
                  </div>
                </div>
                <div className="step-nav-btns">
                  <button className="btn btn-outline" onClick={handlePrev}>← Retour</button>
                  <button className="btn btn-primary" onClick={handleNext}>Continuer →</button>
                </div>
              </div>

              {/* STEP 4 */}
              <div className={`step-panel ${currentStep === 4 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 4 / 7</span>
                  <h1 className="step-title">Votre <em>tarification</em></h1>
                  <p className="step-desc">Définissez votre prix de location et les frais de nettoyage obligatoires.</p>
                </div>
                <div className="form-card">
                  <div className="form-card-title">Prix de location</div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Prix par jour (€) <span className="req">*</span></label>
                      <input className="input" type="number" min="100" value={priceDay} onChange={e => setPriceDay(e.target.value)} placeholder="Ex : 4800" />
                      <span className="hint">Prix affiché aux clients sur votre annonce</span>
                    </div>
                    <div className="field">
                      <label className="label">Frais de nettoyage (€) <span className="req">*</span></label>
                      <input className="input" type="number" min="0" value={cleaningFee} onChange={e => setCleaningFee(e.target.value)} placeholder="Ex : 350" />
                      <span className="hint">Obligatoires — ajoutés automatiquement à chaque réservation</span>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label className="label">Caution (€) <span className="req">*</span></label>
                      <input className="input" type="number" min="0" value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} placeholder="Ex : 1500" />
                      <span className="hint">Sera demandée avant l'embarquement (empreinte bancaire)</span>
                    </div>
                  </div>
                  <div className="info-box navy" style={{ marginTop: '.5rem' }}>
                    💡 Le prix affiché est le tarif de location par jour. Les frais de nettoyage et les services optionnels s'ajouteront dans le récapitulatif de réservation.
                  </div>
                </div>
                <div className="step-nav-btns">
                  <button className="btn btn-outline" onClick={handlePrev}>← Retour</button>
                  <button className="btn btn-primary" onClick={handleNext}>Continuer →</button>
                </div>
              </div>

              {/* STEP 5 */}
              <div className={`step-panel ${currentStep === 5 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 5 / 7</span>
                  <h1 className="step-title">Services <em>additionnels</em></h1>
                  <p className="step-desc">Proposez des services optionnels pour enrichir l'expérience de vos clients.</p>
                </div>
                <div className="form-card">
                  <div className="form-card-title">Services inclus</div>
                  <div className="services-list">
                    <div className="service-item required-item">
                      <span className="service-icon">🧹</span>
                      <div className="service-info">
                        <div className="service-name">Nettoyage du yacht</div>
                        <div className="service-unit">Par réservation · Obligatoire</div>
                      </div>
                      <div className="service-price">€{cleaningFee || '0'}</div>
                    </div>
                    {services.map(s => (
                      <div key={s.id} className="service-item">
                        <span className="service-icon">✨</span>
                        <div className="service-info">
                          <div className="service-name">{s.name}</div>
                          <div className="service-unit">
                            {s.unit === 'PER_BOOKING' ? 'Par réservation' : s.unit === 'PER_DAY' ? 'Par jour' : 'Par personne'}
                            {s.isRequired ? ' · Obligatoire' : ''}
                          </div>
                        </div>
                        <div className="service-price">€{s.price}</div>
                        <button className="service-del" onClick={() => removeService(s.id)}>✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="add-service-form">
                    <div className="add-service-title">Ajouter un service</div>
                    <div className="field-row">
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Nom du service <span className="req">*</span></label>
                        <input className="input" type="text" value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="Ex : Chef à bord" />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Prix (€) <span className="req">*</span></label>
                        <input className="input" type="number" min="0" value={svcPrice} onChange={e => setSvcPrice(e.target.value)} placeholder="Ex : 350" />
                      </div>
                    </div>
                    <div className="field" style={{ marginTop: '1rem' }}>
                      <label className="label">Unité de facturation</label>
                      <div className="unit-selector">
                        <button className={`unit-btn ${svcUnit === 'PER_BOOKING' ? 'active' : ''}`} onClick={() => setSvcUnit('PER_BOOKING')}>Par réservation</button>
                        <button className={`unit-btn ${svcUnit === 'PER_DAY' ? 'active' : ''}`} onClick={() => setSvcUnit('PER_DAY')}>Par jour</button>
                        <button className={`unit-btn ${svcUnit === 'PER_PERSON' ? 'active' : ''}`} onClick={() => setSvcUnit('PER_PERSON')}>Par personne</button>
                      </div>
                    </div>
                    <div className="field" style={{ marginTop: '1rem' }}>
                      <label className="label">Description (optionnel)</label>
                      <input className="input" type="text" value={svcDesc} onChange={e => setSvcDesc(e.target.value)} placeholder="Ex : Chef professionnel disponible pour le déjeuner et le dîner" />
                    </div>
                    <div className="toggle-row" style={{ marginTop: '1rem', background: 'transparent', padding: 0 }}>
                      <div className="toggle-info">
                        <div className="toggle-label" style={{ fontSize: '0.95rem' }}>Rendre ce service obligatoire</div>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" checked={svcIsRequired} onChange={e => setSvcIsRequired(e.target.checked)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={addService}>+ Ajouter ce service</button>
                  </div>

                  <div className="toggle-row" style={{ marginTop: '1rem' }}>
                    <div className="toggle-info">
                      <div className="toggle-label">Livraison dans le port souhaité</div>
                      <div className="toggle-desc">Vous pouvez présenter le yacht dans le port choisi par le client</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={deliveryToggle} onChange={e => setDeliveryToggle(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  {deliveryToggle && (
                    <div style={{ marginTop: '.9rem' }}>
                      <label className="label">Tarifs de livraison par distance/zone <span className="req">*</span></label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {deliveryPricing.map((dp, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input className="input" type="text" value={dp.distance} onChange={e => {
                              const newDp = [...deliveryPricing];
                              newDp[idx].distance = e.target.value;
                              setDeliveryPricing(newDp);
                            }} placeholder="Ex: < 50km ou Monaco" style={{ flex: 1 }} />
                            <input className="input" type="number" min="0" value={dp.fee} onChange={e => {
                              const newDp = [...deliveryPricing];
                              newDp[idx].fee = e.target.value;
                              setDeliveryPricing(newDp);
                            }} placeholder="Prix (€)" style={{ width: '120px' }} />
                            <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem' }} onClick={() => {
                              setDeliveryPricing(deliveryPricing.filter((_, i) => i !== idx));
                            }}>✕</button>
                          </div>
                        ))}
                        <button className="btn btn-outline" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => {
                          setDeliveryPricing([...deliveryPricing, { distance: '', fee: '' }]);
                        }}>+ Ajouter un tarif</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="step-nav-btns">
                  <button className="btn btn-outline" onClick={handlePrev}>← Retour</button>
                  <button className="btn btn-primary" onClick={handleNext}>Continuer →</button>
                </div>
              </div>

              {/* STEP 6 */}
              <div className={`step-panel ${currentStep === 6 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 6 / 7</span>
                  <h1 className="step-title">Vos <em>disponibilités</em></h1>
                  <p className="step-desc">Sélectionnez les dates où votre yacht est disponible, ou bloquez des dates pour usage personnel.</p>
                </div>
                <div className="form-card">
                  <div className="cal-mode-switch">
                    <button className={`cal-mode-btn ${calMode === 'available' ? 'active' : ''}`} onClick={() => setCalMode('available')}>📅 Marquer disponible</button>
                    <button className={`cal-mode-btn ${calMode === 'blocked' ? 'active' : ''}`} onClick={() => setCalMode('blocked')}>🔒 Bloquer des dates</button>
                  </div>
                  <div className="cal-toolbar">
                    <button className="cal-nav-btn" onClick={() => setCalMonthOffset(prev => prev - 1)}>‹</button>
                    <span className="cal-month">{getMonthName()}</span>
                    <button className="cal-nav-btn" onClick={() => setCalMonthOffset(prev => prev + 1)}>›</button>
                  </div>
                  <div className="cal-grid">
                    <div className="cal-dow">Dim</div><div className="cal-dow">Lun</div><div className="cal-dow">Mar</div>
                    <div className="cal-dow">Mer</div><div className="cal-dow">Jeu</div><div className="cal-dow">Ven</div><div className="cal-dow">Sam</div>
                    {renderCalendar()}
                  </div>
                  <div className="cal-legend">
                    <div className="cal-leg"><div className="cal-leg-dot avail"></div>Disponible</div>
                    <div className="cal-leg"><div className="cal-leg-dot block"></div>Bloqué</div>
                  </div>
                  <div className="immediate-check" onClick={() => setImmediateAvail(!immediateAvail)}>
                    <div className={`immediate-check-box ${immediateAvail ? 'checked' : ''}`}></div>
                    <span className="immediate-label">✓ Disponible immédiatement (dès aujourd'hui) — aucune date spécifique requise</span>
                  </div>
                </div>
                <div className="step-nav-btns">
                  <button className="btn btn-outline" onClick={handlePrev}>← Retour</button>
                  <button className="btn btn-primary" onClick={handleNext}>Continuer →</button>
                </div>
              </div>

              {/* STEP 7 */}
              <div className={`step-panel ${currentStep === 7 ? 'active' : ''}`}>
                <div className="step-header">
                  <span className="step-eyebrow">Étape 7 / 7</span>
                  <h1 className="step-title">Aperçu &amp; <em>publication</em></h1>
                  <p className="step-desc">Vérifiez votre annonce avant de la soumettre à notre équipe pour validation.</p>
                </div>

                {/* Preview card */}
                <div className="preview-card">
                  <div className="preview-img">
                    <div className="preview-img-grid"></div>
                    {photos.length > 0 ? (
                      <img src={photos[0] instanceof File ? URL.createObjectURL(photos[0]) : (photos[0].url || 'https://placehold.co/600x400/223/fff?text=No+Image')} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="preview-img-placeholder">⚓</div>
                    )}
                    <span className="preview-badge">Nouvelle annonce</span>
                  </div>
                  <div className="preview-body">
                    <div className="preview-type">{boatType || 'Type de bateau'}</div>
                    <div className="preview-name">{title || 'Titre de votre annonce'}</div>
                    <div className="preview-loc">📍 {portCity || 'Ville'}, {portCountry || 'Pays'}</div>
                    <div className="preview-specs">
                      <span className="preview-spec">⏱ <strong>{hours || '—'}h</strong> loc./jour</span>
                      <span className="preview-spec">👥 <strong>{adults}</strong> adultes</span>
                      <span className="preview-spec">🌍 <strong>{portCountry || '—'}</strong></span>
                    </div>
                    <div className="preview-pills">
                      <span className="preview-pill">{captainReq ? 'Captain Req.' : 'No Captain'}</span>
                      <span className="preview-pill">{skipperOpt ? 'Skipper Opt.' : 'No Skipper'}</span>
                    </div>
                    <div className="preview-footer">
                      <div className="preview-price">€{priceDay || '—'} <small>/ jour</small></div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>⭐ Nouvelle annonce</div>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--text-light)', marginBottom: '.75rem' }}>Checklist de validation</div>
                  <div className="checklist">
                    <div className={`check-item-row ${isValidProfil ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidProfil ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidProfil ? 'Profil annonceur renseigné' : 'Profil incomplet'}</span>
                    </div>
                    <div className={`check-item-row ${isValidTitle ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidTitle ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidTitle ? 'Titre de l\'annonce renseigné' : 'Titre de l\'annonce manquant'}</span>
                    </div>
                    <div className={`check-item-row ${isValidType ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidType ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidType ? 'Type de bateau sélectionné' : 'Type de bateau non sélectionné'}</span>
                    </div>
                    <div className={`check-item-row ${isValidPhotos ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidPhotos ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidPhotos ? `${photos.length} photos ajoutées` : `Minimum 3 photos requises (${photos.length} ajoutées)`}</span>
                    </div>
                    <div className={`check-item-row ${isValidDesc ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidDesc ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidDesc ? 'Description ajoutée' : 'Description manquante'}</span>
                    </div>
                    <div className={`check-item-row ${isValidPrice ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidPrice ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidPrice ? 'Prix de location défini' : 'Prix de location non défini'}</span>
                    </div>
                    <div className={`check-item-row ${isValidCleaning ? 'ok' : 'nok'}`}>
                      <span className="check-item-icon">{isValidCleaning ? '✅' : '⚠️'}</span>
                      <span className="check-item-text">{isValidCleaning ? 'Frais de nettoyage définis' : 'Frais de nettoyage non définis'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-box gold">
                  📋 Après publication, votre annonce sera examinée par notre équipe. Vous recevrez un email de confirmation sous 24 à 48 heures ouvrées.
                </div>

                <button className={`publish-btn ${loading ? 'loading' : ''}`} onClick={handlePublish} disabled={!canPublish || loading}>
                  ⚓ Publier mon annonce
                  <div className="publish-btn-loader"><div className="spinner"></div></div>
                </button>

                <div className="step-nav-btns">
                  <button className="btn btn-outline" onClick={handlePrev}>← Retour</button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="sidebar-col">
          <div className="sidebar-card">
            <div className="sidebar-title">Conseils</div>
            <div id="sidebar-tips">
              {tips[currentStep as keyof typeof tips]?.map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-icon">{tip.icon}</div>
                  <div className="tip-text">{tip.text}{(tip as any).desc}</div>
                </div>
              ))}
            </div>
          </div>

          {currentStep > 1 && !success && (
            <div className="sidebar-card">
              <div className="sidebar-title">Aperçu live</div>
              <div style={{ background: 'var(--navy)', padding: '.75rem', marginBottom: '.75rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(184, 152, 90, .5) 8px, rgba(184, 152, 90, .5) 9px)' }}></div>
                <div style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--gold)', marginBottom: '.2rem', position: 'relative', zIndex: 1 }}>{boatType || 'Type'}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#fff', position: 'relative', zIndex: 1 }}>{title || 'Nom du yacht'}</div>
                <div style={{ fontSize: '.68rem', color: 'rgba(255, 255, 255, .4)', marginTop: '.2rem', position: 'relative', zIndex: 1 }}>📍 {portCity ? `${portCity}, ${portCountry}` : 'Destination'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--text-mid)' }}>
                <span>€{priceDay || '—'} / jour</span>
                <span>{adults + children} personnes</span>
              </div>
            </div>
          )}
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

export default function PublishPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>}>
      <PublishForm />
    </Suspense>
  );
}
