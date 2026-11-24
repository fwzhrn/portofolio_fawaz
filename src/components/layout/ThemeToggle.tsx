"use client";

import { useRef, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { playThemeShutter, prefersReducedMotion } from "@/lib/theme-transition";
import type { Theme } from "@/lib/theme-transition";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage tidak tersedia, tema tetap berganti untuk sesi ini */
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const busy = useRef(false);

  function toggle(e: MouseEvent<HTMLButtonElement>) {
    if (busy.current) return;

    const next: Theme = theme === "dark" ? "light" : "dark";

    // Reduced motion: ganti langsung tanpa efek.
    if (prefersReducedMotion()) {
      console.info(
        "[tema] 'Kurangi gerakan' aktif di sistem, jadi tema diganti langsung tanpa animasi.",
      );
      applyTheme(next);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    busy.current = true;
    try {
      playThemeShutter({
        x: rect.left + rect.width / 2,
        to: next,
        swap: () => applyTheme(next),
        done: () => {
          busy.current = false;
        },
      });
    } catch (error) {
      console.error("[tema] Transisi gagal, tema diganti langsung.", error);
      applyTheme(next);
      busy.current = false;
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"
      }
      className="relative grid size-11 place-items-center text-foreground transition-colors hover:text-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
