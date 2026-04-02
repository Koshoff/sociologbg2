'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Survey {
  id: string;
  title: string;
  description: string;
  closesAt: string;
  createdAt: string;
  category: string | null;
}

interface ArchivedSurvey {
  survey: Survey;
  totalVotes: number;
  results: {
    total: Record<string, number>;
  };
}

const ITEMS_PER_PAGE = 4;
const CATEGORIES = ['Политика', 'Икономика', 'Социални', 'Здравеопазване'];

export default function ArchivePage() {
  const [archived, setArchived] = useState<ArchivedSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/surveys/archived`)
      .then(res => res.json())
      .then(setArchived)
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => setVisible(true), 100);
  }, []);

  const filtered = activeCategory
    ? archived.filter(a => a.survey.category === activeCategory)
    : archived;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-block border border-blue-500 px-3 py-1 mb-4">
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                ● {archived.length} приключили проучвания
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none mb-4 tracking-tight">
              АРХИВ
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Приключили проучвания и техните финални резултати.
            </p>
          </div>
        </div>
      </section>

      {/* Основно тяло — 3 колони */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-6">

          {/* Лява колона */}
          <aside className="col-span-3 hidden lg:block space-y-4">
            <div className="border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Статистика
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Общо проучвания</span>
                  <span className="text-lg font-black text-gray-900">{archived.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Общо гласове</span>
                  <span className="text-lg font-black text-gray-900">
                    {archived.reduce((sum, a) => sum + a.totalVotes, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-4">
                Реклама
              </p>
              <div className="h-48 bg-gray-50 border border-gray-100" />
            </div>

            <div className="border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Категории
              </p>
              <button
                onClick={() => { setActiveCategory(null); setPage(0); }}
                className={`w-full text-left flex justify-between items-center py-2 border-b border-gray-100 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeCategory === null ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Всички</span>
                <span className="font-black text-gray-400">{archived.length}</span>
              </button>
              {CATEGORIES.map((cat) => {
                const count = archived.filter(a => a.survey.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setPage(0); }}
                    className={`w-full text-left flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-xs font-bold uppercase tracking-wider transition-colors ${
                      activeCategory === cat ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="font-black text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Централна колона */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">
                Приключили проучвания
              </h2>
            </div>

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-50 border border-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && archived.length === 0 && (
              <div className="border border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                  Няма приключили проучвания
                </p>
              </div>
            )}

            <div className="space-y-4">
              {paginated.map(({ survey, totalVotes, results }, index) => {
                const total = results.total || {};
                const winner = Object.entries(total).sort(([, a], [, b]) => b - a)[0];

                return (
                  <div
                    key={survey.id}
                    className={`border border-gray-200 p-6 shadow-sm transition-all duration-150 ${
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
                    {/* Хедър */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-gray-400"></div>
                          <span className="text-xs font-black text-gray-400 tracking-widest uppercase">Приключило</span>
                          {survey.category && (
                            <span className="text-xs font-black text-amber-600 tracking-widest uppercase border border-amber-200 px-2 py-0.5">
                              {survey.category}
                            </span>
                          )}
                        </div>
                        <h2 className="font-black text-gray-900 text-lg leading-tight">{survey.title}</h2>
                        {survey.description && (
                          <p className="text-gray-500 text-sm mt-1">{survey.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-black text-gray-900">{totalVotes}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">гласа</p>
                      </div>
                    </div>

                    {/* Победител */}
                    {winner && (
                      <div className="bg-slate-900 px-4 py-2 mb-4 flex justify-between items-center">
                        <span className="text-xs font-black text-gray-400 tracking-widest uppercase">Резултат</span>
                        <span className="text-sm font-black text-white">
                          ▲ {winner[0]} — {Math.round((winner[1] / totalVotes) * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Баркове */}
                    {totalVotes > 0 && (
                      <div className="space-y-2 mb-4">
                        {Object.entries(total)
                          .sort(([, a], [, b]) => b - a)
                          .map(([choice, count]) => {
                            const percent = Math.round((count / totalVotes) * 100);
                            const isWinner = count === Math.max(...Object.values(total));
                            return (
                              <div key={choice}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className={`font-black tracking-wider uppercase ${isWinner ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {choice}
                                  </span>
                                  <span className="font-black text-gray-900">{percent}% ({count})</span>
                                </div>
                                <div className="h-1.5 bg-gray-100">
                                  <div
                                    className={`h-full ${isWinner ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Верификация и дата */}
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <div className="border-l-2 border-emerald-500 pl-2">
                        <p className="text-sm font-black text-gray-900">{totalVotes}</p>
                        <p className="text-xs font-bold text-gray-400">ВЕР</p>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="border border-gray-200 px-4 py-2 text-xs font-black tracking-widest uppercase hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← ПРЕДИШНА
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 text-xs font-black transition-colors ${
                        page === i ? 'bg-slate-900 text-white' : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="border border-gray-200 px-4 py-2 text-xs font-black tracking-widest uppercase hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  СЛЕДВАЩА →
                </button>
              </div>
            )}
          </section>

          {/* Дясна колона */}
          <aside className="col-span-3 hidden lg:block space-y-4">
            <div className="border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Последни резултати
              </p>
              {archived.slice(0, 3).map(({ survey, totalVotes, results }) => {
                const total = results.total || {};
                const winner = Object.entries(total).sort(([, a], [, b]) => b - a)[0];
                return (
                  <div key={survey.id} className="py-3 border-b border-gray-100 last:border-0">
                    <p className="text-xs font-black text-gray-900 leading-tight mb-1">{survey.title}</p>
                    {winner && (
                      <p className="text-xs font-bold text-blue-600">
                        ▲ {winner[0]} {Math.round((winner[1] / totalVotes) * 100)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border border-dashed border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-4">
                Реклама
              </p>
              <div className="h-48 bg-gray-50 border border-gray-100" />
            </div>

            <div className="border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-3">
                За платформата
              </p>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                Социолог.bg е независима платформа за анонимни граждански проучвания. Всеки глас е защитен с криптографски хеш.
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}