'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const metadata = { title: 'Дашборд' };


const API_URL = 'http://localhost:8080';

interface Survey {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  closesAt: string;
  createdAt: string;
}

interface Stats {
  survey: Survey;
  totalVotes: number;
  results: {
    total: Record<string, number>;
    verified: Record<string, number>;
    partial: Record<string, number>;
    anonymous: Record<string, number>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedStats, setSelectedStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форма за ново проучване
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');

  // Вземаме токена от localStorage
  const getToken = () => localStorage.getItem('adminToken');

  // Хелпър за автентикирани заявки
  // Автоматично добавя Authorization header към всяка заявка
  const authFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...options.headers,
      },
    });
  };

  useEffect(() => {
    // Проверяваме дали има токен — ако не → пренасочваме към login
    if (!getToken()) {
      router.push('/admin');
      return;
    }
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/surveys`);
      if (res.status === 401) {
        // Токенът е изтекъл → пренасочваме към login
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setSurveys(data);
    } catch {
      setError('Грешка при зареждане');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (id: string) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/surveys/${id}/stats`);
      const data = await res.json();
      setSelectedStats(data);
    } catch {
      setError('Грешка при зареждане на статистика');
    }
  };

  const createSurvey = async () => {
    if (!title || !closesAt) return;

    try {
      const res = await authFetch(`${API_URL}/api/admin/surveys`, {
        method: 'POST',
        body: JSON.stringify({ title, description, closesAt }),
      });

      if (res.ok) {
        // Изчистваме формата
        setTitle('');
        setDescription('');
        setClosesAt('');
        setShowCreateForm(false);
        // Презареждаме списъка
        loadSurveys();
      }
    } catch {
      setError('Грешка при създаване');
    }
  };

  const closeSurvey = async (id: string) => {
    if (!confirm('Сигурни ли сте че искате да затворите проучването?')) return;

    try {
      await authFetch(`${API_URL}/api/admin/surveys/${id}/close`, {
        method: 'PUT',
      });
      loadSurveys();
    } catch {
      setError('Грешка при затваряне');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    router.push('/admin');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Зареждане...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Социолог.bg</h1>
            <p className="text-sm text-gray-500">Admin панел</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {localStorage.getItem('adminUsername')}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:underline"
            >
              Изход
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Бутон за ново проучване */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Проучвания ({surveys.length})
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Ново проучване
          </button>
        </div>

        {/* Форма за създаване */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ново проучване</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заглавие *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Въведете заглавие"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Въведете описание (незадължително)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Затваря на *
                </label>
                <input
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createSurvey}
                  disabled={!title || !closesAt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Създай
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Откажи
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Списък с проучвания */}
          <div className="space-y-3">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{survey.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        survey.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {survey.isActive ? 'Активно' : 'Затворено'}
                      </span>
                    </div>
                    {survey.description && (
                      <p className="text-sm text-gray-500 mb-2">{survey.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Затваря: {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => loadStats(survey.id)}
                    className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    Статистика
                  </button>
                  {survey.isActive && (
                    <button
                      onClick={() => closeSurvey(survey.id)}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      Затвори
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Статистика */}
          {selectedStats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">
                  {selectedStats.survey.title}
                </h3>
                <button
                  onClick={() => setSelectedStats(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Общо гласове: <span className="font-semibold text-gray-900">{selectedStats.totalVotes}</span>
              </p>

              {/* Обща графика */}
              <div className="space-y-3 mb-6">
                {Object.entries(selectedStats.results.total).map(([choice, count]) => {
                  const percent = selectedStats.totalVotes > 0
                    ? Math.round((count / selectedStats.totalVotes) * 100)
                    : 0;
                  return (
                    <div key={choice}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{choice}</span>
                        <span className="text-gray-500">{percent}% ({count})</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Разбивка по ниво */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 mb-3 uppercase">
                  По ниво на верификация
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-green-50 rounded p-2">
                    <p className="font-semibold text-green-700">Верифицирани</p>
                    <p className="text-gray-600 mt-1">
                      {Object.values(selectedStats.results.verified).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded p-2">
                    <p className="font-semibold text-yellow-700">Частични</p>
                    <p className="text-gray-600 mt-1">
                      {Object.values(selectedStats.results.partial).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="font-semibold text-gray-700">Анонимни</p>
                    <p className="text-gray-600 mt-1">
                      {Object.values(selectedStats.results.anonymous).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
