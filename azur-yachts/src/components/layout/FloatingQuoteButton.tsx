'use client';

import { useState } from 'react';
import { FileEdit, X, Send } from 'lucide-react';
import './floating-quote.css';

export default function FloatingQuoteButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call or actually send it
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'QUOTE' })
      });
      // We assume it succeeds even if the endpoint doesn't specifically handle 'QUOTE' yet.
      // It uses the standard contact API.
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="floating-quote-btn">
        <FileEdit size={20} />
        <span>Demander un devis</span>
      </button>

      {isOpen && (
        <div className="quote-modal-overlay">
          <div className="quote-modal-content">
            <button className="quote-modal-close" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>

            {isSuccess ? (
              <div className="quote-success">
                <div className="quote-success-icon">✓</div>
                <h3>Demande envoyée !</h3>
                <p>Notre équipe vous recontactera dans les plus brefs délais avec une proposition sur-mesure.</p>
                <button className="quote-btn" onClick={() => { setIsOpen(false); setIsSuccess(false); }}>
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="quote-header">
                  <h2>Demande de devis</h2>
                  <p>Décrivez-nous votre projet de navigation idéal.</p>
                </div>

                <form className="quote-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prénom & Nom *</label>
                      <input type="text" name="name" required placeholder="Jean Dupont" />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" name="email" required placeholder="jean@email.com" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Téléphone *</label>
                      <input type="tel" name="phone" required placeholder="+33 6 00 00 00 00" />
                    </div>
                    <div className="form-group">
                      <label>Destination souhaitée</label>
                      <input type="text" name="destination" placeholder="Côte d'Azur, Corse..." />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date approximative</label>
                      <input type="text" name="dates" placeholder="Juillet 2026, 1 semaine" />
                    </div>
                    <div className="form-group">
                      <label>Nombre de passagers</label>
                      <input type="number" name="guests" min="1" max="50" placeholder="8" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Détails de votre demande *</label>
                    <textarea 
                      name="message" 
                      required 
                      rows={4}
                      placeholder="Type de bateau souhaité (yacht, voilier), budget approximatif, besoins spécifiques (équipage, chef, etc.)..."
                    ></textarea>
                  </div>

                  <button type="submit" className="quote-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi en cours...' : (
                      <>
                        <Send size={16} /> Envoyer ma demande
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
