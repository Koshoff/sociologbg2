'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSurvey, castVote, getResults, Survey, VoteResult } from '@/lib/api';
import Navbar from '@/app/components/Navbar';

const CHOICES = ['ДА', 'НЕ', 'ВЪЗДЪРЖАЛ СЕ'];

const CHOICE_COLORS: Record<string, string> = {
  'ДА': 'bg-green-500',
  'НЕ': 'bg-red-400',
  'ВЪЗДЪРЖАЛ СЕ': 'bg-gray-300',
};

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<VoteResult | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const voted = localStorage.getItem(`voted_${id}`);
    if (voted) setHasVoted(true);

    getSurvey(id)
      .then(setSurvey)
      .catch(() => setError('Проучването не е намерено'))
      .finally(() => setLoading(false));

    getResults(id).then(setResults).catch(() => {});
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

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
        <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse mt-8" />
      </div>
    </div>
  );

  if (error && !survey) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  const total = results?.total || {};
  const totalVotes = Object.values(total).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(total), 1);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Заглавие */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm text-gray-400">Активно проучване</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {survey?.title}
          </h1>
          {survey?.description && (
            <p className="text-gray-500">{survey.description}</p>
          )}
          <p className="text-sm text-gray-300 mt-2">
            Затваря: {survey && new Date(survey.closesAt).toLocaleDateString('bg-BG')}
          </p>
        </div>

        {/* Форма за гласуване */}
        {!hasVoted ? (
          <div className="mb-10">
            <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
              Вашият глас
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {CHOICES.map((choice) => (
                <button
                  key={choice}
                  onClick={() => setSelectedChoice(choice)}
                  className={`py-4 px-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    selectedChoice === choice
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleVote}
              disabled={!selectedChoice || voting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {voting ? 'Изпращане...' : 'Гласувай'}
            </button>

            <p className="text-xs text-gray-300 mt-3 text-center">
              Гласуването е анонимно. Не събираме лични данни.
            </p>
          </div>
        ) : (
          <div className="mb-10 flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Вашият глас е записан!</p>
              <p className="text-sm text-green-600">Благодарим за участието.</p>
            </div>
          </div>
        )}

        {/* Резултати */}
        {results && totalVotes > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Резултати
              </p>
              <span className="text-sm text-gray-400">{totalVotes} гласа</span>
            </div>

            {/* Progress bars */}
            <div className="space-y-4 mb-8">
              {Object.entries(total)
                .sort(([, a], [, b]) => b - a)
                .map(([choice, count]) => {
                  const percent = Math.round((count / totalVotes) * 100);
                  const isWinner = count === maxVotes;
                  const colorClass = CHOICE_COLORS[choice] || 'bg-blue-400';

                  return (
                    <div key={choice}>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          {isWinner && (
                            <span className="text-xs font-bold text-blue-600">▲</span>
                          )}
                          <span className={`font-medium ${isWinner ? 'text-gray-900' : 'text-gray-400'}`}>
                            {choice}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>{count} гласа</span>
                          <span className="font-semibold text-gray-700">{percent}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colorClass}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Разбивка по верификация */}
            <div className="border-t border-gray-50 pt-6">
              <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
                По ниво на верификация
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-xs font-semibold text-green-700 mb-1">Верифицирани</p>
                  <p className="text-lg font-bold text-green-800">
                    {Object.values(results.verified).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Частични</p>
                  <p className="text-lg font-bold text-yellow-800">
                    {Object.values(results.partial).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Анонимни</p>
                  <p className="text-lg font-bold text-gray-800">
                    {Object.values(results.anonymous).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-2xl mx-auto px-4 flex justify-between items-center text-sm text-gray-400">
          <span>© 2026 Социолог.bg</span>
          <span>Анонимност и достоверност</span>
        </div>
      </footer>
    </div>
  );
}