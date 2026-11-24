"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// Kode Three.js baru diunduh jika perangkat memenuhi syarat.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const QUERY =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

// Perkiraan kasar, bukan ukuran pasti. Browser yang tidak melaporkan
// nilai tertentu dianggap mampu.
function isCapable() {
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  return true;
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function HeroScene() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches && isCapable(),
    () => false,
  );

  return enabled ? <HeroCanvas /> : null;
}
