
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AnimatedWave } from "./animated-wave";
import { AnchorLink } from "./anchor-link";

const footerLinks: Record<string, Array<{ name: string; href: string; to?: string; external?: boolean }>> = {
  Arumanis: [
    { name: "Layanan", href: "#features" },
    { name: "Cara kerja", href: "#how-it-works" },
    { name: "Publikasi", href: "/publikasi", to: "/publikasi" },
    { name: "Capaian SPM", href: "/capaian-spm", to: "/capaian-spm" },
  ],
  Kolaborasi: [
    { name: "Informasi layanan", href: "#developers" },
    { name: "Dokumentasi", href: "https://github.com/ilhamtaufiq/arumanis", external: true },
    { name: "Masuk portal", href: "/sign-in", to: "/sign-in" },
    { name: "Program", href: "#integrations" },
  ],
  "Pemerintah Kabupaten Cianjur": [
    { name: "Portal Cianjur", href: "https://cianjurkab.go.id", external: true },
    { name: "Instagram Bidang AMS", href: "https://www.instagram.com/bidang_ams/", external: true },
    { name: "Instagram Disperkim", href: "https://www.instagram.com/disperkim.cianjur/", external: true },
  ],
  Kebijakan: [
    { name: "Privasi data", href: "/privacy-policy", to: "/privacy-policy" },
    { name: "Ketentuan layanan", href: "/terms", to: "/terms" },
    { name: "Transparansi", href: "#security" },
  ],
};

const socialLinks = [
  { name: "Portal Cianjur", href: "https://cianjurkab.go.id" },
  { name: "GitHub Arumanis", href: "https://github.com/ilhamtaufiq/arumanis" },
  { name: "Instagram", href: "https://www.instagram.com/bidang_ams/" },
];

export function FooterSection() {
  return (
    <footer id="footer" className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 h-64 opacity-80 pointer-events-none overflow-hidden">
        <AnimatedWave />
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <AnchorLink href="#" className="inline-flex items-center gap-2 mb-6">
                <span className="text-2xl font-display">Arumanis</span>
                <img src="/arumanis.svg" alt="Logo Arumanis" className="h-7 w-auto" />
              </AnchorLink>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs">
                Platform kolaborasi untuk layanan air minum dan sanitasi yang layak bagi masyarakat Cianjur.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <AnchorLink
                          href={link.href}
                          {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                        >
                          {link.name}
                        </AnchorLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            2026 Arumanis Cianjur. Hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Portal layanan air minum & sanitasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
