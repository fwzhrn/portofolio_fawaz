"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onDocumentClick, setLenis } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    // Klik link anchor (#about, /#contact, dll.) ditangani di sini,
    // supaya posisi mendarat konsisten dengan atau tanpa Lenis.
    document.addEventListener("click", onDocumentClick, true);

    let teardown: (() => void) | undefined;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const lenis = new Lenis({ lerp: 0.1 });
      setLenis(lenis);

      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Intro Hero dan menu mobile mengunci scroll lewat body overflow.
      // Lenis ikut berhenti saat itu, dan jalan lagi saat kunci dilepas.
      const syncLock = () => {
        if (document.body.style.overflow === "hidden") lenis.stop();
        else lenis.start();
      };
      const observer = new MutationObserver(syncLock);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style"],
      });
      syncLock();

      // Posisi trigger dihitung ulang setelah font dan gambar selesai dimuat.
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      teardown = () => {
        window.removeEventListener("load", onLoad);
        observer.disconnect();
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        setLenis(null);
        lenis.destroy();
      };
    }

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      teardown?.();
    };
  }, []);

  return null;
}
