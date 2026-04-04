'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = '';

interface Survey {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  closesAt: string;
  createdAt: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sources: string | null;
  status: string;
  surveyId: string | null;
  surveyTitle: string | null;
  createdAt: string;
  publishedAt: string | null;
}

type Tab = 'surveys' | 'articles' | 'analytics';

interface PageStat {
  page: string;
  totalViews: number;
  avgDurationSeconds: number;
}

interface AnalyticsData {
  pageStats: PageStat[];
  totalViews: number;
  avgDurationSeconds: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('articles');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Форма за анкети
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveyClosesAt, setSurveyClosesAt] = useState('');

  // SEO оптимизация
  const [editSlug, setEditSlug] = useState('');
  const [editMetaTitle, setEditMetaTitle] = useState('');
  const [editMetaDescription, setEditMetaDescription] = useState('');
  const [editSources, setEditSources] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Категория за анкета
  const [surveyCategory, setSurveyCategory] = useState('');

  const CATEGORIES = ['Политика', 'Икономика', 'Социални', 'Здравеопазване'];

  // AI генериране
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');

  // Публикуване
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [publishSurveyTitle, setPublishSurveyTitle] = useState('');
  const [publishSurveyDescription, setPublishSurveyDescription] = useState('');
  const [publishClosesAt, setPublishClosesAt] = useState('');

  const authFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, aRes, anRes] = await Promise.all([
        authFetch(`${API_URL}/api/admin/surveys`),
        authFetch(`${API_URL}/api/articles/admin/all`),
        authFetch(`${API_URL}/api/admin/analytics`),
      ]);
      if (sRes.status === 401 || aRes.status === 401) {
        router.push('/admin');
        return;
      }
      const [s, a, an] = await Promise.all([sRes.json(), aRes.json(), anRes.json()]);
      setSurveys(s);
      setArticles(a);
      setAnalytics(an);
    } catch {
      setError('Грешка при зареждане');
    } finally {
      setLoading(false);
    }
  };

  const createSurvey = async () => {
    if (!surveyTitle || !surveyClosesAt) return;
    try {
      await authFetch(`${API_URL}/api/admin/surveys`, {
        method: 'POST',
        body: JSON.stringify({ title: surveyTitle, description: surveyDescription, closesAt: surveyClosesAt, category: surveyCategory }),
      });
      setSurveyTitle(''); setSurveyDescription(''); setSurveyClosesAt(''); setSurveyCategory('');
      setShowCreateSurvey(false);
      loadAll();
    } catch { setError('Грешка при създаване'); }
  };

  const closeSurvey = async (id: string) => {
    if (!confirm('Затваряне на проучването?')) return;
    await authFetch(`${API_URL}/api/admin/surveys/${id}/close`, { method: 'PUT' });
    loadAll();
  };

  const generateArticle = async () => {
  if (!topic) return;
  setGenerating(true);
  setError(null);
  try {
    const res = await authFetch(`${API_URL}/api/articles/admin/generate`, {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();

    setGeneratedArticle(data.article);
    setEditTitle(data.article.title);
    setEditContent(data.article.content);
    setEditSummary(data.article.summary);
    setPublishSurveyTitle(data.surveyQuestion);
    setEditSlug(data.article.slug || '');
    setEditMetaTitle(data.article.metaTitle || '');
    setEditMetaDescription(data.article.metaDescription || '');
    setEditSources(data.article.sources || '');
    setEditCategory(data.article.category || '');
    setTopic('');
    setShowGenerateForm(false);
  } catch {
    setError('Грешка при генериране. Опитайте отново.');
  } finally {
    setGenerating(false);
  }
};

  const saveEdits = async () => {
    if (!generatedArticle) return;
    await authFetch(`${API_URL}/api/articles/admin/${generatedArticle.id}/update`, {
      method: 'PUT',
      body: JSON.stringify({
            title: editTitle,
            content: editContent,
            summary: editSummary,
            slug: editSlug,
            metaTitle: editMetaTitle,
            metaDescription: editMetaDescription,
            sources: editSources,
            category: editCategory }),
    });
    setGeneratedArticle({ ...generatedArticle, title: editTitle, content: editContent, summary: editSummary });
  };

  const publishArticle = async () => {
    if (!generatedArticle || !publishSurveyTitle || !publishClosesAt) return;
    try {
      await authFetch(`${API_URL}/api/articles/admin/${generatedArticle.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({
          surveyTitle: publishSurveyTitle,
          surveyDescription: publishSurveyDescription,
          closesAt: publishClosesAt + ':00', // Добави секунди
        }),
      });
      setGeneratedArticle(null);
      setShowPublishForm(false);
      loadAll();
    } catch { setError('Грешка при публикуване'); }
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    router.push('/admin');
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="w-8 h-8 bg-slate-900 mx-auto mb-4" />
        <p className="text-xs font-black text-gray-400 tracking-widest uppercase">Зареждане...</p>
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
            <div>
              <span className="font-black text-gray-900 text-lg tracking-tight">СОЦИОЛОГ.BG</span>
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase ml-3">ADMIN</span>
            </div>
          </div>
          <button onClick={logout} className="text-xs font-black text-red-500 tracking-widest uppercase hover:text-red-700 transition-colors">
            ИЗХОД
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">

        {error && (
          <div className="border-2 border-red-500 p-4 mb-6">
            <p className="text-red-500 text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Табове */}
        <div className="flex gap-px bg-gray-900 w-fit mb-8">
          {(['articles', 'surveys', 'analytics'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-black tracking-widest uppercase transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'articles' ? `Статии (${articles.length})` : t === 'surveys' ? `Анкети (${surveys.length})` : 'Аналитики'}
            </button>
          ))}
        </div>

        {/* ─── СТАТИИ ─── */}
        {tab === 'articles' && (
          <div>
            {/* Генериране */}
            {!generatedArticle && (
              <div className="mb-8">
                {!showGenerateForm ? (
                  <button
                    onClick={() => setShowGenerateForm(true)}
                    className="bg-slate-900 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-slate-700 transition-colors"
                  >
                    + ГЕНЕРИРАЙ СТАТИЯ С AI
                  </button>
                ) : (
                  <div className="border-2 border-gray-900 p-6">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
                      Генериране на статия
                    </p>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Тема на статията (напр. 'Изборите в САЩ 2026')"
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600 mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={generateArticle}
                        disabled={!topic || generating}
                        className="bg-blue-600 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 transition-colors"
                      >
                        {generating ? 'ГЕНЕРИРАНЕ...' : 'ГЕНЕРИРАЙ'}
                      </button>
                      <button
                        onClick={() => setShowGenerateForm(false)}
                        className="border-2 border-gray-900 px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-colors"
                      >
                        ОТКАЖИ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Редактиране на генерирана статия */}
            {generatedArticle && (
              <div className="border-2 border-blue-600 p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-900">
                  <p className="text-xs font-black text-blue-600 tracking-widest uppercase">
                    ● Нова статия — прегледай и публикувай
                  </p>
                  <button onClick={() => setGeneratedArticle(null)} className="text-xs font-black text-gray-400 hover:text-gray-900">
                    ОТКАЖИ
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">Заглавие</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">Резюме</label>
                    <input
                      type="text"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">Съдържание</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={10}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Категория */}
                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">Категория</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600 bg-white"
                    >
                      <option value="">— без категория —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* SEO секция */}
                  <div className="border-t-2 border-gray-900 pt-4 mt-4">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4">
                      SEO настройки
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                          Slug <span className="text-gray-300">(URL)</span>
                        </label>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          placeholder="url-friendly-slug"
                          className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                          Meta Title <span className="text-gray-300">(до 60 символа)</span>
                        </label>
                        <input
                          type="text"
                          value={editMetaTitle}
                          onChange={(e) => setEditMetaTitle(e.target.value)}
                          maxLength={60}
                          className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                        />
                        <p className="text-xs text-gray-400 mt-1">{editMetaTitle.length}/60</p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                          Meta Description <span className="text-gray-300">(до 160 символа)</span>
                        </label>
                        <textarea
                          value={editMetaDescription}
                          onChange={(e) => setEditMetaDescription(e.target.value)}
                          maxLength={160}
                          rows={3}
                          className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                        />
                        <p className="text-xs text-gray-400 mt-1">{editMetaDescription.length}/160</p>
                      </div>
                    </div>
                  </div>

                  {/* Източници */}
                  <div className="border-t-2 border-gray-900 pt-4 mt-4">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4">
                      Източници
                    </p>
                    <textarea
                      value={editSources}
                      onChange={(e) => setEditSources(e.target.value)}
                      rows={4}
                      placeholder="Един източник на ред..."
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  onClick={saveEdits}
                  className="border-2 border-gray-900 px-6 py-2 text-xs font-black tracking-widest uppercase hover:bg-gray-50 mb-6 transition-colors"
                >
                  ЗАПАЗИ ПРОМЕНИТЕ
                </button>

                {/* Анкета */}
                <div className="border-t-2 border-gray-900 pt-6">
                  <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4">
                    Свързана анкета
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={publishSurveyTitle}
                      onChange={(e) => setPublishSurveyTitle(e.target.value)}
                      placeholder="Въпрос за анкетата"
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      value={publishSurveyDescription}
                      onChange={(e) => setPublishSurveyDescription(e.target.value)}
                      placeholder="Описание на анкетата (незадължително)"
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="datetime-local"
                      value={publishClosesAt}
                      onChange={(e) => setPublishClosesAt(e.target.value)}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    onClick={publishArticle}
                    disabled={!publishSurveyTitle || !publishClosesAt}
                    className="mt-4 bg-blue-600 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    ПУБЛИКУВАЙ
                  </button>
                </div>
              </div>
            )}

            {/* Списък статии */}
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="border-2 border-gray-900 p-5 flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-black tracking-widest uppercase ${
                        article.status === 'published' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        ● {article.status === 'published' ? 'ПУБЛИКУВАНА' : 'DRAFT'}
                      </span>
                    </div>
                    <p className="font-black text-gray-900">{article.title}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">{article.summary}</p>
                    {article.surveyTitle && (
                      <p className="text-xs text-blue-600 font-bold mt-1">Анкета: {article.surveyTitle}</p>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-400 whitespace-nowrap">
                    {new Date(article.createdAt).toLocaleDateString('bg-BG')}
                  </p>
                </div>
              ))}

              {articles.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                    Няма статии — генерирай първата!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── АНКЕТИ ─── */}
        {tab === 'surveys' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-black text-gray-400 tracking-widest uppercase">
                Всички анкети
              </p>
              <button
                onClick={() => setShowCreateSurvey(!showCreateSurvey)}
                className="bg-slate-900 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-slate-700 transition-colors"
              >
                + НОВА АНКЕТА
              </button>
            </div>

            {showCreateSurvey && (
              <div className="border-2 border-gray-900 p-6 mb-6">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
                  Нова анкета
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="Заглавие *"
                    className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                  <textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Описание (незадължително)"
                    rows={3}
                    className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="datetime-local"
                    value={surveyClosesAt}
                    onChange={(e) => setSurveyClosesAt(e.target.value)}
                    className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                  <select
                    value={surveyCategory}
                    onChange={(e) => setSurveyCategory(e.target.value)}
                    className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="">— без категория —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={createSurvey}
                      disabled={!surveyTitle || !surveyClosesAt}
                      className="bg-blue-600 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      СЪЗДАЙ
                    </button>
                    <button
                      onClick={() => setShowCreateSurvey(false)}
                      className="border-2 border-gray-900 px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-colors"
                    >
                      ОТКАЖИ
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="border-2 border-gray-900 p-5 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-2 h-2 ${survey.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs font-black text-gray-400 tracking-widest uppercase">
                        {survey.isActive ? 'АКТИВНО' : 'ЗАТВОРЕНО'}
                      </span>
                    </div>
                    <p className="font-black text-gray-900">{survey.title}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      До: {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                  {survey.isActive && (
                    <button
                      onClick={() => closeSurvey(survey.id)}
                      className="border-2 border-red-500 text-red-500 px-4 py-2 text-xs font-black tracking-widest uppercase hover:bg-red-50 transition-colors"
                    >
                      ЗАТВОРИ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ─── АНАЛИТИКИ ─── */}
        {tab === 'analytics' && (
          <div>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="border-2 border-gray-900 p-5">
                <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-2">Общо прегледи</p>
                <p className="text-4xl font-black text-gray-900">{analytics?.totalViews ?? 0}</p>
              </div>
              <div className="border-2 border-gray-900 p-5">
                <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-2">Средно на страница</p>
                <p className="text-4xl font-black text-gray-900">{analytics?.avgDurationSeconds ?? 0}с</p>
              </div>
            </div>

            {/* Per-page table */}
            <div className="border-2 border-gray-900">
              <div className="grid grid-cols-3 gap-4 px-5 py-3 border-b-2 border-gray-900 bg-gray-50">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase">Страница</p>
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase text-right">Прегледи</p>
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase text-right">Средно (с)</p>
              </div>
              {(analytics?.pageStats ?? []).length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                    Няма данни — потребителите трябва да приемат аналитични бисквитки
                  </p>
                </div>
              ) : (
                (analytics?.pageStats ?? []).map((row) => (
                  <div key={row.page} className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-bold text-gray-900 truncate">{row.page}</p>
                    <p className="text-sm font-bold text-gray-600 text-right">{row.totalViews}</p>
                    <p className="text-sm font-bold text-gray-600 text-right">{row.avgDurationSeconds}с</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}