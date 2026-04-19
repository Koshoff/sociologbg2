import { Banner } from '@/app/components/AdBanner';

/**
 * Sidebar ad banners — shown on every page with an ad slot.
 *
 * To add a real banner:
 *   1. Drop the image in /public/ads/  (e.g. banner1.jpg)
 *   2. Set  image: '/ads/banner1.jpg'
 *   3. Set  href to the advertiser's URL
 *   4. Remove the label / bgColor fields (they're only for placeholders)
 */
export const SIDEBAR_ADS: Banner[] = [
  {
    href: 'https://sociolog.bg',
    alt: 'Реклама 1',
    label: 'Вашата реклама тук',
    bgColor: 'bg-blue-50',
  },
  {
    href: 'https://sociolog.bg',
    alt: 'Реклама 2',
    label: 'Вашата реклама тук',
    bgColor: 'bg-slate-50',
  },
];
