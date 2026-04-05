'use client';

import { useEffect } from 'react';

export function VhFix() {
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight * 0.01;
      const ovh = window.outerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--rvh', `${vh}px`);
      document.documentElement.style.setProperty('--ovh', `${ovh}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return null;
}
