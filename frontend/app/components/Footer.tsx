'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <footer className="border-t-2 border-gray-900 mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8 mb-8">

          {/* Лого и описание */}
          <div className="col-span-12 lg:col-span-4">
            <img src="/sociolog-bg-logo.png" alt="Социолог.bg" className="h-10 w-auto" />
            <p className="text-sm text-gray-500 font-bold leading-relaxed mb-4">
              Независима платформа за анонимни граждански проучвания и актуални новини. Твоят глас има значение.
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              © 2026 Социолог.bg
            </p>
          </div>

          {/* Навигация */}
          <div className="col-span-6 lg:col-span-2">
            <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-4">
              Платформа
            </p>
            <div className="space-y-2">
              {[
                { href: '/', label: 'Начало' },
                { href: '/news', label: 'Новини' },
                { href: '/archive', label: 'Архив' },
              ].map(link => (
                <Link key={link.href} href={link.href}>
                  <p className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-colors">{link.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* За нас */}
          <div className="col-span-6 lg:col-span-2">
            <p className="text-xs font-black text-gray-900 tracking-widests uppercase border-b-2 border-gray-900 pb-2 mb-4">
              За нас
            </p>
            <div className="space-y-2">
              {[
                { href: '/about', label: 'За Социолог.bg' },
                { href: '/mission', label: 'Нашата мисия' },
                { href: '/privacy', label: 'Поверителност' },
                { href: '/terms', label: 'Условия' },
              ].map(link => (
                <Link key={link.href} href={link.href}>
                  <p className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-colors">{link.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Контакт форма */}
          <div className="col-span-12 lg:col-span-4">
            <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-4">
              Свържи се с нас
            </p>
            {contactSent ? (
              <div className="border-2 border-green-500 p-4">
                <p className="text-xs font-black text-green-600 uppercase tracking-wider">
                  ✓ Съобщението е изпратено!
                </p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-3">
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Вашето име"
                  required
                  className="w-full border-2 border-gray-300 px-3 py-2 text-xs font-bold focus:outline-none focus:border-gray-900"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="Имейл адрес"
                  required
                  className="w-full border-2 border-gray-300 px-3 py-2 text-xs font-bold focus:outline-none focus:border-gray-900"
                />
                <textarea
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="Вашето съобщение"
                  required
                  rows={3}
                  className="w-full border-2 border-gray-300 px-3 py-2 text-xs font-bold focus:outline-none focus:border-gray-900"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-2 text-xs font-black tracking-widest uppercase hover:bg-slate-700 transition-colors"
                >
                  ИЗПРАТИ
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t-2 border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Анонимност и достоверност
          </span>
          <div className="flex gap-6">
            <Link href="/privacy">
              <span className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider transition-colors">Поверителност</span>
            </Link>
            <Link href="/terms">
              <span className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider transition-colors">Условия</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}