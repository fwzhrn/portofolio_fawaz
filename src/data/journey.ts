export type JourneyItem = {
  period: string;
  title: string;
  place?: string;
  description: string;
  // Hapus baris ini saat sudah diganti dengan perjalananmu sendiri.
  placeholder?: boolean;
};

// TODO: SEMUA isi di bawah adalah contoh. Ganti dengan perjalananmu.
// Urutan: dari yang paling awal ke yang terbaru, atau sebaliknya, terserah kamu.
export const journey: JourneyItem[] = [
  {
    period: "20XX",
    title: "Awal mulai belajar",
    place: "Tulis di mana / bagaimana",
    description:
      "Ceritakan singkat: apa yang pertama kali kamu pelajari dan apa yang membuatmu tertarik.",
    placeholder: true,
  },
  {
    period: "20XX — 20XX",
    title: "Tahap berikutnya",
    place: "Kampus / kursus / komunitas",
    description:
      "Ceritakan apa yang kamu bangun atau pelajari di tahap ini, dan apa yang berubah.",
    placeholder: true,
  },
  {
    period: "20XX — Sekarang",
    title: "Yang sedang dikerjakan",
    place: "Tulis fokusmu saat ini",
    description:
      "Ceritakan apa yang sedang kamu eksplorasi sekarang dan ke mana arahnya.",
    placeholder: true,
  },
];