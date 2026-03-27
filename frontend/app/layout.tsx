import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from 'next/script'
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Социолог.bg',
    default: 'Начало | Социолог.bg',
  },
  description: 'Анонимни и достоверни социологически проучвания.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔍</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      <Script 
    src="https://accounts.google.com/gsi/client" 
    strategy="beforeInteractive"
  />
      </body>
      
    </html>
    
  );
}
