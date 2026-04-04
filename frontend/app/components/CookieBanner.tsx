'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CookiePrefs = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  firstParty: boolean;
  thirdParty: boolean;
};

const defaultPrefs: CookiePrefs = {
  necessary: true,
  analytics: false,
  advertising: false,
  firstParty: false,
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
    label: 'Задължителни (функционални)',
    description:
      'Необходими за работата на сайта. Включват: adminToken (JWT сесия за администратори) и cookieConsent (запомня вашия избор тук). Не могат да бъдат изключени.',
    locked: true,
  },
  {
    key: 'analytics',
    label: 'Аналитични (статистически)',
    description:
      'Записват колко секунди прекарвате на всяка страница. Данните са анонимни — съхранява се само пътят на страницата и продължителността, без лични данни.',
  },
  {
    key: 'advertising',
    label: 'Рекламни (таргетиращи)',
    description:
      'Към момента не използваме рекламни бисквитки. Тази категория е включена за прозрачност при евентуално бъдещо използване.',
  },
  {
    key: 'firstParty',
    label: 'Собствени бисквитки',
    description:
      'Поставят се от Социолог.bg и се четат само от нас. Включват: google_token (Google OAuth за гласуване/коментари) и voted_<id> (предотвратява двойно гласуване).',
  },
  {
    key: 'thirdParty',
    label: 'Бисквитки от трети страни',
    description:
      'Поставят се от Google Sign-In (accounts.google.com), заредено за автентикация при гласуване и коментиране. Google може да постави собствени бисквитки.',
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
    save({ necessary: true, analytics: true, advertising: true, firstParty: true, thirdParty: true });

  const handleNecessaryOnly = () =>
    save({ ...defaultPrefs });

  const handleSaveSelection = () => save(prefs);

  const toggle = (key: keyof CookiePrefs) => {
    if (key === 'necessary') return;
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 bg-white border-2 border-gray-900 shadow-lg">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b-2 border-gray-900">
        <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
          Бисквитки
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-gray-500 leading-relaxed mb-3">
          Използваме бисквитки, за да подобрим вашето преживяване.{' '}
          <Link href="/privacy" className="underline hover:text-gray-900 transition-colors">
            Научете повече
          </Link>
        </p>

        {/* Expandable categories */}
        {expanded && (
          <div className="space-y-3 mb-4 border-t border-gray-200 pt-3">
            {categories.map(cat => (
              <div key={cat.key} className="flex items-start gap-3">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(cat.key)}
                  disabled={cat.locked}
                  aria-label={cat.label}
                  className={`mt-0.5 relative flex-shrink-0 w-9 h-5 rounded-full transition-colors focus:outline-none ${
                    prefs[cat.key]
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  } ${cat.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      prefs[cat.key] ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div>
                  <p className="text-xs font-black text-gray-900 leading-tight mb-0.5">
                    {cat.label}
                    {cat.locked && (
                      <span className="ml-1 text-gray-400 font-bold normal-case">(задължителни)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleAcceptAll}
            className="w-full bg-blue-600 text-white py-2 text-xs font-black tracking-widest uppercase hover:bg-blue-700 transition-colors"
          >
            Приемам всички
          </button>

          {expanded ? (
            <button
              onClick={handleSaveSelection}
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
