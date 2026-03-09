'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSurveys, Survey } from '@/lib/api';
import Navbar from '@/app/components/Navbar';

export default function HomePage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getSurveys()
      .then(setSurveys)
      .catch(() => setError('Грешка при зареждане'))
      .finally(() => setLoading(false));

    // Малко забавяне преди да покажем съдържанието
    // Създава ефект на плавно появяване
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div
            className={`max-w-xl transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Вашето мнение има значение
            </h1>
            <p className="text-gray-500 text-lg">
              Анонимни проучвания на общественото мнение.
              
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mt-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              {loading ? '...' : `${surveys.length} активни проучвания`}
            </div>
          </div>
          
        </div>
      </div>

      {/* Проучвания */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Как работи */}
        <div
          className={`grid grid-cols-3 gap-8 mb-12 pb-12 border-b border-gray-50 transition-all duration-700 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {[
            { num: '01', title: 'Изберете тема', desc: 'Разгледайте активните проучвания' },
            { num: '02', title: 'Гласувайте', desc: 'Анонимно, без регистрация' },
            { num: '03', title: 'Вижте резултатите', desc: 'В реално време' },
          ].map((item) => (
            <div key={item.num} className="flex gap-4">
              <span className="text-2xl font-bold text-gray-100 flex-shrink-0">{item.num}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Заглавие */}
        <div
          className={`flex justify-between items-center mb-6 transition-all duration-700 delay-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="font-semibold text-gray-900">Текущи проучвания</h2>
          <Link
            href="/archive"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Виж архива →
          </Link>
        </div>

        {/* Зареждане */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Грешка */}
        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}

        {/* Празно */}
        {!loading && !error && surveys.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">Няма активни проучвания в момента</p>
            <Link href="/archive" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
              Разгледайте архива
            </Link>
          </div>
        )}

        {/* Списък */}
        {!loading && !error && (
          <div className="space-y-4">
            {surveys.map((survey, index) => (
              <Link key={survey.id} href={`/surveys/${survey.id}`}>
                <div
                    className={`group flex items-center justify-between p-6 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm transition-all duration-150 cursor-pointer mb-4 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Пулсиращ индикатор */}
                    <div className="relative flex-shrink-0">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-40"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {survey.title}
                      </h3>
                      {survey.description && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {survey.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-300">Затваря</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-100 transition-all">
                      <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-sm">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center text-sm text-gray-400">
          <span>© 2026 Социолог.bg</span>
          <Link href="/archive" className="hover:text-gray-600 transition-colors">
            Архив →
          </Link>
        </div>
      </footer>
    </div>
  );
}