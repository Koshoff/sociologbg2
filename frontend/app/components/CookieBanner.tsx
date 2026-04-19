'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CookiePrefs = {
  necessary: true;
  analytics: boolean;
  thirdParty: boolean;
};

const defaultPrefs: CookiePrefs = {
  necessary: true,
  analytics: false,
  thirdParty: false,
};

const categories: {
  key: keyof CookiePrefs;
  label: string;
  description: string;
  locked?: boolean;
}[] = [
  {
    key: 'necessary',
    label: 'Задължителни',
    description: 'Необходими за работата на сайта — запомнят вашия избор за бисквитки и осигуряват сигурно гласуване. Не могат да бъдат изключени.',
    locked: true,
  },
  {
    key: 'analytics',
    label: 'Аналитични',
    description: 'Анонимна статистика — записват само пътя на страницата и времето на посещение. Без лични данни.',
  },
  {
    key: 'thirdParty',
    label: 'Трети страни',
    description: 'Google Sign-In за гласуване и коментари. Google може да постави собствени бисквитки.',
  },
];

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(defaultPrefs);

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) {
      setVisible(true);
    }
  }, []);

  const save = (p: CookiePrefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(p));
    setVisible(false);
  };

  const handleAcceptAll = () =>
    save({ necessary: true, analytics: true, thirdParty: true });

  const handleNecessaryOnly = () => save({ ...defaultPrefs });

  const toggle = (key: keyof CookiePrefs) => {
    if (key === 'necessary') return;
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-72 bg-white border-2 border-gray-900 shadow-lg">
      <div className="px-4 pt-4 pb-3 border-b-2 border-gray-900">
        <p className="text-xs font-black text-gray-900 tracking-widest uppercase">Бисквитки</p>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs font-bold text-gray-500 leading-relaxed mb-3">
          Използваме бисквитки за подобряване на преживяването.{' '}
          <Link href="/privacy" className="underline hover:text-gray-900 transition-colors">
            Научете повече
          </Link>
        </p>

        {expanded && (
          <div className="space-y-3 mb-3 border-t border-gray-200 pt-3">
            {categories.map(cat => (
              <div key={cat.key} className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggle(cat.key)}
                  disabled={cat.locked}
                  aria-label={cat.label}
                  className={`mt-0.5 relative flex-shrink-0 w-8 h-4 rounded-full transition-colors focus:outline-none ${
                    prefs[cat.key] ? 'bg-blue-600' : 'bg-gray-300'
                  } ${cat.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                      prefs[cat.key] ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div>
                  <p className="text-xs font-black text-gray-900 leading-tight mb-0.5">{cat.label}</p>
                  <p className="text-xs text-gray-500 leading-snug">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleAcceptAll}
            className="w-full bg-blue-600 text-white py-2 text-xs font-black tracking-widest uppercase hover:bg-blue-700 transition-colors"
          >
            Приемам всички
          </button>

          {expanded ? (
            <button
              onClick={() => save(prefs)}
              className="w-full border-2 border-blue-600 text-blue-600 py-2 text-xs font-black tracking-widest uppercase hover:bg-blue-50 transition-colors"
            >
              Запази избора
            </button>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="w-full border-2 border-gray-900 py-2 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-colors"
            >
              Настройки
            </button>
          )}

          <button
            onClick={handleNecessaryOnly}
            className="w-full py-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors"
          >
            Само задължителни
          </button>
        </div>
      </div>
    </div>
  );
}
