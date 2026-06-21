'use client';

import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import './floating-quote.css';

export default function FloatingQuoteButton() {
  return (
    <Link href="/contact" className="floating-quote-btn">
      <MessageSquareText size={20} />
      <span>Demander un devis</span>
    </Link>
  );
}
