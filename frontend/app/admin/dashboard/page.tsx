'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

type Tab = 'surveys' | 'articles';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('articles');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
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

  const getToken = () => localStorage.getItem('adminToken');

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
    if (!getToken()) { router.push('/admin'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        authFetch(`${API_URL}/api/admin/surveys`).then(r => r.json()),
        authFetch(`${API_URL}/api/articles/admin/all`).then(r => r.json()),
      ]);
      setSurveys(s);
      setArticles(a);
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
        body: JSON.stringify({ title: surveyTitle, description: surveyDescription, closesAt: surveyClosesAt }),
      });
      setSurveyTitle(''); setSurveyDescription(''); setSurveyClosesAt('');
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
            sources: editSources }),
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
          closesAt: publishClosesAt,
        }),
      });
      setGeneratedArticle(null);
      setShowPublishForm(false);
      loadAll();
    } catch { setError('Грешка при публикуване'); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
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
          {(['articles', 'surveys'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-black tracking-widest uppercase transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'articles' ? `Статии (${articles.length})` : `Анкети (${surveys.length})`}
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
      </main>
    </div>
  );
}