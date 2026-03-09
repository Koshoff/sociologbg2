'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/surveys/archived`)
      .then(res => res.json())
      .then(setArchived)
      .catch(() => setError('Грешка при зареждане'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Навигация */}
      <nav className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">С</span>
            </div>
            <span className="font-bold text-gray-900">Социолог.bg</span>
          </Link>
          <span className="text-sm text-gray-400">Архив</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Заглавие */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Архив</h1>
          <p className="text-gray-500">
            Приключили проучвания и техните финални резултати
          </p>
        </div>

        {/* Зареждане */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Грешка */}
        {error && (
          <div className="text-center py-12 text-red-500">{error}</div>
        )}

        {/* Празен архив */}
        {!loading && !error && archived.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Няма приключили проучвания</p>
          </div>
        )}

        {/* Списък */}
        {!loading && !error && (
          <div className="space-y-6">
            {archived.map(({ survey, totalVotes, results }) => {
              const total = results.total || {};

              return (
                <div
                  key={survey.id}
                  className="border border-gray-100 rounded-xl p-6"
                >
                  {/* Заглавие */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                        <h2 className="font-semibold text-gray-900">{survey.title}</h2>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Приключило
                        </span>
                      </div>
                      {survey.description && (
                        <p className="text-sm text-gray-500 ml-4">{survey.description}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                      {totalVotes} гласа
                    </span>
                  </div>

                  {/* Резултати */}
                  {totalVotes > 0 ? (
                    <div className="space-y-2 mb-4">
                      {Object.entries(total)
                        .sort(([, a], [, b]) => b - a)
                        .map(([choice, count]) => {
                          const percent = Math.round((count / totalVotes) * 100);
                          const isWinner = count === Math.max(...Object.values(total));

                          return (
                            <div key={choice}>
                              <div className="flex justify-between text-sm mb-1">
                                <div className="flex items-center gap-2">
                                  {isWinner && (
                                    <span className="text-xs text-blue-600 font-medium">▲</span>
                                  )}
                                  <span className={`font-medium ${isWinner ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {choice}
                                  </span>
                                </div>
                                <span className="text-gray-500">{percent}% ({count})</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isWinner ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-4">Няма гласове</p>
                  )}

                  {/* Разбивка по верификация */}
                  {totalVotes > 0 && (
                    <div className="border-t border-gray-50 pt-4 grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="font-medium text-green-700">Верифицирани</p>
                        <p className="text-gray-600 mt-0.5">
                          {Object.values(results.verified).reduce((a, b) => a + b, 0)} гласа
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2">
                        <p className="font-medium text-yellow-700">Частични</p>
                        <p className="text-gray-600 mt-0.5">
                          {Object.values(results.partial).reduce((a, b) => a + b, 0)} гласа
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="font-medium text-gray-700">Анонимни</p>
                        <p className="text-gray-600 mt-0.5">
                          {Object.values(results.anonymous).reduce((a, b) => a + b, 0)} гласа
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Дата */}
                  <p className="text-xs text-gray-300 mt-4">
                    Приключи на {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center text-sm text-gray-400">
          <span>© 2026 Социолог.bg</span>
          <Link href="/" className="hover:text-gray-600 transition-colors">
            ← Към активните проучвания
          </Link>
        </div>
      </footer>
    </div>
  );
}