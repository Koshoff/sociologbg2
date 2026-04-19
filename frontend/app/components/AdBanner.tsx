'use client';

import { useEffect, useState } from 'react';

export interface Banner {
  href: string;
  alt: string;
  image?: string;   // path relative to /public, e.g. '/ads/banner1.jpg'
  label?: string;   // text shown when no image is set
  bgColor?: string; // Tailwind bg class for placeholder, default 'bg-gray-50'
}

interface Props {
  banners: Banner[];
  intervalMs?: number; // rotation speed in ms, default 5000
}

export default function AdBanner({ banners, intervalMs = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % banners.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(id);
  }, [banners.length, intervalMs]);

  if (!banners.length) return null;

  const b = banners[index];

  return (
    <div className="border border-dashed border-gray-200 p-4">
      <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-2">
        Реклама
      </p>

      <a
        href={b.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block h-48 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {b.image ? (
          <img
            src={b.image}
            alt={b.alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center border border-gray-100 ${b.bgColor ?? 'bg-gray-50'}`}>
            <span className="text-sm font-black text-gray-400 tracking-wider uppercase text-center px-4">
              {b.label ?? b.alt}
            </span>
          </div>
        )}
      </a>

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setVisible(true); }}
              aria-label={`Реклама ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? 'bg-gray-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
