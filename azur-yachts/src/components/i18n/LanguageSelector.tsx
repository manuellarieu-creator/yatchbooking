'use client';

import { useState, useEffect } from 'react';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flagUrl: 'https://flagcdn.com/w20/fr.png' },
  { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w20/gb.png' },
  { code: 'es', label: 'Español', flagUrl: 'https://flagcdn.com/w20/es.png' },
  { code: 'de', label: 'Deutsch', flagUrl: 'https://flagcdn.com/w20/de.png' },
  { code: 'da', label: 'Dansk', flagUrl: 'https://flagcdn.com/w20/dk.png' },
  { code: 'it', label: 'Italiano', flagUrl: 'https://flagcdn.com/w20/it.png' },
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('fr');
  const [isOpen, setIsOpen] = useState(false);

  // Try to detect the current language from cookies or google translate element
  useEffect(() => {
    const cookieLang = document.cookie.split('; ').find(row => row.startsWith('googtrans='))?.split('=')[1];
    if (cookieLang) {
      const code = cookieLang.split('/').pop();
      if (code && LANGUAGES.find(l => l.code === code)) {
        setCurrentLang(code);
      }
    }
  }, []);

  const changeLanguage = (code: string) => {
    setCurrentLang(code);
    setIsOpen(false);
    
    // Find Google Translate combo box
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    } else {
      // If the combo box isn't ready, set the cookie directly and reload
      document.cookie = `googtrans=/fr/${code}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/fr/${code}; path=/;`;
      window.location.reload();
    }
  };

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative" style={{ display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:text-white transition-colors"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <img src={activeLang.flagUrl} alt={activeLang.code} style={{ width: '20px', borderRadius: '2px', objectFit: 'cover' }} />
        <span className="uppercase tracking-wider text-sm font-medium">{activeLang.code}</span>
        <span className="text-[10px] opacity-70">▼</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
          style={{ top: '100%', right: '0', position: 'absolute', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '6px', minWidth: '150px' }}
        >
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', padding: '10px 16px', background: currentLang === lang.code ? '#f8fafc' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#1e293b' }}
            >
              <img src={lang.flagUrl} alt={lang.code} style={{ width: '20px', borderRadius: '2px', objectFit: 'cover' }} />
              <span className="uppercase text-xs font-semibold text-gray-400 w-6">{lang.code}</span>
              <span style={{ fontWeight: currentLang === lang.code ? 600 : 400 }}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
