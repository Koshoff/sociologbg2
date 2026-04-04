'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem('cookieConsent');
    if (!raw) return false;
    const prefs = JSON.parse(raw);
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

function send(page: string, startTs: number) {
  if (!hasAnalyticsConsent()) return;
  const durationSeconds = Math.round((Date.now() - startTs) / 1000);
  if (durationSeconds < 1) return;

  // sendBeacon keeps the request alive even after the page closes
  const blob = new Blob(
    [JSON.stringify({ page, durationSeconds })],
    { type: 'application/json' }
  );
  navigator.sendBeacon(`${API_URL}/api/analytics/page-view`, blob);
}

export default function PageTracker() {
  const pathname = usePathname();
  const startTs = useRef(Date.now());
  const currentPage = useRef(pathname);

  // On SPA route change: flush previous page, reset timer
  useEffect(() => {
    if (currentPage.current !== pathname) {
      send(currentPage.current, startTs.current);
      currentPage.current = pathname;
      startTs.current = Date.now();
    }
  }, [pathname]);

  // On tab hide / browser close: flush current page
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        send(currentPage.current, startTs.current);
        // Reset so a returning tab doesn't double-count
        startTs.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        startTs.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return null;
}
