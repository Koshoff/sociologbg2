import type { Metadata } from 'next';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import ResetCookiesButton from './ResetCookiesButton';

export const metadata: Metadata = {
  title: 'Поверителност',
  description: 'Политика за поверителност и защита на личните данни на Социолог.bg.',
};

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-14">
    <div className="flex items-center gap-4 mb-6 pb-3 border-b border-gray-200">
      <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block border border-gray-600 px-3 py-1 mb-4">
            <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">
              GDPR · Защита на данните
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-none mb-6 tracking-tight">
            ПОВЕРИТЕЛНОСТ
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Как събираме, използваме и защитаваме информацията на нашите потребители.
          </p>
          <p className="text-gray-500 text-xs mt-4 uppercase tracking-wider">
            Последна актуализация: Април 2026
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-12 gap-8">

          {/* Main content */}
          <div className="col-span-12 lg:col-span-8">

            <Section id="intro" title="1. Въведение">
              <p>
                Социолог.bg е независима платформа за анонимни граждански социологически проучвания.
                Настоящата политика описва какви данни събираме, защо и как ги защитаваме, в
                съответствие с Регламент (ЕС) 2016/679 (GDPR).
              </p>
              <p>
                Администратор на лични данни е <strong>Социолог.bg</strong>. За контакт по въпроси
                свързани с поверителността използвайте{' '}
                <Link href="/#footer" className="text-blue-600 underline hover:text-blue-800">
                  формата за контакт
                </Link>{' '}
                в края на страницата.
              </p>
            </Section>

            <Section id="data" title="2. Какви данни събираме">
              <p>Събираме минимален обем данни, необходим за работата на платформата:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>При гласуване:</strong> записваме само избора (отговора) и региона (получен
                  от IP адреса, но самият IP не се съхранява). Вашата самоличност никога не се записва.
                  Гласовете се свързват с еднопосочен криптографски хеш — технически невъзможно е да
                  се установи кой е гласувал.
                </li>
                <li>
                  <strong>При коментиране:</strong> верифицираме самоличността ви чрез Google OAuth,
                  но не съхраняваме Google ID, имейл или снимка в базата данни. Записваме само текста
                  на коментара и публичното ви отображавано име (display name).
                </li>
                <li>
                  <strong>Аналитики (при съгласие):</strong> записваме пътя на посетената страница и
                  колко секунди сте прекарали на нея. Няма IP адрес, потребителски ID или лични данни.
                </li>
                <li>
                  <strong>Технически данни:</strong> стандартни сървърни логове (IP, браузър, час) за
                  сигурност и борба с ботове. Логовете се изтриват автоматично след 30 дни.
                </li>
              </ul>
            </Section>

            <Section id="cookies" title="3. Бисквитки (Cookies)">
              <p>Използваме следните категории бисквитки:</p>

              <div className="space-y-4 mt-2">
                {[
                  {
                    name: 'Задължителни (функционални)',
                    basis: 'Легитимен интерес / техническа необходимост',
                    examples: 'adminToken, cookieConsent',
                    duration: 'adminToken: 24 ч. · cookieConsent: 1 година',
                    desc: 'Осигуряват правилното функциониране на сайта — сесия за администратори и запаметяване на вашия избор за бисквитки.',
                    required: true,
                  },
                  {
                    name: 'Аналитични (статистически)',
                    basis: 'Съгласие',
                    examples: 'Анонимни page-view записи в базата',
                    duration: 'Без изтичане (агрегирани данни)',
                    desc: 'Записват пътя на страницата и продължителността на посещението. Нулева лична информация.',
                    required: false,
                  },
                  {
                    name: 'Рекламни (таргетиращи)',
                    basis: 'Съгласие',
                    examples: '— (не се използват в момента)',
                    duration: '—',
                    desc: 'Към момента не поставяме рекламни бисквитки. Категорията е посочена за прозрачност.',
                    required: false,
                  },
                  {
                    name: 'Собствени бисквитки',
                    basis: 'Съгласие / легитимен интерес',
                    examples: 'google_token, voted_<survey_id>',
                    duration: 'google_token: сесия · voted_*: 1 година',
                    desc: 'Поставят се от Социолог.bg. Съхраняват Google OAuth токен за гласуване/коментиране и флаг за предотвратяване на двойно гласуване.',
                    required: false,
                  },
                  {
                    name: 'Бисквитки от трети страни',
                    basis: 'Съгласие',
                    examples: 'Google Sign-In (accounts.google.com)',
                    duration: 'Определя се от Google',
                    desc: 'Google Sign-In скриптът може да постави собствени бисквитки за автентикация. Вижте политиката на Google за повече информация.',
                    required: false,
                  },
                ].map((cat) => (
                  <div key={cat.name} className="border border-gray-200 p-5 rounded-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                      {cat.required && (
                        <span className="text-xs bg-slate-900 text-white px-2 py-0.5 font-bold uppercase tracking-wide">
                          Задължителни
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{cat.desc}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-bold text-gray-700 uppercase tracking-wide">Примери: </span>
                        <span className="text-gray-500">{cat.examples}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 uppercase tracking-wide">Срок: </span>
                        <span className="text-gray-500">{cat.duration}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold text-gray-700 uppercase tracking-wide">Правно основание: </span>
                        <span className="text-gray-500">{cat.basis}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4">
                Можете да управлявате предпочитанията си за бисквитки по всяко време чрез банера в
                долния ъгъл на сайта.
              </p>
            </Section>

            <Section id="legal-basis" title="4. Правно основание за обработка">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Съгласие (чл. 6, ал. 1, б. „а"):</strong> за аналитични и бисквитки от трети страни — можете да оттеглите съгласието си по всяко време.</li>
                <li><strong>Легитимен интерес (чл. 6, ал. 1, б. „е"):</strong> за сигурност на сайта, борба с бот-трафик и предотвратяване на злоупотреби.</li>
                <li><strong>Изпълнение на договор (чл. 6, ал. 1, б. „б"):</strong> за осигуряване на функционалността на услугата (гласуване, коментиране).</li>
              </ul>
            </Section>

            <Section id="rights" title="5. Вашите права по GDPR">
              <p>Имате следните права по отношение на личните ви данни:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  { right: 'Право на достъп', desc: 'Можете да поискате копие от данните, които съхраняваме за вас.' },
                  { right: 'Право на коригиране', desc: 'Можете да поискате корекция на неточни данни.' },
                  { right: 'Право на изтриване', desc: '"Правото да бъдеш забравен" — поискайте изтриване на данните ви.' },
                  { right: 'Право на ограничаване', desc: 'Можете да ограничите обработката на вашите данни.' },
                  { right: 'Право на преносимост', desc: 'Получете данните си в машинночитаем формат.' },
                  { right: 'Право на възражение', desc: 'Възразете срещу обработка, основана на легитимен интерес.' },
                  { right: 'Оттегляне на съгласие', desc: 'Оттеглете съгласието за незадължителни бисквитки по всяко време.' },
                  { right: 'Жалба до КЗЛД', desc: 'Имате право да подадете жалба до Комисията за защита на личните данни (cpdp.bg).' },
                ].map((item) => (
                  <div key={item.right} className="border border-gray-200 p-4 rounded-sm">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.right}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="third-parties" title="6. Трети страни и партньори">
              <div className="space-y-3">
                <div className="border border-gray-200 p-4 rounded-sm">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Google Sign-In</h3>
                  <p>
                    Използваме Google OAuth само за верификация при гласуване и коментиране.
                    Google може да обработва данни според собствената си{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      политика за поверителност
                    </a>.
                    Ние не предаваме лични данни на Google — процесът е еднопосочен (верификация).
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-sm">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Хостинг и инфраструктура</h3>
                  <p>
                    Сайтът е хостван на сървъри в ЕС. Данните не се прехвърлят извън Европейското
                    икономическо пространство.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="retention" title="7. Съхранение на данни">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-2 pr-4 text-xs font-black tracking-widest uppercase text-gray-900">Тип данни</th>
                      <th className="text-left py-2 pr-4 text-xs font-black tracking-widest uppercase text-gray-900">Срок</th>
                      <th className="text-left py-2 text-xs font-black tracking-widest uppercase text-gray-900">Причина</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['Гласове (анонимни)', 'Неограничен', 'Исторически архив на резултатите'],
                      ['Хешове за защита от двойно гласуване', 'До края на анкетата + 30 дни', 'Предотвратяване на злоупотреби'],
                      ['Коментари', 'До поискано изтриване', 'Публично видимо съдържание'],
                      ['Аналитики (page views)', 'Неограничен (агрегирани)', 'Подобряване на UX'],
                      ['Сървърни логове', '30 дни', 'Сигурност и дебъгване'],
                      ['adminToken (cookie)', '24 часа', 'Сесия на администратор'],
                    ].map(([type, period, reason]) => (
                      <tr key={type}>
                        <td className="py-2 pr-4 font-medium text-gray-900">{type}</td>
                        <td className="py-2 pr-4 text-gray-500">{period}</td>
                        <td className="py-2 text-gray-500">{reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="contact" title="8. Контакт и упражняване на права">
              <p>
                За упражняване на правата ви или въпроси относно обработката на лични данни,
                моля свържете се с нас чрез{' '}
                <Link href="/#footer" className="text-blue-600 underline hover:text-blue-800">
                  формата за контакт
                </Link>{' '}
                на сайта. Ще отговорим в рамките на 30 дни, съгласно изискванията на GDPR.
              </p>
              <p>
                Ако не сте удовлетворени от отговора ни, имате право да подадете жалба до
                Комисията за защита на личните данни на България:{' '}
                <a
                  href="https://www.cpdp.bg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  www.cpdp.bg
                </a>
              </p>
            </Section>

          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">

            <div className="border border-gray-200 p-5 rounded-sm sticky top-28">
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase border-b border-gray-100 pb-2 mb-4">
                Съдържание
              </p>
              <div className="space-y-1">
                {[
                  ['#intro', '1. Въведение'],
                  ['#data', '2. Какви данни събираме'],
                  ['#cookies', '3. Бисквитки'],
                  ['#legal-basis', '4. Правно основание'],
                  ['#rights', '5. Вашите права'],
                  ['#third-parties', '6. Трети страни'],
                  ['#retention', '7. Съхранение'],
                  ['#contact', '8. Контакт'],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-blue-600 transition-colors group"
                  >
                    <span className="text-sm text-gray-600 group-hover:text-blue-600">{label}</span>
                    <span className="text-gray-300 group-hover:text-blue-400">→</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 p-5 rounded-sm bg-slate-900">
              <p className="text-gray-500 text-xs font-medium tracking-widest uppercase mb-3">
                Бисквитки
              </p>
              <p className="text-white text-sm font-medium leading-relaxed mb-4">
                Управлявайте предпочитанията си за бисквитки по всяко време.
              </p>
              <ResetCookiesButton />
            </div>

          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
