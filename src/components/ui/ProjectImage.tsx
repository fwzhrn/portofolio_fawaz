"use client";

import { useState } from "react";
import Image from "next/image";

type ProjectImageProps = {
  src: string;
  alt: string;
  sizes: string;
};

export function ProjectImage({ src, alt, sizes }: ProjectImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-secondary p-4 text-center font-mono text-label uppercase leading-relaxed text-muted-foreground">
        Letakkan screenshot di
        <br />
        public{src}
      </div>
    );
  }

  return (
    <Image
      ref={(img) => {
        // Jika gambar gagal dimuat sebelum React hydrate, onError terlewat.
        if (img && img.complete && img.naturalWidth === 0) setFailed(true);
      }}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}