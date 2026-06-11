'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './favorites.css';

export default function FavoritesPage() {
  const [favoritesData, setFavoritesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastMsg, setToastMsg] = useState('');
  const [toastIcon, setToastIcon] = useState('✅');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (data.favorites) {
          setFavoritesData(data.favorites);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const triggerToast = (msg: string, icon = '✅') => {
    setToastMsg(msg);
    setToastIcon(icon);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const removeFavorite = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });
      const data = await res.json();
      if (data.success || data.action === 'removed') {
        setFavoritesData(prev => prev.filter(f => f.listing.id !== listingId));
        triggerToast('Retiré des favoris', '💔');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="favorites-container"><div style={{ padding: '4rem', textAlign: 'center' }}>Chargement de vos favoris...</div></div>;
  }

  return (
    <div className="favorites-container">
      <div className="page-wrap">
        {/* HEADER */}
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-eyebrow">Espace client</span>
            <h1 className="page-title">Mes <em>favoris</em></h1>
            <p className="page-subtitle">Retrouvez tous les yachts que vous avez sauvegardés pour vos futurs voyages.</p>
          </div>
          <Link href="/listings" className="btn btn-gold" style={{ width: 'auto', textDecoration: 'none' }}>
            ⚓ Explorer les yachts
          </Link>
        </div>

        {/* FAVORITES LIST */}
        <div className="favorites-grid">
          {favoritesData.length === 0 ? (
            <div className="empty-state reveal">
              <div className="empty-icon">💔</div>
              <div className="empty-title">Aucun favori</div>
              <div className="empty-sub">Vous n'avez pas encore sauvegardé de yacht dans vos favoris.</div>
            </div>
          ) : (
            favoritesData.map((fav, i) => (
              <Link href={`/yacht/${fav.listing.id}`} key={fav.id} className="fav-card reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="fav-img">
                  <div className="fav-img-inner" style={{ background: fav.listing.images?.[0]?.url ? `url(${fav.listing.images[0].url}) center/cover` : 'linear-gradient(135deg, #1a3a5a, #0a2040)' }}></div>
                  <button className="fav-heart-btn" onClick={(e) => removeFavorite(e, fav.listing.id)}>
                    ❤️
                  </button>
                </div>
                <div className="fav-body">
                  <div className="fav-type">{fav.listing.boatType || 'Yacht'}</div>
                  <div className="fav-name">{fav.listing.title}</div>
                  <div className="fav-location">📍 {fav.listing.location}</div>
                  
                  <div className="fav-specs">
                    <span className="spec"><strong>{fav.listing.maxAdults + (fav.listing.maxChildren || 0)}</strong> invités</span>
                    <span className="spec"><strong>{fav.listing.reviewCount > 0 ? fav.listing.averageRating.toFixed(1) : '-'}</strong> ⭐</span>
                  </div>

                  <div className="fav-footer">
                    <div className="fav-price">€{fav.listing.price?.toLocaleString()} <span>/ jour</span></div>
                    <span className="btn-book-sm">Réserver</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span className="toast-icon">{toastIcon}</span>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
