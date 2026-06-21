'use client';

import { useState } from 'react';
import { Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './floating-quote.css';

export default function FloatingChatButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartSupportChat = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/conversations/support', { method: 'POST' });
      if (res.status === 401) {
        // User not logged in, redirect to login page
        router.push('/auth');
        return;
      }
      const data = await res.json();
      if (data.conversation) {
        router.push(`/dashboard?tab=messages&convId=${data.conversation.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button onClick={handleStartSupportChat} className="floating-chat-btn" disabled={isSubmitting}>
      <Headphones size={20} />
      <span>{isSubmitting ? 'Connexion...' : 'Support Client'}</span>
    </button>
  );
}
