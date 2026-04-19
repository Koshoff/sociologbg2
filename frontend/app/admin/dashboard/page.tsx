'use client';

import { useEffect, useRef, useState } from 'react';
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
  category: string | null;
  surveyId: string | null;
  surveyTitle: string | null;
  createdAt: string;
  publishedAt: string | null;
  imageUrl: string | null;
}

type Tab = 'surveys' | 'articles' | 'analytics' | 'newsroom';

interface NewsroomEvent {
  eventName: string;
  data: Record<string, unknown>;
}

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
  const [editImageUrl, setEditImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // Категория за анкета
  const [surveyCategory, setSurveyCategory] = useState('');

  const CATEGORIES = ['Политика', 'Икономика', 'Социални', 'Здравеопазване'];

  // Ръчно създаване
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);

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

  // Newsroom (multi-agent)
  const [newsroomTopic, setNewsroomTopic] = useState('');
  const [newsroomContext, setNewsroomContext] = useState('');
  const [newsroomRunning, setNewsroomRunning] = useState(false);
  const [newsroomEvents, setNewsroomEvents] = useState<NewsroomEvent[]>([]);
  const newsroomAbortRef = useRef<AbortController | null>(null);

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

  const uploadImage = async (file: File) => {
    setImageUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Грешка при качване на снимката.'); return; }
      setEditImageUrl(data.url);
    } catch {
      setError('Грешка при качване на снимката.');
    } finally {
      setImageUploading(false);
    }
  };

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

  const createManualArticle = async () => {
    if (!editTitle || !editContent || !editSummary) return;
    setManualSaving(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/api/articles/admin/create`, {
        method: 'POST',
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          summary: editSummary,
          slug: editSlug || undefined,
          metaTitle: editMetaTitle || undefined,
          metaDescription: editMetaDescription || undefined,
          sources: editSources || undefined,
          category: editCategory || undefined,
          imageUrl: editImageUrl || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || 'Грешка при създаване на статията.');
        return;
      }
      const article = await res.json();
      setGeneratedArticle(article);
      setShowManualForm(false);
      loadAll();
    } catch {
      setError('Грешка при създаване на статията.');
    } finally {
      setManualSaving(false);
    }
  };

  const saveEdits = async () => {
    if (!generatedArticle) return;
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/api/articles/admin/${generatedArticle.id}/update`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          summary: editSummary,
          slug: editSlug || undefined,
          metaTitle: editMetaTitle || undefined,
          metaDescription: editMetaDescription || undefined,
          sources: editSources || undefined,
          category: editCategory || undefined,
          imageUrl: editImageUrl || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || 'Грешка при запазване на промените.');
        return;
      }
      setGeneratedArticle({ ...generatedArticle, title: editTitle, content: editContent, summary: editSummary });
      loadAll();
    } catch {
      setError('Грешка при запазване на промените.');
    }
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

  const runNewsroom = async () => {
    if (!newsroomTopic.trim() || newsroomRunning) return;
    setNewsroomRunning(true);
    setNewsroomEvents([]);

    const abort = new AbortController();
    newsroomAbortRef.current = abort;

    const addEvent = (eventName: string, data: Record<string, unknown>) => {
      setNewsroomEvents(prev => [...prev, { eventName, data }]);
    };

    try {
      const response = await fetch(`${API_URL}/api/admin/newsroom/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newsroomTopic,
          ...(newsroomContext.trim() ? { context: newsroomContext } : {}),
        }),
        signal: abort.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        addEvent('error', { message: err.error || 'Грешка при стартиране на newsroom' });
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by \n\n
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.trim()) continue;
          let eventName = 'message';
          let eventData = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            if (line.startsWith('data:')) eventData = line.slice(5).trim();
          }
          if (!eventData) continue;
          try {
            const parsed = JSON.parse(eventData) as Record<string, unknown>;
            addEvent(eventName, parsed);

            // When editor approves, load the article into the edit form
            if (eventName === 'complete' && parsed.article_id) {
              await loadAll();
              const artRes = await authFetch(`${API_URL}/api/articles/${parsed.article_id}`);
              if (artRes.ok) {
                const art = await artRes.json();
                setGeneratedArticle(art);
                setEditTitle(art.title ?? '');
                setEditContent(art.content ?? '');
                setEditSummary(art.summary ?? '');
                setEditSlug(art.slug ?? '');
                setEditMetaTitle(art.metaTitle ?? '');
                setEditMetaDescription(art.metaDescription ?? '');
                setEditSources(art.sources ?? '');
                setEditCategory(art.category ?? '');
                setEditImageUrl(art.imageUrl ?? '');
                setTab('articles');
              }
            }
          } catch {
            // ignore malformed SSE data line
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        addEvent('error', { message: 'Връзката прекъсна. Опитайте отново.' });
      }
    } finally {
      setNewsroomRunning(false);
      newsroomAbortRef.current = null;
    }
  };

  const cancelNewsroom = () => {
    newsroomAbortRef.current?.abort();
    setNewsroomRunning(false);
  };

  const startEditingArticle = (article: Article) => {
    setGeneratedArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditSummary(article.summary);
    setEditSlug(article.slug ?? '');
    setEditMetaTitle(article.metaTitle ?? '');
    setEditMetaDescription(article.metaDescription ?? '');
    setEditSources(article.sources ?? '');
    setEditCategory(article.category ?? '');
    setEditImageUrl(article.imageUrl ?? '');
    setPublishSurveyTitle('');
    setPublishSurveyDescription('');
    setPublishClosesAt('');
    setShowManualForm(false);
    setShowGenerateForm(false);
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
          {(['articles', 'surveys', 'analytics', 'newsroom'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-black tracking-widest uppercase transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'articles' ? `Статии (${articles.length})`
                : t === 'surveys' ? `Анкети (${surveys.length})`
                : t === 'analytics' ? 'Аналитики'
                : '⚡ Newsroom'}
            </button>
          ))}
        </div>

        {/* ─── СТАТИИ ─── */}
        {tab === 'articles' && (
          <div>
            {/* Бутони за действие */}
            {!generatedArticle && !showManualForm && (
              <div className="flex gap-3 mb-8 flex-wrap">
                <button
                  onClick={() => { setShowGenerateForm(v => !v); }}
                  className="bg-slate-900 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-slate-700 transition-colors"
                >
                  + ГЕНЕРИРАЙ С AI
                </button>
                <button
                  onClick={() => {
                    setEditTitle(''); setEditContent(''); setEditSummary('');
                    setEditSlug(''); setEditMetaTitle(''); setEditMetaDescription('');
                    setEditSources(''); setEditCategory(''); setEditImageUrl('');
                    setShowGenerateForm(false);
                    setShowManualForm(true);
                  }}
                  className="border-2 border-gray-900 text-gray-900 px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-colors"
                >
                  + НАПИШИ РЪЧНО
                </button>
              </div>
            )}

            {/* AI генериране форма */}
            {!generatedArticle && !showManualForm && showGenerateForm && (
              <div className="border-2 border-gray-900 p-6 mb-8">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
                  Генериране на статия с AI
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

            {/* ── Ръчно създаване ── */}
            {showManualForm && !generatedArticle && (
              <div className="border-2 border-gray-900 p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-900">
                  <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
                    Нова статия — ръчно
                  </p>
                  <button
                    onClick={() => setShowManualForm(false)}
                    className="text-xs font-black text-gray-400 hover:text-gray-900"
                  >
                    ОТКАЖИ
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Задължителни полета */}
                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                      Заглавие <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Заглавие на статията"
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                      Резюме <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      placeholder="Кратко резюме (1-2 изречения)"
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                      Съдържание <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Текст на статията (поддържа Markdown)"
                      rows={16}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600 font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1">{editContent.length} символа</p>
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

                  {/* SEO */}
                  <div className="border-t-2 border-gray-900 pt-4">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4">SEO настройки</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-black text-gray-400 tracking-widest uppercase block mb-1">
                          Slug <span className="text-gray-300">(URL)</span>
                        </label>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          placeholder="url-friendly-slug-s-tireта"
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
                  <div className="border-t-2 border-gray-900 pt-4">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-2">Източници</p>
                    <p className="text-xs text-gray-400 font-bold mb-3">
                      Формати: <code className="bg-gray-100 px-1">[Текст на линка](https://url.com)</code> · директен URL · обикновен текст
                    </p>
                    <textarea
                      value={editSources}
                      onChange={(e) => setEditSources(e.target.value)}
                      rows={4}
                      placeholder={'[НСИ – Демографска статистика 2024](https://nsi.bg/...)\nhttps://example.com\nИванов, П. (2023). Социални неравенства.'}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Снимка */}
                  <div className="border-t-2 border-gray-900 pt-4">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-3">Снимка</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 text-xs font-black tracking-widest uppercase hover:bg-slate-700 transition-colors">
                        {imageUploading ? 'КАЧВАНЕ...' : '↑ ИЗБЕРИ СНИМКА'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={imageUploading}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                        />
                      </label>
                      {editImageUrl && (
                        <div className="flex items-center gap-2">
                          <img src={editImageUrl} alt="preview" className="h-12 w-20 object-cover border border-gray-200" />
                          <button onClick={() => setEditImageUrl('')} className="text-xs font-black text-red-500 hover:text-red-700">✕</button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-bold mt-2">JPEG, PNG или WebP · макс. 5 MB</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t-2 border-gray-900">
                  <button
                    onClick={createManualArticle}
                    disabled={!editTitle || !editContent || !editSummary || manualSaving}
                    className="bg-blue-600 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    {manualSaving ? 'ЗАПАЗВАНЕ...' : 'СЪЗДАЙ СТАТИЯ'}
                  </button>
                  <button
                    onClick={() => setShowManualForm(false)}
                    className="border-2 border-gray-900 px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-colors"
                  >
                    ОТКАЖИ
                  </button>
                </div>
              </div>
            )}

            {/* Редактиране на генерирана статия */}
            {generatedArticle && (
              <div className="border-2 border-blue-600 p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-900">
                  <p className="text-xs font-black text-blue-600 tracking-widest uppercase">
                    {generatedArticle.status === 'published' ? '● Редактиране на статия' : '● Нова статия — прегледай и публикувай'}
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
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-2">
                      Източници
                    </p>
                    <p className="text-xs text-gray-400 font-bold mb-3">
                      Формати: <code className="bg-gray-100 px-1">[Текст на линка](https://url.com)</code> · директен URL · обикновен текст
                    </p>
                    <textarea
                      value={editSources}
                      onChange={(e) => setEditSources(e.target.value)}
                      rows={4}
                      placeholder={'[НСИ – Демографска статистика 2024](https://nsi.bg/...)\nhttps://example.com\nИванов, П. (2023). Социални неравенства.'}
                      className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Снимка */}
                  <div className="border-t-2 border-gray-900 pt-4 mt-4">
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-3">Снимка</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 text-xs font-black tracking-widest uppercase hover:bg-slate-700 transition-colors">
                        {imageUploading ? 'КАЧВАНЕ...' : '↑ ИЗБЕРИ СНИМКА'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={imageUploading}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                        />
                      </label>
                      {editImageUrl && (
                        <div className="flex items-center gap-2">
                          <img src={editImageUrl} alt="preview" className="h-12 w-20 object-cover border border-gray-200" />
                          <button onClick={() => setEditImageUrl('')} className="text-xs font-black text-red-500 hover:text-red-700">✕</button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-bold mt-2">JPEG, PNG або WebP · макс. 5 MB</p>
                  </div>
                </div>

                <button
                  onClick={saveEdits}
                  className="border-2 border-gray-900 px-6 py-2 text-xs font-black tracking-widest uppercase hover:bg-gray-50 mb-6 transition-colors"
                >
                  ЗАПАЗИ ПРОМЕНИТЕ
                </button>

                {/* Анкета */}
                {generatedArticle.status === 'published' && (
                  <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-6">
                    ● Статията е публикувана
                  </p>
                )}
                <div className={`border-t-2 border-gray-900 pt-6 ${generatedArticle.status === 'published' ? 'hidden' : ''}`}>
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
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className="text-xs font-bold text-gray-400 whitespace-nowrap">
                      {new Date(article.createdAt).toLocaleDateString('bg-BG')}
                    </p>
                    <button
                      onClick={() => startEditingArticle(article)}
                      className="text-xs font-black text-gray-900 tracking-widest uppercase border-2 border-gray-900 px-3 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      РЕДАКТИРАЙ
                    </button>
                  </div>
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

        {/* ─── NEWSROOM ─── */}
        {tab === 'newsroom' && (
          <div>
            {/* Input form */}
            <div className="border-2 border-gray-900 p-6 mb-6">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
                Мулти-агентна редакция — Journalist → Fact-Checker → Editor
              </p>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={newsroomTopic}
                  onChange={(e) => setNewsroomTopic(e.target.value)}
                  disabled={newsroomRunning}
                  placeholder="Тема на статията *"
                  maxLength={300}
                  className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600 disabled:opacity-50"
                />
                <textarea
                  value={newsroomContext}
                  onChange={(e) => setNewsroomContext(e.target.value)}
                  disabled={newsroomRunning}
                  placeholder="Допълнителен контекст / бриф (незадължително)"
                  maxLength={1000}
                  rows={3}
                  className="w-full border-2 border-gray-900 px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600 disabled:opacity-50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={runNewsroom}
                  disabled={!newsroomTopic.trim() || newsroomRunning}
                  className="bg-blue-600 text-white px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  {newsroomRunning ? 'РАБОТИ...' : 'СТАРТИРАЙ'}
                </button>
                {newsroomRunning && (
                  <button
                    onClick={cancelNewsroom}
                    className="border-2 border-red-500 text-red-500 px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-red-50 transition-colors"
                  >
                    СПРИ
                  </button>
                )}
                {!newsroomRunning && newsroomEvents.length > 0 && (
                  <button
                    onClick={() => setNewsroomEvents([])}
                    className="border-2 border-gray-900 px-6 py-3 text-xs font-black tracking-widest uppercase hover:bg-gray-50 transition-colors"
                  >
                    ИЗЧИСТИ
                  </button>
                )}
              </div>
            </div>

            {/* Agent feed */}
            {newsroomEvents.length > 0 && (
              <div className="space-y-2">
                {newsroomEvents.map((ev, i) => {
                  const d = ev.data;

                  if (ev.eventName === 'agent_status') {
                    const agent = d.agent as string;
                    const status = d.status as string;
                    const round = d.round as number;
                    const label = agent === 'journalist' ? 'Журналист'
                      : agent === 'fact-checker' ? 'Факт-Чекър'
                      : 'Редактор';
                    const statusLabel = status === 'writing' ? 'пише...'
                      : status === 'reviewing' ? 'проверява...'
                      : status === 'deciding' ? 'решава...'
                      : 'нужна е ревизия';
                    const isActive = newsroomRunning && i === newsroomEvents.length - 1;
                    return (
                      <div key={i} className="border-l-4 border-blue-400 pl-4 py-2 flex items-center gap-3">
                        {isActive && (
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                        <span className="text-xs font-black text-gray-400 tracking-widest uppercase">
                          Кръг {round}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {label} — {statusLabel}
                        </span>
                      </div>
                    );
                  }

                  if (ev.eventName === 'agent_output') {
                    const agent = d.agent as string;

                    if (agent === 'journalist') {
                      const conf = d.confidence as string;
                      const confColor = conf === 'high' ? 'text-green-600'
                        : conf === 'medium' ? 'text-yellow-600' : 'text-red-500';
                      return (
                        <div key={i} className="border-2 border-gray-200 p-4">
                          <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-1">
                            ✓ Журналист — черновата готова
                          </p>
                          <p className="font-black text-gray-900 text-sm">{d.title as string}</p>
                          <p className={`text-xs font-bold mt-1 ${confColor}`}>
                            Увереност: {conf}
                          </p>
                        </div>
                      );
                    }

                    if (agent === 'fact-checker') {
                      const rating = d.overall_rating as string;
                      const score = d.accuracy_score as number;
                      const ratingColor = rating === 'PASS' ? 'text-green-600'
                        : rating === 'PASS_WITH_CORRECTIONS' ? 'text-yellow-600'
                        : 'text-red-500';
                      const reviews = (d.claim_reviews as Array<Record<string, unknown>>) ?? [];
                      const biasFlags = (d.bias_flags as string[]) ?? [];
                      return (
                        <div key={i} className="border-2 border-gray-200 p-4">
                          <div className="flex items-center gap-4 mb-3">
                            <p className="text-xs font-black text-gray-400 tracking-widest uppercase">
                              ✓ Факт-Чекър
                            </p>
                            <span className={`text-xs font-black ${ratingColor}`}>{rating}</span>
                            <span className="text-xs font-bold text-gray-400">{score}/100</span>
                          </div>
                          {reviews.length > 0 && (
                            <div className="space-y-1">
                              {reviews.map((r, j) => {
                                const verdict = r.verdict as string;
                                const dotColor = verdict === 'VERIFIED' ? 'bg-green-500'
                                  : verdict === 'NEEDS_CORRECTION' ? 'bg-yellow-400'
                                  : verdict === 'FALSE' ? 'bg-red-500'
                                  : 'bg-gray-400';
                                return (
                                  <div key={j} className="flex items-start gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${dotColor}`} />
                                    <span className="font-bold text-gray-600 w-28 flex-shrink-0">{verdict}</span>
                                    <span className="text-gray-500 truncate">{r.original_text as string}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {biasFlags.length > 0 && (
                            <div className="mt-2 border-t border-gray-100 pt-2">
                              {biasFlags.map((f, j) => (
                                <p key={j} className="text-xs text-orange-600 font-bold">⚠ {f}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (agent === 'editor') {
                      const decision = d.decision as string;
                      const decisionColor = decision === 'PUBLISH' ? 'text-green-600 border-green-500'
                        : decision === 'REVISE' ? 'text-yellow-600 border-yellow-400'
                        : 'text-red-500 border-red-500';
                      const scores = (d.scores as Record<string, number>) ?? {};
                      return (
                        <div key={i} className={`border-2 p-4 ${decisionColor}`}>
                          <div className="flex items-center gap-4 mb-2">
                            <p className="text-xs font-black tracking-widest uppercase">
                              Редактор → {decision}
                            </p>
                            <span className="text-xs font-bold text-gray-400">
                              {d.overall_score as number}/100
                            </span>
                          </div>
                          {Object.keys(scores).length > 0 && (
                            <div className="flex gap-4 flex-wrap">
                              {Object.entries(scores).map(([k, v]) => (
                                <span key={k} className="text-xs font-bold text-gray-500">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                          {(d.editorial_notes as string) && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              {d.editorial_notes as string}
                            </p>
                          )}
                        </div>
                      );
                    }
                  }

                  if (ev.eventName === 'complete') {
                    return (
                      <div key={i} className="border-2 border-green-500 bg-green-50 p-4">
                        <p className="text-xs font-black text-green-600 tracking-widest uppercase mb-1">
                          ✓ ПУБЛИКУВАНО КАТ DRAFT — зареждане в редактора...
                        </p>
                        <p className="text-sm font-bold text-gray-900">{d.title as string}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Кръгове: {d.rounds as number}
                        </p>
                      </div>
                    );
                  }

                  if (ev.eventName === 'rejected') {
                    return (
                      <div key={i} className="border-2 border-red-500 bg-red-50 p-4">
                        <p className="text-xs font-black text-red-600 tracking-widest uppercase mb-1">
                          ✗ ОТХВЪРЛЕНО от редактора
                        </p>
                        <p className="text-sm text-gray-700">{d.reason as string}</p>
                      </div>
                    );
                  }

                  if (ev.eventName === 'max_rounds_reached') {
                    return (
                      <div key={i} className="border-2 border-yellow-400 bg-yellow-50 p-4">
                        <p className="text-xs font-black text-yellow-700 tracking-widest uppercase mb-1">
                          ⚠ Максимален брой кръгове — запазено като draft
                        </p>
                        <p className="text-xs text-gray-600">{d.warning as string}</p>
                      </div>
                    );
                  }

                  if (ev.eventName === 'error') {
                    return (
                      <div key={i} className="border-2 border-red-500 p-4">
                        <p className="text-xs font-black text-red-600 tracking-widest uppercase">
                          Грешка: {d.message as string}
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {newsroomEvents.length === 0 && !newsroomRunning && (
              <div className="border-2 border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                  Въведи тема и стартирай newsroom пайплайна
                </p>
                <p className="text-gray-300 text-xs mt-2">
                  Journalist (web search) → Fact-Checker (web search) → Editor → до 3 кръга
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}