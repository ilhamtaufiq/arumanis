import { useLandingCopy } from "../i18n";

import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AnimatedWave } from "./animated-wave";
import { AnchorLink } from "./anchor-link";

type FooterLink = { href: string; to?: string; external?: boolean };

const footerLinks: FooterLink[][] = [
  [
    { href: "#features" },
    { href: "#how-it-works" },
    { href: "/publikasi", to: "/publikasi" },
    { href: "/capaian-spm", to: "/capaian-spm" },
  ],
  [
    { href: "#developers" },
    { href: "/sign-in", to: "/sign-in" },
    { href: "#integrations" },
  ],
  [
    { href: "https://cianjurkab.go.id", external: true },
    { href: "https://www.instagram.com/bidang_ams/", external: true },
    { href: "https://www.instagram.com/disperkim.cianjur/", external: true },
  ],
  [
    { href: "/privacy-policy", to: "/privacy-policy" },
    { href: "/terms", to: "/terms" },
    { href: "#security" },
  ],
];

const socialHrefs = [
  "https://cianjurkab.go.id",
  "https://www.instagram.com/bidang_ams/",
];

export function FooterSection() {
  const { copy } = useLandingCopy();
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
                <img src="/arumanis.svg" alt={copy.footer.logoAlt} className="h-7 w-auto" />
              </AnchorLink>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs">
                {copy.footer.tagline}
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {copy.footer.social.map((name, i) => (
                  <a
                    key={name}
                    href={socialHrefs[i]}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    {name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {copy.footer.columns.map((column, columnIndex) => (
              <div key={columnIndex}>
                <h3 className="text-sm font-medium mb-6">{column.title}</h3>
                <ul className="space-y-4">
                  {footerLinks[columnIndex].map((link, linkIndex) => (
                    <li key={link.href}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                        >
                          {column.links[linkIndex]}
                        </Link>
                      ) : (
                        <AnchorLink
                          href={link.href}
                          {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                        >
                          {column.links[linkIndex]}
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
            {copy.footer.copyright}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {copy.footer.status}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
