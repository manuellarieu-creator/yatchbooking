'use client';

import { useEffect, useRef } from 'react';

export default function AboutClientLogic() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const statsObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Scroll Reveal Observer
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (observerRef.current) observerRef.current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));

    // Counter Animation
    const animateCounter = (el: Element, target: number, suffix = '', duration = 1800) => {
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(start).toLocaleString('fr-FR') + suffix;
      }, 16);
    };

    statsObserverRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const nums = entry.target.querySelectorAll('.stat-num');
          const configs = [
            { val: 340, suffix: '+' },
            { val: 3, suffix: '' },
            { val: 12000, suffix: '+' },
            { val: 98, suffix: '%' }
          ];
          
          nums.forEach((num, i) => {
            const numEl = num as HTMLElement;
            // Only animate if not already animated to avoid re-triggering
            if (!numEl.dataset.animated) {
              animateCounter(numEl, configs[i].val, configs[i].suffix);
              numEl.dataset.animated = 'true';
            }
          });
          if (statsObserverRef.current) statsObserverRef.current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) statsObserverRef.current.observe(statsBar);

    return () => {
      observerRef.current?.disconnect();
      statsObserverRef.current?.disconnect();
    };
  }, []);

  return null;
}
