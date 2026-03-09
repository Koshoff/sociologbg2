'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-100 sticky top-0 bg-white z-10">
      <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">

        {/* Лого */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-150">
            <span className="text-white font-bold">С</span>
          </div>
          <span className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors duration-150">
            Социолог.bg
          </span>
        </Link>

        {/* Навигационни линкове */}
        <div className="flex items-center gap-2">
          {[
            { href: '/', label: 'Проучвания' },
            { href: '/archive', label: 'Архив' },
            { href: '/analyses', label: 'Анализи' },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                  ? 'text-black'
                  : 'text-black hover:bg-gray-50'
                }`}
                style={{
                  transition: 'transform 150ms, box-shadow 150ms',
                }}
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
            );
          })}
        </div>
      </div>
    </nav>
  );
}