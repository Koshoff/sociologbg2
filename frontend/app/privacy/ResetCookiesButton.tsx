'use client';

export default function ResetCookiesButton() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('cookieConsent');
        window.location.reload();
      }}
      className="w-full border border-gray-600 text-gray-300 py-2 text-xs font-black tracking-widest uppercase hover:bg-slate-800 transition-colors"
    >
      Промени настройките
    </button>
  );
}
