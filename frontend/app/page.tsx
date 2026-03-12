'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSurveys, Survey } from '@/lib/api';
import Navbar from '@/app/components/Navbar';


export default function HomePage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [totalVotes, setTotalVotes] = useState<number>(0);


  useEffect(() => {
    getSurveys()
      .then(setSurveys)
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => setVisible(true), 100);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/votes/total`)
      .then(res => res.json())
      .then(data => setTotalVotes(data.total))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Header */}
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-block border border-blue-500 px-3 py-1 mb-6">
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                ● {loading ? '...' : `${surveys.length} активни проучвания`}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 tracking-tight">
              ТВОЕТО МНЕНИЕ<br />
              <span className="text-blue-500">ИМА ЗНАЧЕНИЕ.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Анонимни и достоверни социологически проучвания.
              Гражданският вот е основата на демокрацията.
              Гласувайте без регистрация.
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-4 gap-px bg-gray-700 mt-10 max-w-xl">
            {[
              { label: 'АКТИВНИ', value: surveys.length.toString() },
              { label: 'ОБЩО ГЛАСОВЕ', value: totalVotes.toLocaleString('bg-BG') },
              { label: 'АНОНИМНИ', value: '100%' },
              { label: 'БЕЗ РЕГИСТРАЦИЯ', value: '✓' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900 px-6 py-4">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 font-bold tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Основно тяло — 3 колони */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-6">

          {/* Лява колона — placeholder */}
          <aside className="col-span-3 hidden lg:block">
            <div className="border-2 border-dashed border-gray-200 p-6 mb-4">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center">
                Топ статистика
              </p>
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-gray-50 border border-gray-100" />
                ))}
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center">
                Реклама
              </p>
              <div className="mt-4 h-40 bg-gray-50 border border-gray-100" />
            </div>
          </aside>

          {/* Централна колона — проучвания */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-900">
              <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">
                Текущи проучвания
              </h2>
              <Link
                href="/archive"
                className="text-xs font-bold text-gray-400 hover:text-gray-900 tracking-wider uppercase transition-colors"
              >
                Архив →
              </Link>
            </div>

            {/* Зареждане */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-50 border border-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {/* Списък */}
            {!loading && (
              <div className="space-y-4">
                {surveys.map((survey, index) => (
                  <div
                    key={survey.id}
                    className={`border-2 border-gray-900 p-6 shadow-md transition-all duration-150 ${
                      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-3px, 3px)';
                      e.currentTarget.style.boxShadow = '6px -6px 0px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        <h3 className="font-black text-gray-900 text-lg leading-tight">
                          {survey.title}
                        </h3>
                        {survey.description && (
                          <p className="text-gray-500 text-sm mt-2">{survey.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">До</p>
                        <p className="text-sm font-black text-gray-900">
                          {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500"></div>
                        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                          Активно
                        </span>
                      </div>
                      <Link href={`/surveys/${survey.id}`}>
                        <button className="bg-blue-600 text-white px-6 py-2 text-xs font-black tracking-widest uppercase hover:bg-blue-700 transition-colors">
                          ГЛАСУВАЙ
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}

                {surveys.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 p-12 text-center">
                    <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                      Няма активни проучвания
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Дясна колона — placeholder */}
          <aside className="col-span-3 hidden lg:block">
            <div className="border-2 border-dashed border-gray-200 p-6 mb-4">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center">
                Последни резултати
              </p>
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-gray-50 border border-gray-100" />
                ))}
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center">
                Реклама
              </p>
              <div className="mt-4 h-40 bg-gray-50 border border-gray-100" />
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-gray-900 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="text-xs font-black text-gray-900 tracking-widest uppercase">
            © 2026 Социолог.bg
          </span>
          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
            Анонимност и достоверност
          </span>
        </div>
      </footer>
    </div>
  );
}