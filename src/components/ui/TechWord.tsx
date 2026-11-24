"use client";

import { useSyncExternalStore } from "react";
import TechText from "@/components/ui/TechText";
import { getCssColor, subscribeTheme } from "@/lib/theme-color";

type TechWordProps = {
  text: string;
  fontSize?: number;
  intro?: "none" | "type" | "assemble" | "metrics";
  reveal?: "area" | "letter" | "off";
  align?: "left" | "center" | "right";
  className?: string;
};

// Pembungkus TechText: warna mengikuti token tema, font mengikuti font display.
export function TechWord({
  text,
  fontSize = 220,
  intro = "assemble",
  reveal = "letter",
  align = "left",
  className = "",
}: TechWordProps) {
  // Kanvas tidak memahami var(--accent), jadi warnanya diterjemahkan ke hex
  // dan diperbarui setiap tema berganti.
  const accent = useSyncExternalStore(
    subscribeTheme,
    () => getCssColor("--accent"),
    () => "#ffffff",
  );

  return (
    <TechText
      text={text}
      className={`font-display ${className}`.trim()}
      fontWeight={600}
      fontSize={fontSize}
      letterSpacing={-0.05}
      align={align}
      accentColor={accent}
      reveal={reveal}
      intro={intro}
      introDuration={2}
      dashLength={4}
      dashGap={2}
      specks={15}
      clickKick
      guides={false}
    />
  );
}
