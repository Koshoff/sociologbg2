'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getSurvey, getResults, Survey, VoteResult } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const CHOICES = ['ДА', 'НЕ', 'ВЪЗДЪРЖАЛ СЕ'];

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'преди малко';
  if (diff < 3600) return `преди ${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `преди ${Math.floor(diff / 3600)} ч`;
  if (diff < 2592000) return `преди ${Math.floor(diff / 86400)} дни`;
  return new Date(dateStr).toLocaleDateString('bg-BG');
}

function UserAvatar({ hash }: { hash: string }) {
  const color = '#' + hash.slice(0, 6);
  return (
    <div
      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor: color }}
    >
      {hash.slice(0, 2).toUpperCase()}
    </div>
  );
}

function CommentCard({
  comment,
  googleToken,
  onUpvote,
  onReply,
  isReply = false,
}: {
  comment: any;
  googleToken: string | null;
  onUpvote: (id: string) => void;
  onReply: (id: string, hash: string) => void;
  isReply?: boolean;
}) {
  return (
    <div className={`flex gap-3 py-3 ${!isReply ? 'border-b border-gray-100' : ''}`}>
      <UserAvatar hash={comment.authorHash} />
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-700">
            #{comment.authorHash.slice(0, 8)}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-400">{relativeTime(comment.createdAt)}</span>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-900 leading-relaxed mb-2">{comment.content}</p>

        {/* Action row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpvote(comment.id)}
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors group"
          >
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l8 8H4z"/>
            </svg>
            <span>{comment.upvotes}</span>
          </button>
          {googleToken && !isReply && (
            <button
              onClick={() => onReply(comment.id, comment.authorHash)}
              className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
            >
              Отговори
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-3 border-l-2 border-gray-100 pl-4 space-y-0">
            {comment.replies.map((reply: any) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                googleToken={googleToken}
                onUpvote={onUpvote}
                onReply={onReply}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    google: any;
  }
}

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<VoteResult | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{id: string, hash: string} | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentLogin, setShowCommentLogin] = useState(false);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
        const res = await fetch(`${API_URL}/api/comments/survey/${id}`);
        const data = await res.json();
        setComments(data);
    } catch {}
    finally { setLoadingComments(false); }
};

const saveGoogleToken = (token: string) => {
    setGoogleToken(token);
    localStorage.setItem('google_token', token);
};

  useEffect(() => {
    const voted = localStorage.getItem(`voted_${id}`);
    if (voted) setHasVoted(true);

    const token = localStorage.getItem('google_token'); // ← добави това
    if (token) setGoogleToken(token);                   // ← и това

    getSurvey(id)
      .then(setSurvey)
      .catch(() => setError('Проучването не е намерено'))
      .finally(() => setLoading(false));

    getResults(id).then(setResults).catch(() => {});
    setTimeout(() => setVisible(true), 100);
    loadComments();
    }, [id]);

  useEffect(() => {
    if (!showGooglePopup) return;

    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            locale: 'bg',
          }
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showGooglePopup]);

  useEffect(() => {
    if (!showCommentLogin) return;

    const interval = setInterval(() => {
        if (window.google) {
            clearInterval(interval);
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response: any) => {
                    saveGoogleToken(response.credential);
                    setShowCommentLogin(false);
                },
                auto_select: false,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('comment-signin-button'),
                {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with',
                    locale: 'bg',
                }
            );
        }
    }, 100);

    return () => clearInterval(interval);
}, [showCommentLogin]);

  const handleGoogleResponse = async (response: any) => {
    if (!selectedChoice) return;
    setVoting(true);
    setError(null);
    setShowGooglePopup(false);
    saveGoogleToken(response.credential);

    try {
      const res = await fetch(`${API_URL}/api/votes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choice: selectedChoice,
          identifier: response.credential
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(`voted_${id}`, 'true');
        setHasVoted(true);
        const newResults = await getResults(id);
        setResults(newResults);
      } else {
        setError(data.message || 'Грешка при гласуване');
      }
    } catch {
      setError('Грешка при гласуване. Опитайте отново.');
    } finally {
      setVoting(false);
    }
  };

  const total = results?.total || {};
  const totalVotes = Object.values(total).reduce((a, b) => a + b, 0);

  

const submitComment = async (parentId?: string) => {
    if (!commentText.trim() || !googleToken) return;
    
    try {
        const res = await fetch(`${API_URL}/api/comments/survey/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${googleToken}`
            },
            body: JSON.stringify({
                content: commentText,
                parentId: parentId || null
            })
        });
        
        if (res.status === 401) {
            // Токенът е изтекъл
            localStorage.removeItem('google_token');
            setGoogleToken(null);
            setError('Сесията е изтекла. Влез отново с Google.');
            return;
        }
        
        if (res.ok) {
            setCommentText('');
            setReplyTo(null);
            loadComments();
        }
    } catch {}
};

  const upvoteComment = async (commentId: string) => {
      await fetch(`${API_URL}/api/comments/${commentId}/upvote`, { method: 'POST' });
      loadComments();
  };

  if (loading) return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 space-y-4">
        <div className="h-12 bg-gray-100 animate-pulse" />
        <div className="h-6 bg-gray-50 animate-pulse w-2/3" />
        <div className="h-48 bg-gray-50 animate-pulse mt-8" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Google Popup */}
      {showGooglePopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowGooglePopup(false); }}
        >
          <div className="bg-white border border-gray-200 max-w-sm w-full"
            style={{ boxShadow: '8px -8px 0px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-xs font-black text-white tracking-widest uppercase">
                  Потвърди гласа си
                </p>
              </div>
              <button
                onClick={() => setShowGooglePopup(false)}
                className="text-gray-400 hover:text-white font-black text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Избран отговор */}
              <div className="border border-blue-200 bg-blue-50 p-4 mb-5 flex items-center justify-between">
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                  Твоят избор
                </p>
                <p className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  {selectedChoice}
                </p>
              </div>

              {/* Описание */}
              <p className="text-xs font-bold text-gray-500 mb-5 leading-relaxed">
                Sociolog.bg не съхранява Вашия имейл или име. 
                Входът чрез Google служи единствено за защита от ботове и гарантира пълна анонимност на Вашия глас, 
                който остава непроследим и защитен съгласно принципите на GDPR.

              </p>

              {/* Google бутон */}
              <div id="google-signin-button" className="flex justify-center mb-5" />

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">
                  Анонимно · Защитено · Без двойно гласуване
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="inline-block border border-green-500 px-3 py-1">
                <span className="text-green-500 text-xs font-bold tracking-widest uppercase">
                  ● Активно проучване
                </span>
              </div>
              {survey?.category && (
                <div className="inline-block border border-amber-400 px-3 py-1">
                  <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">{survey.category}</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none mb-4 tracking-tight">
              {survey?.title}
            </h1>
            {survey?.description && (
              <p className="text-gray-400 text-lg mb-4">{survey.description}</p>
            )}
            <p className="text-gray-600 text-sm font-bold tracking-wider uppercase mb-4">
              Затваря: {survey && new Date(survey.closesAt).toLocaleDateString('bg-BG')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-black tracking-wider uppercase transition-colors border border-gray-600 px-4 py-2 hover:border-white"
            >
              ← НАЗАД
            </Link>
          </div>
        </div>
      </section>

      {/* Основно съдържание */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Гласуване */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 border-b border-gray-200 pb-2">
              Вашият глас
            </p>

            {!hasVoted ? (
              <div>
                <div className="space-y-2 mb-6">
                  {CHOICES.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => setSelectedChoice(choice)}
                      className={`w-full py-4 px-6 border font-black text-sm tracking-wider uppercase text-left transition-all duration-150 ${
                        selectedChoice === choice
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                      onMouseEnter={(e) => {
                        if (selectedChoice !== choice) {
                          e.currentTarget.style.transform = 'translate(-2px, 2px)';
                          e.currentTarget.style.boxShadow = '4px -4px 0px rgba(0,0,0,0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
                )}

                <button
                  onClick={() => {
                    if (!selectedChoice) return;
                    setShowGooglePopup(true);
                  }}
                  disabled={!selectedChoice || voting}
                  className="w-full py-4 bg-blue-600 text-white font-black text-sm tracking-widest uppercase hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {voting ? 'ИЗПРАЩАНЕ...' : 'ГЛАСУВАЙ'}
                </button>

                <p className="text-xs text-gray-400 font-bold tracking-wider mt-3 text-center uppercase">
                  Верифицирано с Google · Без двойно гласуване
                </p>
              </div>
            ) : (
              <div>
    <div className="border border-emerald-200 bg-emerald-50 p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center">
          <span className="text-white text-xs font-black">✓</span>
        </div>
        <p className="font-black text-emerald-700 uppercase tracking-wider">Гласът е записан!</p>
      </div>
      <p className="text-sm text-emerald-600 font-bold">Благодарим за участието.</p>
    </div>

    
  </div>
            )}
          </div>

          {/* Резултати */}
          <div className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4 border-b border-gray-200 pb-2">
              Резултати · {totalVotes} гласа
            </p>

            {totalVotes > 0 ? (
              <div className="space-y-4 mb-6">
                {Object.entries(total)
                  .sort(([, a], [, b]) => b - a)
                  .map(([choice, count]) => {
                    const percent = Math.round((count / totalVotes) * 100);
                    const isWinner = count === Math.max(...Object.values(total));
                    return (
                      <div key={choice}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`font-black tracking-wider uppercase ${isWinner ? 'text-gray-900' : 'text-gray-400'}`}>
                            {isWinner && '▲ '}{choice}
                          </span>
                          <span className="font-black text-gray-900">{percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-100">
                          <div
                            className={`h-full transition-all ${isWinner ? 'bg-blue-600' : 'bg-gray-300'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">{count} гласа</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                Все още няма гласове
              </p>
            )}

            
          </div>
        </div>
      </main>

      {/* Коментари */}
<section className="max-w-3xl mx-auto px-4 pb-16">
  {/* Header */}
  <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
    <h2 className="text-base font-bold text-gray-900">Дискусия</h2>
    <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
      {comments.length}
    </span>
  </div>

  {/* Comment Box */}
  {googleToken ? (
    <div className="mb-6 border border-gray-200 rounded-md overflow-hidden bg-white">
      {replyTo && (
        <div className="bg-blue-50 border-b border-blue-100 px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-blue-600 font-medium">
            Отговаряш на <span className="font-bold">#{replyTo.hash.slice(0, 8)}</span>
          </span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-xs text-blue-400 hover:text-blue-700 font-bold transition-colors"
          >
            ✕ Откажи
          </button>
        </div>
      )}
      <textarea
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        placeholder={hasVoted ? 'Защо гласува така?' : 'Сподели мнението си...'}
        rows={4}
        className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none"
      />
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex justify-end">
        <button
          onClick={() => submitComment(replyTo?.id)}
          disabled={!commentText.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
        >
          Коментирай
        </button>
      </div>
    </div>
  ) : (
    <div className="mb-6 border border-dashed border-gray-300 rounded-md p-5 text-center bg-gray-50">
      <p className="text-sm text-gray-500 mb-3">
        Влез с Google за да коментираш
      </p>
      {!showCommentLogin ? (
        <button
          onClick={() => setShowCommentLogin(true)}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Влез с Google
        </button>
      ) : (
        <div id="comment-signin-button" className="flex justify-center" />
      )}
    </div>
  )}

  {/* Comment List */}
  {loadingComments ? (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  ) : comments.length === 0 ? (
    <div className="text-center py-12">
      <p className="text-gray-400 text-sm">Няма коментари още. Бъди първият!</p>
    </div>
  ) : (
    <div className="space-y-0">
      {comments.map(comment => (
        <CommentCard
          key={comment.id}
          comment={comment}
          googleToken={googleToken}
          onUpvote={upvoteComment}
          onReply={(id, hash) => {
            setReplyTo({ id, hash });
            setCommentText('');
            setTimeout(() => document.querySelector('textarea')?.focus(), 50);
          }}
        />
      ))}
    </div>
  )}
</section>

      <Footer />
    </div>
  );
}