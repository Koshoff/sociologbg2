'use client';
 
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useEffect, useState } from 'react';
 
export default function AboutPage() {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);
 
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
 
      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-block border border-gray-600 px-3 py-1 mb-4">
              <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">
                За платформата
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-none mb-6 tracking-tight">
              ЗА НАС
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Платформа създадена с една цел да даде глас на всеки,
              без значение кой е и откъде идва.
            </p>
          </div>
        </div>
      </section>
 
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-12 gap-6">
 
          {/* Основно съдържание */}
          <div className="col-span-12 lg:col-span-8 space-y-16">
 
            {/* Как се зароди идеята */}
            <section>
              <div className="flex items-center gap-4 mb-8 pb-3 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Как се зароди идеята
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
 
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg text-gray-800 font-medium leading-relaxed">
                  Всичко започна от един спор.
                </p>
                <p>
                  Двама приятели, различни гледни точки по една тема и в един момент осъзнахме,
                  че и двамата задаваме един и същи въпрос: <em>"Ами какво мислят останалите хора?"</em>
                </p>
                <p>
                  Огледахме се наоколо и видяхме, че липсва нещо просто — място, където обикновеният
                  човек може да каже мнението си по актуална тема, без да се регистрира, без да бъде
                  проследен и без да се притеснява, че гласът му ще бъде игнориран или манипулиран.
                </p>
                <p>
                  Така се роди Sociolog.bg. Не от голяма корпорация, не от политическа организация, a
                  от обикновен разговор между двама души, които искаха да чуят какво мислят масите.
                </p>
              </div>
            </section>
 
            {/* Нашата мисия */}
            <section>
              <div className="flex items-center gap-4 mb-8 pb-3 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Нашата мисия
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
 
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg text-gray-800 font-medium leading-relaxed">
                  Вярваме, че общественото мнение има стойност само когато е свободно изразено.
                </p>
                <p>
                  Мисията ни е проста: да създадем пространство, в което всеки може да участва
                  в граждански проучвания анонимно и без бариери. Без акаунт, без лични данни,
                  без страх от последствия.
                </p>
                <p>
                  Всеки глас на платформата е криптографски защитен. Технически няма начин
                  да се установи кой е как е гласувал. Не защото разчитаме на добросъвестност,
                  а защото системата е проектирана да го гарантира математически.
                </p>
                <p>
                  Искаме да покажем какво мислят хората - не политиците, не медиите, не
                  експертите, а обикновените хора. Масите. Вие.
                </p>
              </div>
            </section>
 
            {/* Ценности */}
            <section>
              <div className="flex items-center gap-4 mb-8 pb-3 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Нашите принципи
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Анонимност',
                    description: 'Вашата самоличност никога не се записва. Гласувате свободно, без да оставяте следа.',
                  },
                  {
                    title: 'Прозрачност',
                    description: 'Сорс кодът е публично достъпен. Всеки може да провери как работи системата.',
                  },
                  {
                    title: 'Независимост',
                    description: 'Нямаме политическа или корпоративна обвързаност. Резултатите са такива, каквито са.',
                  },
                  {
                    title: 'Достъпност',
                    description: 'Без регистрация, без такси, без бариери. Гласуването трябва да е лесно за всеки.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border border-gray-200 p-5 rounded-sm hover:border-gray-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
 
          </div>
 
          {/* Дясна колона */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
 
            <div className="border border-gray-200 p-6 rounded-sm bg-slate-900">
              <p className="text-gray-500 text-xs font-medium tracking-widest uppercase mb-4">
                С две думи
              </p>
              <p className="text-white font-medium text-lg leading-relaxed">
                "Искахме да знаем какво мислят хората. Затова го изградихме."
              </p>
              <p className="text-gray-500 text-sm mt-4">
                — Екипът на Социолог.bg
              </p>
            </div>
 
            <div className="border border-gray-200 p-5 rounded-sm">
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase border-b border-gray-100 pb-2 mb-4">
                Бързи факти
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Основана', value: '2026' },
                  { label: 'Екип', value: '2 души' },
                  { label: 'Гласовете се пазят', value: 'Анонимно' },
                  { label: 'Код', value: 'Open source' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
 
            <div className="border border-gray-200 p-5 rounded-sm">
              <p className="text-xs font-semibold text-gray-500 tracking-widests uppercase border-b border-gray-100 pb-2 mb-4">
                Полезни връзки
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Как работи системата', href: '/how-it-works' },
                  { label: 'Активни проучвания', href: '/' },
                  { label: 'Архив с резултати', href: '/archive' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-blue-600 transition-colors group"
                  >
                    <span className="text-sm text-gray-600 group-hover:text-blue-600">{link.label}</span>
                    <span className="text-gray-300 group-hover:text-blue-400">→</span>
                  </a>
                ))}
              </div>
            </div>
 
          </aside>
        </div>
      </main>
 
      <Footer />
    </div>
  );
}