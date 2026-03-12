'use client';

import Navbar from '@/app/components/Navbar';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Survey {
  id: string;
  title: string;
  description: string;
  closesAt: string;
  createdAt: string;
}

interface ArchivedSurvey {
  survey: Survey;
  totalVotes: number;
  results: {
    total: Record<string, number>;
    verified: Record<string, number>;
    partial: Record<string, number>;
    anonymous: Record<string, number>;
  };
}

export default function ArchivePage() {
  const [archived, setArchived] = useState<ArchivedSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/surveys/archived`)
      .then(res => res.json())
      .then(setArchived)
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => setVisible(true), 100);
  }, []);

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
            <div className="border-2 border-gray-900 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-4">
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
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Анонимни</span>
                  <span className="text-lg font-black text-gray-900">
                    {archived.reduce((sum, a) => sum + Object.values(a.results.anonymous).reduce((x, y) => x + y, 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-4">
                Реклама
              </p>
              <div className="h-48 bg-gray-50 border border-gray-100" />
            </div>

            <div className="border-2 border-gray-900 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-4">
                Категории
              </p>
              {['Политика', 'Икономика', 'Социални', 'Здравеопазване'].map((cat) => (
                <div
                  key={cat}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{cat}</span>
                  <span className="text-xs font-black text-gray-400">—</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Централна колона */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-900">
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
              <div className="border-2 border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                  Няма приключили проучвания
                </p>
              </div>
            )}

            <div className="space-y-4">
              {archived.map(({ survey, totalVotes, results }, index) => {
                const total = results.total || {};
                const winner = Object.entries(total).sort(([, a], [, b]) => b - a)[0];

                return (
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
                    {/* Хедър */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-gray-400"></div>
                          <span className="text-xs font-black text-gray-400 tracking-widest uppercase">Приключило</span>
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
                    <div className="border-t-2 border-gray-100 pt-3 flex justify-between items-center">
                      <div className="flex gap-4">
                        {[
                          { label: 'ВЕР', value: Object.values(results.verified).reduce((a, b) => a + b, 0), color: 'border-green-500' },
                          { label: 'ЧАС', value: Object.values(results.partial).reduce((a, b) => a + b, 0), color: 'border-yellow-500' },
                          { label: 'АНО', value: Object.values(results.anonymous).reduce((a, b) => a + b, 0), color: 'border-gray-300' },
                        ].map((item) => (
                          <div key={item.label} className={`border-l-2 ${item.color} pl-2`}>
                            <p className="text-sm font-black text-gray-900">{item.value}</p>
                            <p className="text-xs font-bold text-gray-400">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Дясна колона */}
          <aside className="col-span-3 hidden lg:block space-y-4">
            <div className="border-2 border-gray-900 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-4">
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

            <div className="border-2 border-dashed border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-4">
                Реклама
              </p>
              <div className="h-48 bg-gray-50 border border-gray-100" />
            </div>

            <div className="border-2 border-gray-900 p-5">
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