'use client';

import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import AdBanner from '@/app/components/AdBanner';
import { SIDEBAR_ADS } from '@/app/config/ads';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  category: string | null;
  status: string;
  surveyId: string | null;
  surveyTitle: string | null;
  createdAt: string;
  surveyClosesAt: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
}

function parseSourceLine(line: string): { text: string; url: string | null } {
  const mdLink = line.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);
  if (mdLink) return { text: mdLink[1], url: mdLink[2] };

  const isUrl = /^https?:\/\//i.test(line.trim());
  if (isUrl) {
    let domain = line.trim();
    try { domain = new URL(line.trim()).hostname.replace(/^www\./, ''); } catch { /* keep original */ }
    return { text: domain, url: line.trim() };
  }

  return { text: line.trim(), url: null };
}

function SourceItem({ line, index }: { line: string; index: number }) {
  const { text, url } = parseSourceLine(line);
  return (
    <div className="flex gap-3 items-start py-3 border-b border-gray-100 last:border-0">
      <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white text-xs font-black flex items-center justify-center mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold text-sm underline underline-offset-2 transition-colors"
          >
            {text}
          </a>
        ) : (
          <p className="text-sm font-bold text-gray-700 leading-relaxed">{text}</p>
        )}
      </div>
    </div>
  );
}

export default function ArticleClient({ article }: { article: Article }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const sources = (article.sources || '').split('\n').filter(s => s.trim());

  // 1. Normalise line endings
  // 2. Single \n between text → \n\n so every Enter becomes a <p> break
  // 3. Detect section headings: a standalone block that is short (8–90 chars),
  //    contains a space (not a single word), and does NOT end with sentence-final
  //    punctuation (. , ; ! ) — those are regular paragraphs.
  //    Explicit ## markers are always preserved as-is.
  const processedContent = (() => {
    const normalised = (article.content || '')
      .replace(/\r\n/g, '\n')
      .replace(/([^\n])\n(?=[^\n])/g, '$1\n\n');

    return normalised
      .split(/\n\n+/)
      .map(block => {
        const t = block.trim();
        if (!t) return '';
        if (t.startsWith('#')) return t;
        if (
          t.length >= 8 &&
          t.length <= 90 &&
          t.includes(' ') &&
          !t.endsWith('.') &&
          !t.endsWith(',') &&
          !t.endsWith(';') &&
          !t.endsWith('!') &&
          !t.includes('\n')
        ) {
          return `## ${t}`;
        }
        return t;
      })
      .filter(Boolean)
      .join('\n\n');
  })();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Dark hero — title, summary, date */}
      <section className="bg-slate-900 pt-24 sm:pt-32 pb-8 sm:pb-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-black tracking-wider uppercase mb-6 transition-colors border border-gray-600 px-4 py-2 hover:border-white"
            >
              ← НАЗАД КЪМ НОВИНИТЕ
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="inline-block border border-blue-500 px-3 py-1">
                <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                  {article.category || 'НОВИНИ'}
                </span>
              </div>
              {article.surveyId && article.surveyClosesAt && new Date(article.surveyClosesAt) > new Date() && (
                <div className="inline-block border border-green-500 px-3 py-1">
                  <span className="text-green-400 text-xs font-bold tracking-widest uppercase">● Активна анкета</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-5 tracking-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-gray-300 text-base sm:text-xl leading-relaxed mb-5 font-normal max-w-3xl">
                {article.summary}
              </p>
            )}

            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('bg-BG', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Hero image — 4:3 on mobile → 16:9 on tablet → 21:9 on desktop */}
      {article.imageUrl && (
        <div className="w-full overflow-hidden bg-gray-900 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] lg:max-h-[560px]">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </div>
      )}

      {/* Main content grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <div className="grid grid-cols-12 gap-6 lg:gap-10">

          {/* Article body */}
          <article className="col-span-12 lg:col-span-8">
            <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="article-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-black text-gray-900 mt-12 mb-5 leading-tight tracking-tight">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-black text-gray-900 mt-12 mb-4 pb-3 border-b-2 border-gray-900 leading-tight tracking-tight">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3 leading-tight">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-800 text-[1.1rem] leading-[1.95] mb-8 font-normal">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-7 mb-8 space-y-2 text-gray-800">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-7 mb-8 space-y-2 text-gray-800">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-[1.05rem] leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-gray-900">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-700">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-6 py-3 pr-4 my-8 bg-blue-50 rounded-r text-gray-700 italic">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => {
                      const safeHref = href && /^https?:\/\//i.test(href) ? href : undefined;
                      return (
                        <a
                          href={safeHref}
                          className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      );
                    },
                    hr: () => <hr className="border-gray-200 my-10" />,
                  }}
                >
                  {processedContent}
                </ReactMarkdown>
              </div>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className={`mt-10 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div className="w-1 h-5 bg-blue-600 flex-shrink-0" />
                    <p className="text-xs font-black text-gray-900 tracking-widest uppercase">
                      Източници ({sources.length})
                    </p>
                  </div>
                  {sources.map((line, i) => (
                    <SourceItem key={i} line={line} index={i} />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            {article.surveyId && article.surveyClosesAt && new Date(article.surveyClosesAt) > new Date() && (
              <div className={`border border-blue-200 bg-blue-50 p-6 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-xs font-black text-blue-600 tracking-widest uppercase mb-3 border-b border-blue-200 pb-2">
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

            <div className="border border-gray-200 p-6">
              <p className="text-xs font-black text-gray-900 tracking-widest uppercase border-b border-gray-200 pb-2 mb-3">
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

            <AdBanner banners={SIDEBAR_ADS} />
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
