'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [params.id]);

  if (isLoading) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--navy)' }}>Chargement du profil...</div>;
  }

  if (!user) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--navy)' }}>Profil introuvable.</div>;
  }

  const avgRating = user.receivedReviews?.length 
    ? (user.receivedReviews.reduce((a:any, b:any) => a + b.rating, 0) / user.receivedReviews.length).toFixed(1) 
    : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 2rem', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Left Column - Profile Card */}
        <div style={{ flex: '0 0 350px', background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--sand)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #d4af37)', color: 'white', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}>
              {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.firstName.charAt(0)}
            </div>
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>{user.firstName} {user.lastName}</h1>
            {user.videoVerified && <div style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 500 }}>✓ Profil vérifié</div>}
          </div>

          <div style={{ borderTop: '1px solid var(--sand)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Avis</span>
              <strong 
                onClick={() => user.receivedReviews?.length > 0 && setIsReviewsModalOpen(true)}
                style={{ cursor: user.receivedReviews?.length > 0 ? 'pointer' : 'default', textDecoration: user.receivedReviews?.length > 0 ? 'underline' : 'none', color: 'var(--gold)' }}
              >
                {Number(avgRating) > 0 ? `${avgRating} ★ (${user.receivedReviews.length} avis)` : 'Nouveau'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Membre depuis</span>
              <strong>{new Date(user.createdAt).getFullYear()}</strong>
            </div>
            {user.countryResidence && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Résidence</span>
                <strong>{user.countryResidence.toUpperCase()}</strong>
              </div>
            )}
            {user.languages && user.languages.length > 0 && (
              <div>
                <div style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Langues parlées</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {user.languages.map((l: string, i: number) => (
                    <span key={i} style={{ background: 'var(--sand-light)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Link href={`/dashboard?tab=messages&new_chat_with=${user.id}`} passHref>
            <button style={{ width: '100%', padding: '0.8rem', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '4px', marginTop: '2rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, transition: 'background 0.3s' }}>
              Contacter {user.firstName}
            </button>
          </Link>
        </div>

        {/* Right Column - Listings & Reviews */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>À propos de {user.firstName}</h2>
          <p style={{ lineHeight: 1.6, color: 'var(--text-mid)', marginBottom: '3rem' }}>
            {user.bio || "Ce propriétaire n'a pas encore rédigé de description."}
          </p>

          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>Les bateaux de {user.firstName} ({user.listings?.length || 0})</h3>
          {user.listings?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {user.listings.map((l: any) => (
                <Link href={`/yacht/${l.id}`} key={l.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--sand)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <div style={{ height: '180px', background: l.images?.[0]?.url ? `url(${l.images[0].url}) center/cover` : 'var(--navy-mid)' }}></div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.2rem' }}>{l.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.8rem' }}>📍 {l.location}, {l.country}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--primary)' }}>€{l.price} <small style={{ color: 'var(--text-light)', fontWeight: 400 }}>/ jour</small></strong>
                        <span style={{ fontSize: '0.85rem' }}>★ {l.averageRating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic', marginBottom: '3rem' }}>Aucune annonce active.</p>
          )}

        </div>
      </div>

      {/* REVIEWS MODAL */}
      {isReviewsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsReviewsModalOpen(false)}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Avis sur {user.firstName}</h3>
              <button onClick={() => setIsReviewsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            {user.receivedReviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {user.receivedReviews.map((rev: any) => (
                  <div key={rev.id} style={{ padding: '1.5rem', background: '#fcfcfc', border: '1px solid var(--sand)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--navy-mid)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                        {rev.author?.avatar ? <img src={rev.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} alt="" /> : rev.author?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{rev.author?.firstName} {rev.author?.lastName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', color: 'var(--gold)' }}>
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-mid)' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Aucun avis pour le moment.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
