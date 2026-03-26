'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useState, useEffect } from 'react';

export default function HowItWorksPage() {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Удостоверяване с Google',
      technical: 'OAuth 2.0 токен верификация',
      description:
        'При гласуване системата получава временен OAuth токен от Google. От него извличаме единствено вашия Google ID — уникален числов идентификатор. Паролата ви, имейлът ви и всякаква друга лична информация остават недостъпни за нас.',
      detail:
        'Примерен Google ID: 108234567890123456789 — само това число постъпва в обработката. Токенът не се съхранява.',
      icon: '🔑',
    },
    {
      number: '02',
      title: 'Комбиниране със Salt и Pepper',
      technical: 'Криптографска подготовка',
      description:
        'Всяко проучване притежава уникален "salt" — произволна низова стойност, генерирана при създаването му. Към нея се добавя и "pepper" — таен ключ, съхраняван единствено на сървъра и непознат дори на базата данни. Трите стойности се обединяват преди хеширане.',
      detail:
        'Salt пример: a3f8c2d1e9b4... — различен за всяко проучване. Това гарантира, че хешът ви е уникален за всяко отделно гласуване.',
      icon: '⚙',
    },
    {
      number: '03',
      title: 'Генериране на хеш',
      technical: 'SHA-256 — еднопосочна функция',
      description:
        'От комбинацията Google ID + salt + pepper се изчислява SHA-256 хеш. Това е стандартна криптографска операция с математически доказана необратимост — от получения хеш е невъзможно да се възстанови оригиналният Google ID.',
      detail:
        'SHA-256("108234...AB" + salt + pepper) → "e3b0c44298fc1c149afb..." — единствено това постъпва в базата данни.',
      icon: '#',
    },
    {
      number: '04',
      title: 'Анонимно записване на гласа',
      technical: 'Физически разделени таблици',
      description:
        'Гласът ви се записва в таблица votes. Хешът се записва в таблица used_hashes. Двете таблици не споделят обща колона и не могат да бъдат свързани по никакъв начин. Дори при пълен достъп до базата данни е невъзможно да се установи кой потребител е подал кой глас.',
      detail:
        'Таблица votes: { choice: "ДА" } — без хеш, без Google ID, без каквато и да е лична информация.',
      icon: '✓',
    },
    {
      number: '05',
      title: 'Предотвратяване на двойно гласуване',
      technical: 'used_hashes таблица',
      description:
        'Преди записване на глас системата проверява дали генерираният хеш вече съществува в used_hashes. При намиране — гласуването е отхвърлено. При липса — хешът се записва и гласът се приема. Системата не установява самоличност, а единствено уникалност.',
      detail:
        'Системата не знае "този потребител е гласувал" — знае само "хеш e3b0c4... е регистриран за това проучване".',
      icon: '🛡',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-block border border-gray-600 px-3 py-1 mb-4">
              <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">
                Прозрачност & Техническа документация
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 tracking-tight">
              КАК<br />РАБОТИ
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Техническо описание на механизмите, които гарантират пълна анонимност
              на всеки глас — независимо от намеренията на администраторите.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* Стъпки */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-gray-900">
            <h2 className="text-xs font-black text-gray-900 tracking-widest uppercase">
              Процесът стъпка по стъпка
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`border-2 border-gray-900 cursor-pointer transition-all duration-200 ${
                  activeStep === i ? 'bg-slate-900' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
              >
                <div className="p-6 flex items-start gap-6">
                  <div className={`text-4xl font-black leading-none flex-shrink-0 w-12 ${
                    activeStep === i ? 'text-gray-600' : 'text-gray-200'
                  }`}>
                    {step.number}
                  </div>

                  <div className="text-2xl flex-shrink-0 w-8 text-center mt-1">
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className={`font-black text-lg tracking-tight ${
                        activeStep === i ? 'text-white' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <span className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 ${
                        activeStep === i
                          ? 'bg-white text-gray-900'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {step.technical}
                      </span>
                    </div>
                    <p className={`text-sm font-bold leading-relaxed ${
                      activeStep === i ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>

                    {activeStep === i && (
                      <div className="mt-4 border-l-4 border-gray-500 pl-4">
                        <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">
                          Технически детайл
                        </p>
                        <p className="text-gray-400 text-sm font-bold font-mono leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={`flex-shrink-0 text-lg font-black transition-transform duration-200 ${
                    activeStep === i ? 'rotate-180 text-gray-400' : 'text-gray-300'
                  }`}>
                    ↓
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Схема на данните — светла */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-gray-900">
            <h2 className="text-xs font-black text-gray-900 tracking-widest uppercase">
              Схема на данните
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="border-2 border-gray-900 p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

              {/* Вход */}
              <div className="border-2 border-gray-900 p-5">
                <p className="text-gray-900 text-xs font-black tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
                  ВХОД — временно в паметта
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Google ID', value: '10823456...' },
                    { label: 'Salt на анкетата', value: 'a3f8c2d1...' },
                    { label: 'Pepper (таен ключ)', value: '••••••••' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-bold">{item.label}</span>
                      <span className="text-gray-900 text-xs font-mono font-black">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t-2 border-gray-100">
                  <p className="text-red-600 text-xs font-black">✕ Никога не се записва</p>
                </div>
              </div>

              {/* SHA-256 */}
              <div className="border-2 border-gray-900 border-l-0 p-5 flex flex-col items-center justify-center bg-gray-50">
                <p className="text-gray-900 text-xs font-black tracking-widest uppercase mb-3">
                  SHA-256
                </p>
                <div className="text-3xl font-black text-gray-400 mb-3">⟶</div>
                <p className="text-gray-500 text-xs font-bold text-center leading-relaxed">
                  Еднопосочна<br />криптографска функция
                </p>
                <div className="mt-3 border-2 border-gray-300 px-3 py-1">
                  <p className="text-gray-500 text-xs font-mono font-black">необратима</p>
                </div>
              </div>

              {/* Изход */}
              <div className="border-2 border-gray-900 border-l-0 p-5">
                <p className="text-gray-900 text-xs font-black tracking-widest uppercase mb-4 border-b-2 border-gray-900 pb-2">
                  БАЗА ДАННИ — записано
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">used_hashes</p>
                    <p className="text-gray-900 text-xs font-mono font-black">e3b0c44298fc1c14...</p>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-3">
                    <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">votes</p>
                    <p className="text-gray-900 text-xs font-mono">choice: "ДА"</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-gray-100">
                  <p className="text-green-600 text-xs font-black">✓ Без лични данни</p>
                </div>
              </div>

            </div>

            <div className="mt-6 border-t-2 border-gray-100 pt-4">
              <p className="text-gray-500 text-xs font-bold text-center">
                Таблиците <span className="text-gray-900 font-black">used_hashes</span> и <span className="text-gray-900 font-black">votes</span> не споделят обща колона — физически не могат да бъдат свързани.
              </p>
            </div>
          </div>
        </div>

        {/* Въпроси и отговори */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-gray-900">
            <h2 className="text-xs font-black text-gray-900 tracking-widest uppercase">
              Често задавани въпроси
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Може ли Социолог.bg да установи как съм гласувал?',
                a: 'Не. Гласът и хешът се съхраняват в отделни таблици без каквато и да е обща колона. Дори администраторите с пълен достъп до базата данни не могат технически да свържат конкретен глас с конкретен потребител.',
              },
              {
                q: 'Какво се случва с Google ID-то ми след гласуване?',
                a: 'Google ID-то се зарежда временно в паметта на сървъра единствено за генериране на хеша. Веднага след изчислението то се освобождава от паметта. В базата данни постъпва само хешът — криптографски отпечатък без обратна връзка към оригинала.',
              },
              {
                q: 'Ако базата данни бъде компрометирана, застрашена ли е анонимността ми?',
                a: 'Не. При пълен достъп до базата данни нападателят ще открие само хешове и анонимни гласове. SHA-256 е математически необратим — от стойността "e3b0c44..." е невъзможно да се възстанови оригиналният Google ID.',
              },
              {
                q: 'Защо е необходим Google ID, ако не го съхранявате?',
                a: 'Google ID служи като уникален входен параметър за генериране на хеша, който предотвратява двойното гласуване. Необходим е за еднократно изчисление — след приключването му не се съхранява никъде.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-2 border-gray-900 p-6">
                <div className="flex gap-4">
                  <span className="text-gray-300 font-black text-2xl flex-shrink-0 leading-none">?</span>
                  <div>
                    <h3 className="font-black text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 font-bold text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub + Заключение */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          {/* GitHub */}
          <div className="border-2 border-gray-900 p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-3">
                Отворен код
              </p>
              <h3 className="font-black text-gray-900 text-lg mb-2">Прегледайте сорс кода</h3>
              <p className="text-gray-500 text-sm font-bold leading-relaxed">
                Цялата логика за анонимизация е публично достъпна. Можете да проверите сами как работи системата.
              </p>
            </div>
            <a
              href="https://github.com/YOUR_REPO"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-2 border-gray-900 px-4 py-3 text-xs font-black tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub Repository
            </a>
          </div>

          {/* Заключение */}
          <div className="md:col-span-2 border-2 border-gray-900 p-8 bg-slate-900">
            <p className="text-gray-500 text-xs font-black tracking-widest uppercase mb-4">
              Архитектурен принцип
            </p>
            <h2 className="text-white font-black text-3xl md:text-4xl leading-tight mb-6 tracking-tight">
              Анонимността не е<br />политика — тя е<br />математика.
            </h2>
            <p className="text-gray-400 font-bold leading-relaxed text-sm">
              Системата е проектирана така, че установяването на самоличността на гласуващ
              е математически невъзможно — независимо от намеренията или правомощията
              на когото и да е с достъп до инфраструктурата.
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}