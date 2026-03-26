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
      title: 'Влизате с Google',
      technical: 'OAuth 2.0 токен верификация',
      description:
        'Когато гласувате като верифициран потребител, използваме Google Login. Получаваме само вашия уникален Google ID — дълга поредица от цифри. Никога не виждаме паролата ви, имейла ви или каквато и да е друга лична информация.',
      detail:
        'Примерен Google ID: 108234567890123456789 — само това число постъпва в системата ни.',
      icon: '🔑',
    },
    {
      number: '02',
      title: 'Добавяме уникален Salt',
      technical: 'SHA-256 криптографски хеш',
      description:
        'Всяко проучване има свой уникален "salt" — произволна поредица от символи, генерирана при създаването му. Комбинираме вашия Google ID + salt на проучването + таен "pepper" (известен само на сървъра).',
      detail:
        'Salt пример: a3f8c2d1e9b4... — уникален за всяко проучване, така хешът ви е различен за всяко гласуване.',
      icon: '🧂',
    },
    {
      number: '03',
      title: 'Генерираме хеш',
      technical: 'Еднопосочна функция — необратима',
      description:
        'От комбинацията Google ID + salt + pepper изчисляваме SHA-256 хеш. Това е математическа операция с една посока — от хеша е невъзможно да се върне оригиналният ви Google ID. Записваме само хеша.',
      detail:
        'SHA-256("108234...AB" + salt + pepper) → "e3b0c44298fc1c149afb..." — само това влиза в базата данни.',
      icon: '#',
    },
    {
      number: '04',
      title: 'Гласът е анонимен',
      technical: 'Vote и Hash са в отделни таблици',
      description:
        'Гласът ви ("ДА", "НЕ" и т.н.) се записва в отделна таблица от хеша. Двете записи нямат никаква обща колона — не може да се свържат. Хешът служи единствено за проверка дали вече сте гласували.',
      detail:
        'Таблица votes: { choice: "ДА", region: "София", trustLevel: 3 } — нито хеш, нито Google ID.',
      icon: '✓',
    },
    {
      number: '05',
      title: 'Защита от двойно гласуване',
      technical: 'usedHashes таблица',
      description:
        'Преди да запишем гласа, проверяваме дали хешът вече съществува в таблицата used_hashes. Ако съществува — гласуването е блокирано. Ако не — хешът се записва и гласът минава. Никога не проверяваме кой сте.',
      detail:
        'Системата не знае "Иван Иванов е гласувал" — знае само "хеш e3b0c4... е използван".',
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
            <div className="inline-block border border-blue-500 px-3 py-1 mb-4">
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
                ● Прозрачност & Защита
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 tracking-tight">
              КАК<br />РАБОТИ
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Обясняваме технически и на разбираем език защо вашият глас е напълно анонимен —
              дори ние не можем да разберем кой как е гласувал.
            </p>
          </div>
        </div>
      </section>

      {/* Ключово твърдение */}
      <section className="border-b-4 border-gray-900 bg-blue-600 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white font-black text-xl md:text-2xl tracking-tight">
            Вашият Google акаунт никога не се записва в базата данни.
          </p>
          <p className="text-blue-200 font-bold text-sm tracking-wider uppercase text-right">
            Математически гарантирано
          </p>
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
                  {/* Номер */}
                  <div className={`text-4xl font-black leading-none flex-shrink-0 w-12 ${
                    activeStep === i ? 'text-blue-400' : 'text-gray-200'
                  }`}>
                    {step.number}
                  </div>

                  {/* Икона */}
                  <div className={`text-2xl flex-shrink-0 w-8 text-center mt-1`}>
                    {step.icon}
                  </div>

                  {/* Съдържание */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-black text-lg tracking-tight ${
                        activeStep === i ? 'text-white' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <span className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 ${
                        activeStep === i
                          ? 'bg-blue-600 text-white'
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

                    {/* Разгънато детайлно обяснение */}
                    {activeStep === i && (
                      <div className="mt-4 border-l-4 border-blue-500 pl-4">
                        <p className="text-blue-300 text-xs font-black tracking-widest uppercase mb-1">
                          Технически детайл
                        </p>
                        <p className="text-gray-400 text-sm font-bold font-mono leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Стрелка */}
                  <div className={`flex-shrink-0 text-lg font-black transition-transform ${
                    activeStep === i ? 'rotate-180 text-blue-400' : 'text-gray-300'
                  }`}>
                    ↓
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Визуална схема */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-gray-900">
            <h2 className="text-xs font-black text-gray-900 tracking-widest uppercase">
              Схема на данните
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="border-2 border-gray-900 p-8 bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

              {/* Вход */}
              <div className="border-2 border-blue-500 p-5">
                <p className="text-blue-400 text-xs font-black tracking-widest uppercase mb-4 border-b border-blue-800 pb-2">
                  ВХОД (временно в паметта)
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Google ID', value: '10823456...', keep: false },
                    { label: 'Salt на анкетата', value: 'a3f8c2d1...', keep: false },
                    { label: 'Pepper (таен)', value: '••••••••', keep: false },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs font-bold">{item.label}</span>
                      <span className="text-white text-xs font-mono font-black">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-red-400 text-xs font-bold">✕ Никога не се записва</p>
                </div>
              </div>

              {/* Хеш функция */}
              <div className="border-2 border-yellow-500 p-5 flex flex-col items-center justify-center">
                <p className="text-yellow-400 text-xs font-black tracking-widest uppercase mb-3">
                  SHA-256
                </p>
                <div className="text-4xl mb-3">⟶</div>
                <p className="text-gray-400 text-xs font-bold text-center">
                  Еднопосочна<br />математическа функция
                </p>
                <div className="mt-3 border border-yellow-700 px-3 py-1">
                  <p className="text-yellow-400 text-xs font-mono">необратима</p>
                </div>
              </div>

              {/* Изход */}
              <div className="border-2 border-gray-600 p-5">
                <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-4 border-b border-gray-700 pb-2">
                  БАЗА ДАННИ (записано)
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs font-bold mb-1">used_hashes таблица:</p>
                    <p className="text-green-400 text-xs font-mono font-black">e3b0c44298fc1c14...</p>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-gray-500 text-xs font-bold mb-1">votes таблица:</p>
                    <p className="text-white text-xs font-mono">choice: "ДА"</p>
                    <p className="text-white text-xs font-mono">region: "София"</p>
                    <p className="text-white text-xs font-mono">trustLevel: 3</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-green-400 text-xs font-bold">✓ Без лични данни</p>
                </div>
              </div>

            </div>

            <div className="mt-6 border-t border-gray-700 pt-4">
              <p className="text-gray-500 text-xs font-bold text-center">
                Таблиците <span className="text-white">used_hashes</span> и <span className="text-white">votes</span> нямат обща колона — не могат да се свържат по никакъв начин.
              </p>
            </div>
          </div>
        </div>

        {/* Нива на доверие */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-gray-900">
            <h2 className="text-xs font-black text-gray-900 tracking-widest uppercase">
              Нива на верификация
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
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
                q: 'Може ли Социолог.bg да разбере как съм гласувал?',
                a: 'Не. Гласът ви и хешът ви са в отделни таблици без никаква връзка. Дори ние — администраторите — не можем технически да свържем конкретен глас с конкретен потребител.',
              },
              {
                q: 'Какво се случва с Google ID-то ми?',
                a: 'Google ID-то ви се използва само в паметта на сървъра, за да генерира хеша. Веднага след това се изтрива от паметта. В базата данни постъпва единствено хешът — необратим криптографски отпечатък.',
              },
              {
                q: 'Ако някой хакне базата данни, може ли да разбере гласовете ми?',
                a: 'Не. Дори при пълен достъп до базата данни, нападателят ще вижда само хешове и анонимни гласове. SHA-256 е математически необратим — от "e3b0c44..." не може да се извлече оригиналният Google ID.',
              },
              {
                q: 'Защо изобщо ви трябва Google ID ако не го записвате?',
                a: 'Използваме го само за да генерираме уникален хеш, който предотвратява двойното гласуване. Нужен ни е за еднократно изчисление — след което го забравяме напълно.',
              }
            ].map((faq, i) => (
              <div key={i} className="border-2 border-gray-900 p-6">
                <div className="flex gap-4">
                  <span className="text-blue-600 font-black text-lg flex-shrink-0">?</span>
                  <div>
                    <h3 className="font-black text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 font-bold text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Заключение */}
        <div className="border-4 border-gray-900 p-8 bg-slate-900">
          <div className="max-w-3xl">
            <p className="text-blue-400 text-xs font-black tracking-widest uppercase mb-4">
              Нашето обещание
            </p>
            <h2 className="text-white font-black text-3xl md:text-4xl leading-tight mb-6 tracking-tight">
              Анонимността не е<br />просто обещание —<br />тя е математика.
            </h2>
            <p className="text-gray-400 font-bold leading-relaxed">
              Проектирахме системата така, че дори да искахме да разберем кой как е гласувал —
              технически не можем. Не защото сме добросъвестни, а защото архитектурата на системата
              го прави невъзможно.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}