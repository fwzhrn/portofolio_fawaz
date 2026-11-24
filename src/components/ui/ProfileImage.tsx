"use client";

import { useState } from "react";
import Image from "next/image";

type ProfileImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function ProfileImage({ src, alt, priority }: ProfileImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-secondary p-6 text-center font-mono text-label uppercase leading-relaxed text-muted-foreground">
        Taruh fotomu di
        <br />
        public{src}
      </div>
    );
  }

  return (
    <Image
      ref={(img) => {
        // Jika file gagal dimuat sebelum React hydrate, onError terlewat.
        if (img && img.complete && img.naturalWidth === 0) setFailed(true);
      }}
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 30vw, 70vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}