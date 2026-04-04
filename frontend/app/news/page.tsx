'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  status: string;
  surveyId: string | null;
  surveyTitle: string | null;
  surveyClosesAt: string | null;
  createdAt: string;
  publishedAt: string | null;
}

interface ArchivedSurvey {
  survey: { id: string; title: string; closesAt: string; };
  totalVotes: number;
  results: { total: Record<string, number>; };
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesWithSurveys, setArticlesWithSurveys] = useState<Article[]>([]);
  const [archivedTop, setArchivedTop] = useState<ArchivedSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/articles`).then(r => r.json()),
      fetch(`${API_URL}/api/articles/with-active-surveys`).then(r => r.json()),
      fetch(`${API_URL}/api/surveys/archived`).then(r => r.json()),
    ])
      .then(([arts, withSurveys, archived]) => {
        setArticles(arts);
        setArticlesWithSurveys(withSurveys.slice(0, 3));
        setArchivedTop(archived.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => setVisible(true), 100);
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-block border border-green-500 px-3 py-1 mb-4">
              <span className="text-green-500 text-xs font-bold tracking-widest uppercase">
                ● {articles.length} статии
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none mb-4 tracking-tight">
              НОВИНИ
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Актуални анализи и граждански проучвания по най-важните теми.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3 space-y-4 hidden lg:block">
              {[1,2].map(i => <div key={i} className="h-40 bg-gray-50 animate-pulse border border-gray-100" />)}
            </div>
            <div className="col-span-12 lg:col-span-6 h-96 bg-gray-50 animate-pulse border border-gray-100" />
            <div className="col-span-3 space-y-4 hidden lg:block">
              {[1,2].map(i => <div key={i} className="h-40 bg-gray-50 animate-pulse border border-gray-100" />)}
            </div>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 p-24 text-center">
            <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
              Няма публикувани статии
            </p>
          </div>
        )}

        {!loading && featured && (
          <div className="grid grid-cols-12 gap-6 items-start">

            {/* Лява колона — sticky */}
            <aside className="col-span-3 hidden lg:block sticky top-24 space-y-4">

              {/* Анкети свързани с новини */}
              <div className="border border-gray-200 p-5">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                  Гласувай сега
                </p>
                {articlesWithSurveys.length > 0 ? (
                  <div className="space-y-3">
                    {articlesWithSurveys.map((article) => (
                      <div key={article.id} className="py-2 border-b border-gray-100 last:border-0">
                        <p className="text-xs font-black text-gray-900 leading-tight mb-1">{article.surveyTitle}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Link href={`/news/${article.id}`}>
                            <span className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider transition-colors">
                              Статия →
                            </span>
                          </Link>
                          <Link href={`/surveys/${article.surveyId}`}>
                            <span className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors">
                              Гласувай →
                            </span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма активни анкети</p>
                )}
              </div>

              {/* За платформата */}
              <div className="border border-gray-200 p-5">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-3">
                  За платформата
                </p>
                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-3">
                  Социолог.bg е независима платформа за анонимни граждански проучвания и новини.
                </p>
                <Link href="/">
                  <span className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors">
                    Виж проучванията →
                  </span>
                </Link>
              </div>

              {/* Реклама */}
              <div className="border-2 border-dashed border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-3">Реклама</p>
                <div className="h-48 bg-gray-50 border border-gray-100" />
              </div>
            </aside>

            {/* Централна колона */}
            <div className="col-span-12 lg:col-span-6 space-y-4">

              {/* Featured */}
              <Link href={`/news/${featured.id}`}>
                <div
                  className="border border-gray-200 p-8 cursor-pointer transition-all duration-150"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-3px, 3px)';
                    e.currentTarget.style.boxShadow = '6px -6px 0px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500 px-3 py-1">
                      <span className="text-white text-xs font-black tracking-widest uppercase">FEATURED</span>
                    </div>
                    {featured.surveyId && featured.surveyClosesAt && new Date(featured.surveyClosesAt) > new Date() && (
                      <div className="border border-green-500 px-3 py-1">
                        <span className="bg-green-500 text-xs font-black tracking-widest uppercase">● Активна анкета</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 text-lg mb-6 leading-relaxed">{featured.summary}</p>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString('bg-BG', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <span className="text-xs font-black text-blue-600 tracking-wider uppercase">ПРОЧЕТИ →</span>
                  </div>
                </div>
              </Link>

              {/* Останали статии */}
              {rest.map((article, index) => (
                <Link key={article.id} href={`/news/${article.id}`}>
                  <div
                    className={`border border-gray-200 p-5 cursor-pointer transition-all duration-150 mt-4 ${
                      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, 2px)';
                      e.currentTarget.style.boxShadow = '4px -4px 0px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {article.surveyId && article.surveyClosesAt && new Date(article.surveyClosesAt) > new Date() && (
                    <span className="text-xs font-black bg-green-500 tracking-widest uppercase mb-2 block">
                      ● Активна анкета
                    </span>
                    )}
                    <h3 className="font-black text-gray-900 leading-tight mb-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{article.summary}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>


            {/* Мобилна допълнителна информация */}
            <div className="col-span-12 lg:hidden space-y-4 mt-4">

              {/* Гласувай сега */}
              <div className="border border-gray-200 p-5">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                  Гласувай сега
                </p>
                {articlesWithSurveys.length > 0 ? (
                  <div className="space-y-3">
                    {articlesWithSurveys.map((article) => (
                      <div key={article.id} className="py-2 border-b border-gray-100 last:border-0">
                        <p className="text-xs font-black text-gray-900 leading-tight mb-1">{article.surveyTitle}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Link href={`/news/${article.id}`}>
                            <span className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider transition-colors">
                              Статия →
                            </span>
                          </Link>
                          <Link href={`/surveys/${article.surveyId}`}>
                            <span className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors">
                              Гласувай →
                            </span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма активни анкети</p>
                )}
              </div>

              {/* Последни резултати */}
              <div className="border border-gray-200 p-5">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
                    Последни резултати
                  </p>
                  <Link href="/archive">
                    <span className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">Всички →</span>
                  </Link>
                </div>
                {archivedTop.length > 0 ? (
                  <div className="space-y-3">
                    {archivedTop.map(({ survey, totalVotes, results }) => {
                      const total = results.total || {};
                      const winner = Object.entries(total).sort(([,a],[,b]) => b - a)[0];
                      return (
                        <div key={survey.id} className="py-2 border-b border-gray-100 last:border-0">
                          <p className="text-xs font-black text-gray-900 leading-tight mb-1">{survey.title}</p>
                          {winner && (
                            <p className="text-xs font-bold text-blue-600">
                              ▲ {winner[0]} — {Math.round((winner[1] / totalVotes) * 100)}%
                            </p>
                          )}
                          <p className="text-xs font-bold text-gray-400 mt-1">{totalVotes} гласа</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма архивирани</p>
                )}
              </div>

              {/* Статистика */}
              <div className="border border-gray-200 p-5">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                  Статистика
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-black text-gray-900">{articles.length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Статии</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900">{articlesWithSurveys.length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">С анкети</p>
                  </div>
                </div>
              </div>

              {/* За платформата */}
              <div className="border border-gray-200 p-5">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-3">
                  За платформата
                </p>
                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-3">
                  Социолог.bg е независима платформа за анонимни граждански проучвания и новини.
                </p>
                <Link href="/">
                  <span className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors">
                    Виж проучванията →
                  </span>
                </Link>
              </div>

            </div>

            {/* Дясна колона — sticky */}
            <aside className="col-span-3 hidden lg:block sticky top-24 space-y-4">

              {/* Последни резултати от архива */}
              <div className="border border-gray-200 p-5">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
                    Последни резултати
                  </p>
                  <Link href="/archive">
                    <span className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">Всички →</span>
                  </Link>
                </div>
                {archivedTop.length > 0 ? (
                  <div className="space-y-3">
                    {archivedTop.map(({ survey, totalVotes, results }) => {
                      const total = results.total || {};
                      const winner = Object.entries(total).sort(([,a],[,b]) => b - a)[0];
                      return (
                        <div key={survey.id} className="py-2 border-b border-gray-100 last:border-0">
                          <p className="text-xs font-black text-gray-900 leading-tight mb-1">{survey.title}</p>
                          {winner && (
                            <p className="text-xs font-bold text-blue-600">
                              ▲ {winner[0]} — {Math.round((winner[1] / totalVotes) * 100)}%
                            </p>
                          )}
                          <p className="text-xs font-bold text-gray-400 mt-1">{totalVotes} гласа</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма архивирани</p>
                )}
              </div>

              {/* Статистика */}
              <div className="border border-gray-200 p-5">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                  Статистика
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Статии</span>
                    <span className="text-lg font-black text-gray-900">{articles.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">С анкети</span>
                    <span className="text-lg font-black text-gray-900">{articlesWithSurveys.length}</span>
                  </div>
                </div>
              </div>

              {/* Реклама */}
              <div className="border-2 border-dashed border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-3">Реклама</p>
                <div className="h-48 bg-gray-50 border border-gray-100" />
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}