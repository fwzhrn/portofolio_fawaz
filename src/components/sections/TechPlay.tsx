import { TechWord } from "@/components/ui/TechWord";

export function TechPlay() {
  return (
    <div className="mt-24 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-label uppercase text-muted-foreground">
        <span>Eksperimen 02</span>
        <span>Seret huruf, klik untuk menendang</span>
      </div>
      <div className="mt-6 h-[clamp(12rem,22vw,20rem)]">
        <TechWord text="Seret aku." fontSize={200} intro="type" reveal="area" />
      </div>
    </div>
  );
}
