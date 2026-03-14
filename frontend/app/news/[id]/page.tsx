'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/${id}`)
      .then(res => res.json())
      .then(setArticle)
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => setVisible(true), 100);
  }, [id]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {loading ? (
        <div className="max-w-3xl mx-auto px-6 pt-32 space-y-4">
          <div className="h-12 bg-gray-100 animate-pulse" />
          <div className="h-6 bg-gray-50 animate-pulse w-2/3" />
          <div className="h-96 bg-gray-50 animate-pulse mt-8" />
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="bg-slate-900 pt-32 pb-16 px-6">
            <div className="max-w-4xl mx-auto">
              <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-black tracking-wider uppercase mb-6 transition-colors border border-gray-600 px-4 py-2 hover:border-white"
                >
                  ← НАЗАД КЪМ НОВИНИТЕ
                </Link>

                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-block border border-blue-500 px-3 py-1">
                    <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                      НОВИНИ
                    </span>
                  </div>
                  {article?.surveyId && (
                    <div className="inline-block border border-green-500 px-3 py-1">
                      <span className="text-green-400 text-xs font-bold tracking-widest uppercase">
                        ● Активна анкета
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                  {article?.title}
                </h1>
                <p className="text-gray-400 text-lg mb-4">{article?.summary}</p>
                <p className="text-gray-600 text-sm font-bold tracking-wider uppercase">
                  {article && new Date(article.publishedAt || article.createdAt).toLocaleDateString('bg-BG', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* Съдържание */}
          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-12 gap-8">

              {/* Статия */}
              <article className="col-span-12 lg:col-span-8">
                <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {article?.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>

              {/* Дясна колона */}
              <aside className="col-span-12 lg:col-span-4 space-y-6">

                {/* Анкета */}
                {article?.surveyId && (
                  <div className={`border-2 border-blue-600 p-6 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <p className="text-xs font-black text-blue-600 tracking-widest uppercase mb-3 border-b-2 border-blue-600 pb-2">
                      ● Свързана анкета
                    </p>
                    <p className="font-black text-gray-900 text-lg leading-tight mb-4">
                      {article.surveyTitle}
                    </p>
                    <Link href={`/surveys/${article.surveyId}`}>
                      <button className="w-full bg-blue-600 text-white py-3 text-xs font-black tracking-widest uppercase hover:bg-blue-700 transition-colors">
                        ГЛАСУВАЙ
                      </button>
                    </Link>
                  </div>
                )}

                {/* За платформата */}
                <div className="border-2 border-gray-900 p-6">
                  <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b-2 border-gray-900 pb-2 mb-3">
                    За платформата
                  </p>
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">
                    Социолог.bg е независима платформа за анонимни граждански проучвания. Всеки глас е защитен с криптографски хеш.
                  </p>
                </div>

                {/* Реклама */}
                <div className="border-2 border-dashed border-gray-200 p-6">
                  <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-3">Реклама</p>
                  <div className="h-48 bg-gray-50 border border-gray-100" />
                </div>
              </aside>
            </div>
          </main>
        </>
      )}

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