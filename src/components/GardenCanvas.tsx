"use client";

import { useEffect, useRef } from 'react';
import { useAppContext } from '@/lib/context';

export default function GardenCanvas() {
  const { user } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let intervalId: NodeJS.Timeout;

    const spawnFlower = () => {
      const types = [];
      if (user.total_red_flowers > 0) types.push({ icon: 'fa-fan fa-spin', color: 'text-brand-red' });
      if (user.total_purple_flowers > 0) types.push({ icon: 'fa-star', color: 'text-brand-purple' });
      
      if (types.length === 0) return;

      const type = types[Math.floor(Math.random() * types.length)];
      const size = Math.random() * 1.5 + 0.5;
      const left = Math.random() * 100;
      const duration = Math.random() * 4 + 6;

      const el = document.createElement('i');
      el.className = `fa-solid ${type.icon} ${type.color} flower-particle opacity-40`;
      el.style.left = `${left}%`;
      el.style.fontSize = `${size}rem`;
      el.style.animationDuration = `${duration}s`;

      container.appendChild(el);

      setTimeout(() => {
        if (container.contains(el)) {
          el.remove();
        }
      }, duration * 1000);
    };

    intervalId = setInterval(spawnFlower, 800);

    return () => {
      clearInterval(intervalId);
      if (container) container.innerHTML = '';
    };
  }, [user.total_red_flowers, user.total_purple_flowers]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none opacity-50" />;
}
