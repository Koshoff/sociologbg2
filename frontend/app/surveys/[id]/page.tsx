'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

import { getSurvey, castVote, getResults, Survey, VoteResult } from '@/lib/api';



const CHOICES = ['ДА', 'НЕ', 'ВЪЗДЪРЖАЛ СЕ'];

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<VoteResult | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const voted = localStorage.getItem(`voted_${id}`);
    if (voted) setHasVoted(true);

    getSurvey(id)
      .then(setSurvey)
      .catch(() => setError('Проучването не е намерено'))
      .finally(() => setLoading(false));

    getResults(id).then(setResults).catch(() => {});
    setTimeout(() => setVisible(true), 100);
  }, [id]);

  const handleVote = async () => {
    if (!selectedChoice) return;
    setVoting(true);
    setError(null);

    try {
      const fingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}_${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

      const result = await castVote(id, {
        choice: selectedChoice,
        identifier: fingerprint,
        trustLevel: 1,
      });

      if (result.success) {
        localStorage.setItem(`voted_${id}`, 'true');
        setHasVoted(true);
        const newResults = await getResults(id);
        setResults(newResults);
      } else {
        setError(result.message || 'Грешка при гласуване');
      }
    } catch {
      setError('Грешка при гласуване. Опитайте отново.');
    } finally {
      setVoting(false);
    }
  };

  const total = results?.total || {};
  const totalVotes = Object.values(total).reduce((a, b) => a + b, 0);

  if (loading) return (
  <div className="min-h-screen bg-white font-sans">
    <Navbar />
    <div className="max-w-3xl mx-auto px-6 pt-32 space-y-4">
      <div className="h-12 bg-gray-100 animate-pulse" />
      <div className="h-6 bg-gray-50 animate-pulse w-2/3" />
      <div className="h-48 bg-gray-50 animate-pulse mt-8" />
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center">
              <span className="text-white font-black text-sm">С</span>
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">СОЦИОЛОГ.BG</span>
          </div>
          <nav className="flex items-center gap-1">
            {[
              { href: '/', label: 'НАЧАЛО' },
              { href: '/archive', label: 'АРХИВ' },
              { href: '/analyses', label: 'АНАЛИЗИ' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
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
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
            <div className="inline-block border border-blue-500 px-3 py-1 mb-4">
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                ● Активно проучване
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none mb-4 tracking-tight">
              {survey?.title}
            </h1>
            {survey?.description && (
              <p className="text-gray-400 text-lg">{survey.description}</p>
            )}
            <p className="text-gray-600 text-sm mt-3 font-bold tracking-wider uppercase">
              Затваря: {survey && new Date(survey.closesAt).toLocaleDateString('bg-BG')}
            </p>
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold tracking-wider uppercase mb-6 transition-colors">
              ← НАЗАД
            </Link>
          </div>
        </div>
      </section>

      {/* Основно съдържание */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Гласуване */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
              Вашият глас
            </p>

            {!hasVoted ? (
              <div>
                <div className="space-y-2 mb-6">
                  {CHOICES.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => setSelectedChoice(choice)}
                      className={`w-full py-4 px-6 border-2 font-black text-sm tracking-wider uppercase text-left transition-all duration-150 ${
                        selectedChoice === choice
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-900 text-gray-900 hover:bg-gray-50'
                      }`}
                      onMouseEnter={(e) => {
                        if (selectedChoice !== choice) {
                          e.currentTarget.style.transform = 'translate(-2px, 2px)';
                          e.currentTarget.style.boxShadow = '4px -4px 0px rgba(0,0,0,0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
                )}

                <button
                  onClick={handleVote}
                  disabled={!selectedChoice || voting}
                  className="w-full py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {voting ? 'ИЗПРАЩАНЕ...' : 'ГЛАСУВАЙ'}
                </button>

                <p className="text-xs text-gray-400 font-bold tracking-wider mt-3 text-center uppercase">
                  Анонимно · Без регистрация
                </p>
              </div>
            ) : (
              <div className="border-2 border-green-500 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <p className="font-black text-gray-900 uppercase tracking-wider">Гласът е записан!</p>
                </div>
                <p className="text-sm text-gray-500 font-bold">Благодарим за участието.</p>
              </div>
            )}
          </div>

          {/* Резултати */}
          <div className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
              Резултати · {totalVotes} гласа
            </p>

            {totalVotes > 0 ? (
              <div className="space-y-4 mb-6">
                {Object.entries(total)
                  .sort(([, a], [, b]) => b - a)
                  .map(([choice, count]) => {
                    const percent = Math.round((count / totalVotes) * 100);
                    const isWinner = count === Math.max(...Object.values(total));

                    return (
                      <div key={choice}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`font-black tracking-wider uppercase ${isWinner ? 'text-gray-900' : 'text-gray-400'}`}>
                            {isWinner && '▲ '}{choice}
                          </span>
                          <span className="font-black text-gray-900">{percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-100">
                          <div
                            className={`h-full transition-all ${isWinner ? 'bg-blue-600' : 'bg-gray-300'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">{count} гласа</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                Все още няма гласове
              </p>
            )}

            {/* Верификация */}
            {totalVotes > 0 && results && (
              <div className="border-t-2 border-gray-900 pt-4">
                <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-3">
                  По верификация
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'ВЕРИФИЦИРАНИ', value: Object.values(results.verified).reduce((a, b) => a + b, 0), color: 'border-green-500' },
                    { label: 'ЧАСТИЧНИ', value: Object.values(results.partial).reduce((a, b) => a + b, 0), color: 'border-yellow-500' },
                    { label: 'АНОНИМНИ', value: Object.values(results.anonymous).reduce((a, b) => a + b, 0), color: 'border-gray-300' },
                  ].map((item) => (
                    <div key={item.label} className={`border-l-4 ${item.color} pl-2`}>
                      <p className="text-lg font-black text-gray-900">{item.value}</p>
                      <p className="text-xs font-bold text-gray-400 tracking-wider">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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