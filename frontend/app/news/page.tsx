'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  status: string;
  surveyId: string | null;
  surveyTitle: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/articles`)
      .then(res => res.json())
      .then(data => {
        console.log('Articles:', data);
        setArticles(data);
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
            <div className="inline-block border border-blue-500 px-3 py-1 mb-4">
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
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
            <div className="col-span-12 lg:col-span-8 h-96 bg-gray-50 animate-pulse border border-gray-100" />
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-50 animate-pulse border border-gray-100" />)}
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
          <div className="grid grid-cols-12 gap-6">

            {/* Featured статия */}
            <div className="col-span-12 lg:col-span-8">
              <Link href={`/news/${featured.id}`}>
                <div
                  className="border-2 border-gray-900 p-8 h-full cursor-pointer transition-all duration-150"
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
                    <div className="bg-blue-600 px-3 py-1">
                      <span className="text-white text-xs font-black tracking-widest uppercase">FEATURED</span>
                    </div>
                    {featured.surveyId && (
                      <div className="border border-green-500 px-3 py-1">
                        <span className="text-green-600 text-xs font-black tracking-widest uppercase">● Активна анкета</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                    {featured.summary}
                  </p>
                  <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString('bg-BG', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <span className="text-xs font-black text-blue-600 tracking-wider uppercase">
                      ПРОЧЕТИ →
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Дясна колона */}
            <div className="col-span-12 lg:col-span-4 space-y-4">

              {/* Последни статии */}
              {rest.slice(0, 3).map((article, index) => (
                <Link key={article.id} href={`/news/${article.id}`}>
                  <div
                    className={`border-2 border-gray-900 p-5 cursor-pointer transition-all duration-150 ${
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
                    {article.surveyId && (
                      <span className="text-xs font-black text-green-600 tracking-widest uppercase mb-2 block">
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

              {/* Реклама placeholder */}
              <div className="border-2 border-dashed border-gray-200 p-6">
                <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-3">Реклама</p>
                <div className="h-32 bg-gray-50 border border-gray-100" />
              </div>
            </div>

            {/* Останалите статии — долу */}
            {rest.length > 3 && (
              <div className="col-span-12 mt-4">
                <div className="border-b-2 border-gray-900 pb-3 mb-6">
                  <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">Още статии</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.slice(3).map((article, index) => (
                    <Link key={article.id} href={`/news/${article.id}`}>
                      <div
                        className="border-2 border-gray-900 p-5 cursor-pointer transition-all duration-150"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translate(-2px, 2px)';
                          e.currentTarget.style.boxShadow = '4px -4px 0px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translate(0, 0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {article.surveyId && (
                          <span className="text-xs font-black text-green-600 tracking-widest uppercase mb-2 block">
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
              </div>
            )}
          </div>
        )}
      </main>

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