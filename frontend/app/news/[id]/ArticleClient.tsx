'use client';

import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

import { useState, useEffect } from 'react';

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
  surveyClosesAt: string | null;
  publishedAt: string | null;
}

export default function ArticleClient({ article }: { article: Article }) {
  const [visible, setVisible] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

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
                <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">НОВИНИ</span>
              </div>
              {article.surveyId && article.surveyClosesAt && new Date(article.surveyClosesAt) > new Date() && (
                <div className="inline-block border border-green-500 px-3 py-1">
                  <span className="text-green-400 text-xs font-bold tracking-widest uppercase">● Активна анкета</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              {article.title}
            </h1>
            <p className="text-gray-400 text-lg mb-4">{article.summary}</p>
            <p className="text-gray-600 text-sm font-bold tracking-wider uppercase">
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('bg-BG', {
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
              {(article.content || '').split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-700 text-lg leading-relaxed mb-8 font-medium">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Източници */}
            {article.sources && (
              <div className={`border-t-2 border-gray-900 pt-6 mt-8 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase mb-4">
                  Източници
                </p>
                <div className="space-y-2">
                  {article.sources && article.sources.split('\n').filter(s => s.trim()).map((source, i) => (
                    <p key={i} className="text-xs font-bold text-gray-400 leading-relaxed">
                      {i + 1}. {source}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Дясна колона */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">

            {/* Анкета */}
            {article.surveyId && article.surveyClosesAt && new Date(article.surveyClosesAt) > new Date() && (
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
              <p className="text-xs text-gray-500 font-bold leading-relaxed mb-4">
                Социолог.bg е независима платформа за анонимни граждански проучвания. Всеки глас е защитен с криптографски хеш.
              </p>
              <div className="space-y-2">
                <Link href="/about">
                  <p className="text-xs font-black text-gray-600 hover:text-gray-900 uppercase tracking-wider transition-colors">За нас →</p>
                </Link>
                <Link href="/mission">
                  <p className="text-xs font-black text-gray-600 hover:text-gray-900 uppercase tracking-wider transition-colors">Нашата мисия →</p>
                </Link>
              </div>
            </div>

            {/* Реклама */}
            <div className="border-2 border-dashed border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-300 tracking-widest uppercase text-center mb-3">Реклама</p>
              <div className="h-48 bg-gray-50 border border-gray-100" />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}