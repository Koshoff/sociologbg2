'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// useRouter = програмна навигация
// Като response.sendRedirect() в Java




export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://sociolog.online/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Записваме токена в localStorage
        // При всяка следваща заявка ще го изпращаме
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);

        // Пренасочваме към dashboard-а
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Грешно потребителско име или парола');
      }
    } catch {
      setError('Грешка при свързване със сървъра');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Социолог.bg</h1>
          <p className="text-gray-500 mt-1">Admin панел</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Потребителско име
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Парола
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              // Enter клавишът също логва
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Влизане...' : 'Влез'}
          </button>
        </div>
      </div>
    </main>
  );
}