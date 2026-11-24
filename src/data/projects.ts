export type Project = {
  title: string;
  year: string;
  role: string;
  tags: string[];
  description: string;
  // Taruh screenshot di public/images/projects/ lalu sesuaikan path-nya.
  image: string;
  // Link proyek (live / repo). Kosong = baris tidak bisa diklik.
  href?: string;
  // Hapus baris ini saat sudah diganti proyek aslimu.
  placeholder?: boolean;
};

// TODO: SEMUA isi di bawah adalah contoh. Ganti dengan proyek aslimu.
export const projects: Project[] = [
  {
    title: "Nama Proyek Satu",
    year: "2026",
    role: "Frontend",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    description:
      "Tulis satu atau dua kalimat: proyek ini tentang apa, dan bagian mana yang kamu kerjakan.",
    image: "/images/projects/project-1.jpg",
    placeholder: true,
  },
  {
    title: "Nama Proyek Dua",
    year: "2026",
    role: "Full Stack",
    tags: ["React", "Node.js"],
    description:
      "Tulis satu atau dua kalimat: proyek ini tentang apa, dan bagian mana yang kamu kerjakan.",
    image: "/images/projects/project-2.jpg",
    placeholder: true,
  },
  {
    title: "Nama Proyek Tiga",
    year: "2025",
    role: "Creative Developer",
    tags: ["GSAP", "Three.js"],
    description:
      "Tulis satu atau dua kalimat: proyek ini tentang apa, dan bagian mana yang kamu kerjakan.",
    image: "/images/projects/project-3.jpg",
    placeholder: true,
  },
];