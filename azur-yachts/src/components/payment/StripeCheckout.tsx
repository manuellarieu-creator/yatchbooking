'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required for some payment methods, but we can also use redirect: 'if_required' 
        // to stay on the same page for cards.
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Une erreur est survenue lors du paiement.');
      setIsLoading(false);
    } else {
      // Payment successful!
      setIsLoading(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PaymentElement />
      {error && <div className="error-card mt-4" style={{ color: 'var(--danger)', background: 'rgba(138,26,26,.08)', border: '1px solid var(--danger-bdr)', padding: '1rem', borderRadius: '4px' }}>{error}</div>}
      
      <button 
        type="submit" 
        disabled={isLoading || !stripe || !elements} 
        className={`pay-btn mt-6 w-full ${isLoading ? 'loading' : ''}`}
        style={{ marginTop: '1.5rem', width: '100%' }}
      >
        Payer €{(amount).toLocaleString()}
        {isLoading && <div className="pay-btn-loader"><div className="spinner"></div></div>}
      </button>
      <p className="pay-footnote mt-4 text-center">🔒 Vos données bancaires sont chiffrées et traitées par Stripe. VoyYacht ne stocke jamais vos informations de carte.</p>
    </form>
  );
}

export default function StripeCheckout({ bookingId, amount, onSuccess }: { bookingId: string, amount: number, onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    if (bookingId) {
      fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            console.error('Failed to get client secret:', data);
          }
        })
        .catch(console.error);
    }
  }, [bookingId]);

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="spinner" style={{ width: '30px', height: '30px', borderTopColor: 'var(--gold)' }}></div>
        <p className="mt-4 text-sm" style={{ color: 'var(--text-mid)', marginTop: '1rem' }}>Chargement du module de paiement sécurisé...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#b8985a' } } }}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
}
