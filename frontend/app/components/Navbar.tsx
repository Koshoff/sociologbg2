'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'НАЧАЛО' },
  { href: '/archive', label: 'АРХИВ' },
  { href: '/analyses', label: 'Новини' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Лого */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center">
            <span className="text-white font-black text-sm">С</span>
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight">СОЦИОЛОГ.BG</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-bold tracking-wider transition-all duration-150 ${
                pathname === item.href
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, 2px)';
                e.currentTarget.style.boxShadow = '3px -3px 0px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Burger button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <span className={`block w-6 h-0.5 bg-gray-900 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-900 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-900 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-gray-900 bg-white">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-4 text-sm font-black tracking-widest uppercase border-b border-gray-100 transition-colors ${
                pathname === item.href
                  ? 'text-gray-900 bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}