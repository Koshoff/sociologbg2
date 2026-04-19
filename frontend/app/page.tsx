'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSurveys, Survey } from '@/lib/api';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import AdBanner from '@/app/components/AdBanner';
import { SIDEBAR_ADS } from '@/app/config/ads';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const SURVEYS_PER_PAGE = 4;

interface TopSurvey {
  id: string;
  title: string;
  vote_count: number;
}

interface Article {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function HomePage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [topSurveys, setTopSurveys] = useState<TopSurvey[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);

  useEffect(() => {
    getSurveys()
      .then(setSurveys)
      .catch(() => {})
      .finally(() => setLoading(false));

    setTimeout(() => setVisible(true), 100);

    fetch(`${API_URL}/api/votes/total`)
      .then(res => res.json())
      .then(data => setTotalVotes(data.total))
      .catch(() => {});

    fetch(`${API_URL}/api/votes/top-surveys`)
      .then(res => res.json())
      .then(setTopSurveys)
      .catch(() => {});

    fetch(`${API_URL}/api/articles`)
      .then(res => res.json())
      .then(data => setLatestNews(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const totalPages = Math.ceil(surveys.length / SURVEYS_PER_PAGE);
  const paginated = surveys.slice(page * SURVEYS_PER_PAGE, (page + 1) * SURVEYS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-none mb-6 mt-6 tracking-tight">
              ТВОЕТО МНЕНИЕ<br />
              <span className="text-blue-500">ИМА ЗНАЧЕНИЕ.</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl">
              Анонимни и достоверни социологически проучвания.
              Гражданският вот е основата на демокрацията.
              Гласувайте без регистрация.
            </p>
          </div>

          {/* Фикс за счупването на Hero статистиката на мобилни */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-px bg-gray-100 mt-10 max-w-xl">
            {[
              { label: 'АКТИВНИ', value: surveys.length.toString() },
              { label: 'ОБЩО ГЛАСОВЕ', value: totalVotes.toLocaleString('bg-BG') },
              { label: 'БЕЗ РЕГИСТРАЦИЯ', value: '✓' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900 px-6 py-4 border-b sm:border-b-0 border-gray-800">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 font-bold tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Основно тяло */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Лява колона — sticky */}
          <aside className="col-span-3 hidden lg:block sticky top-24 space-y-4">
            {/* Топ анкети */}
            <div className="border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Топ проучвания
              </p>
              {topSurveys.length > 0 ? (
                <div className="space-y-3">
                  {topSurveys.map((s, i) => (
                    <Link key={s.id} href={`/surveys/${s.id}`}>
                      <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-2xl font-black text-amber-200 leading-none w-6 flex-shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-tight">{s.title}</p>
                          <p className="text-xs font-bold text-blue-600 mt-1">{Number(s.vote_count)} гласа</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма данни</p>
              )}
            </div>

            {/* Статистика */}
            <div className="border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Статистика
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Активни</span>
                  <span className="text-lg font-black text-gray-900">{surveys.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Общо гласове</span>
                  <span className="text-lg font-black text-gray-900">{totalVotes.toLocaleString('bg-BG')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Страница</span>
                  <span className="text-lg font-black text-gray-900">{page + 1}/{totalPages || 1}</span>
                </div>
              </div>
            </div>

            <AdBanner banners={SIDEBAR_ADS} />
          </aside>

          {/* Централна колона */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase">
                Текущи проучвания
              </h2>
              <Link href="/archive" className="text-xs font-bold text-gray-400 hover:text-gray-900 tracking-wider uppercase transition-colors">
                Архив →
              </Link>
            </div>

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-gray-50 border border-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && (
              <>
                <div className="space-y-4">
                  {paginated.map((survey, index) => (
                    <Link
                      key={survey.id}
                      href={`/surveys/${survey.id}`}
                      className={`block border border-gray-200 p-4 sm:p-6 shadow-sm transition-all duration-150 cursor-pointer ${
                        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translate(-3px, 3px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '6px -6px 0px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translate(0, 0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                      }}
                    >
                      {/* Фикс за хедъра на анкетата */}
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 text-lg leading-tight">{survey.title}</h3>
                          {survey.description && (
                            <p className="text-gray-500 text-sm mt-2">{survey.description}</p>
                          )}
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Краен срок</p>
                          <p className="text-sm font-black text-gray-900">
                            {new Date(survey.closesAt).toLocaleDateString('bg-BG')}
                          </p>
                        </div>
                      </div>

                      {/* Еднакви бутони (flex-1 ги прави с равна ширина) */}
                      <div className="flex flex-row items-center gap-1.5 w-full mt-4">
                        {/* Активно */}
                        <div className="flex-1 h-9 flex items-center justify-center gap-1.5 overflow-hidden">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0 animate-pulse"></div>
                          <span className="text-[9px] sm:text-[10px] font-black text-green-700 tracking-wider uppercase truncate">Активно</span>
                        </div>

                        {/* Категория */}
                        {survey.category && (
                          <div className="flex-1 h-9 flex items-center justify-center border border-amber-200 px-1 overflow-hidden">
                            <span className="text-[9px] sm:text-[10px] font-black text-amber-700 tracking-wider uppercase truncate">
                              {survey.category}
                            </span>
                          </div>
                        )}

                        {/* Гласувай */}
                        <div className="flex-1 h-9 flex items-center justify-center bg-blue-600 border border-blue-600 text-white px-1 overflow-hidden">
                          <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase truncate">
                            ГЛАСУВАЙ
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {surveys.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 p-12 text-center">
                      <p className="text-gray-400 font-bold tracking-wider uppercase text-sm">
                        Няма активни проучвания
                      </p>
                    </div>
                  )}
                </div>

                {/* Странирането */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-gray-900 gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="border-2 border-gray-900 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-black tracking-widest uppercase hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-8 h-8 text-xs font-black transition-colors ${
                            page === i
                              ? 'bg-slate-900 text-white'
                              : 'border-2 border-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="border-2 border-gray-900 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-black tracking-widest uppercase hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Мобилна допълнителна информация */}
          <div className="col-span-12 lg:hidden space-y-4 mt-4">
            {/* Топ анкети */}
            <div className="border border-gray-200 p-4">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Топ проучвания
              </p>
              {topSurveys.length > 0 ? (
                <div className="space-y-3">
                  {topSurveys.map((s, i) => (
                    <Link key={s.id} href={`/surveys/${s.id}`}>
                      <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                        <span className="text-2xl font-black text-gray-200 leading-none w-6 flex-shrink-0">{i + 1}</span>
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-tight">{s.title}</p>
                          <p className="text-[10px] font-bold text-blue-600 mt-1">{Number(s.vote_count)} гласа</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма данни</p>
              )}
            </div>

            {/* --- ПЪРВИ МОБИЛЕН БАНЕР --- */}
            <div className="py-2">
              <AdBanner banners={SIDEBAR_ADS} />
            </div>

            {/* Последни новини */}
            <div className="border border-gray-200 p-4">
              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2 mb-4">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase">Последни новини</p>
                <Link href="/news" className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Всички →</Link>
              </div>
              {latestNews.length > 0 ? (
                <div className="space-y-3">
                  {latestNews.map((article) => (
                    <Link key={article.id} href={`/news/${article.slug || article.id}`}>
                      <div className="py-2 border-b border-gray-100 last:border-0">
                        <p className="text-xs font-black text-gray-900 leading-tight mb-1">{article.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Няма новини</p>
              )}
            </div>

            {/* Статистика (Сменена структура за мобилни) */}
            <div className="border border-gray-200 p-4">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-4">
                Статистика
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2 text-center border border-gray-100">
                  <p className="text-base font-black text-gray-900 leading-none mb-1">{surveys.length}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Активни</p>
                </div>
                <div className="bg-gray-50 p-2 text-center border border-gray-100">
                  <p className="text-base font-black text-gray-900 leading-none mb-1">{totalVotes >= 1000 ? (totalVotes/1000).toFixed(1) + 'k' : totalVotes}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Гласове</p>
                </div>
                <div className="bg-gray-50 p-2 text-center border border-gray-100">
                  <p className="text-base font-black text-gray-900 leading-none mb-1">{page + 1}/{totalPages || 1}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Стр.</p>
                </div>
              </div>
            </div>
          </div>

          

          {/* Дясна колона — sticky */}
          <aside className="col-span-3 hidden lg:block sticky top-24 space-y-4">
            {/* Последни новини */}
            <div className="border border-gray-200 p-5">
              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2 mb-4">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
                  Последни новини
                </p>
                <Link href="/news" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                  Всички →
                </Link>
              </div>
              {latestNews.length > 0 ? (
                <div className="space-y-3">
                  {latestNews.map((article) => (
                    <Link key={article.id} href={`/news/${article.slug || article.id}`}>
                      <div className="py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                        <p className="text-xs font-black text-gray-900 leading-tight mb-1">{article.title}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Няма новини</p>
              )}
            </div>

            {/* Архив */}
            <div className="border border-gray-200 p-5">
              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2 mb-4">
                <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
                  Архив
                </p>
                <Link href="/archive" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                  Виж →
                </Link>
              </div>
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                Разгледай приключилите проучвания и техните финални резултати.
              </p>
            </div>

            <AdBanner banners={SIDEBAR_ADS} />
          </aside>
        </div>
      </main>

      <Footer/>
    </div>
  );
}