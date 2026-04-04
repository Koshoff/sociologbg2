'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';


const navLinks = [
  { href: '/', label: 'НАЧАЛО' },
  { href: '/archive', label: 'АРХИВ' },
  { href: '/news', label: 'НОВИНИ' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Лого */}
        <Link href="/" className="flex items-center">
          <Image
            src="/sociolog-logo.png"
            alt="Социолог.bg"
            width={150}
            height={32}
            className="w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-bold tracking-wider transition-all duration-150 ${
                pathname === item.href
                  ? 'text-gray-900 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-200'
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
        <div className="md:hidden border-t border-gray-100 bg-white">
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