import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonStyles } from "@/components/ui/Button";
import { TechWord } from "@/components/ui/TechWord";
import { nav, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="pb-8 pt-20 md:pt-28">
        <div className="h-[clamp(8rem,24vw,22rem)]">
          <TechWord
            text={`${site.name}.`}
            fontSize={260}
            intro="assemble"
            reveal="letter"
          />
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          <p className="max-w-xs text-muted-foreground">
            Terima kasih sudah scroll sampai sini.
          </p>

          <div className="space-y-4">
            <h2 className="font-mono text-label uppercase text-muted-foreground">
              Navigasi
            </h2>
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center py-1 pointer-coarse:min-h-11 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-mono text-label uppercase text-muted-foreground">
              Kontak
            </h2>
            {site.email || site.socials.length > 0 ? (
              <ul className="space-y-1">
                {site.email && (
                  <li>
                    <a
                      href={`mailto:${site.email}`}
                      className="inline-flex items-center py-1 pointer-coarse:min-h-11 transition-colors hover:text-accent"
                    >
                      {site.email}
                    </a>
                  </li>
                )}
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center py-1 pointer-coarse:min-h-11 transition-colors hover:text-accent"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Info kontak akan ditambahkan.
              </p>
            )}
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="font-mono text-label uppercase text-muted-foreground">
            &copy; {site.since} {site.name}
          </p>
          <a href="#top" className={buttonStyles("outline")}>
            Kembali ke atas &uarr;
          </a>
        </div>
      </Container>
    </footer>
  );
}
