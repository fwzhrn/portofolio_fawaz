import "lenis/dist/lenis.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Cursor } from "@/components/animations/Cursor";
import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--f-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--f-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--f-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fawaz Zahran — Portfolio",
  description: "Portfolio personal Fawaz Zahran.",
};

// Jalan sebelum paint: dark default, pakai pilihan tersimpan jika ada.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');d.dataset.theme=(t==='light'||t==='dark')?t:'dark'}catch(e){}var s=false;try{s=sessionStorage.getItem('intro-seen')==='1'}catch(e){}var r=false;try{r=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}d.dataset.intro=(s||r)?'skip':'play'})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top">
        <Providers>
          <SmoothScroll />
            <Cursor />
            <ScrollProgress />
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-3 focus:font-mono focus:text-label focus:uppercase focus:text-accent-foreground"
              >
                Lewati ke konten
              </a>
              <Navbar />
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer />
            </Providers>
          </body>
        </html>
      );
    }