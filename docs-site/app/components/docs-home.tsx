import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  BookOpen,
  LayoutDashboard,
  Briefcase,
  FileText,
  Ticket,
  Download,
  MessageCircle,
  Shield,
  Map,
  Settings,
  Bot,
  ClipboardCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { brand } from '@/lib/brand';
import { fetchCmsPanduanSummary } from '@/lib/panduan-api';

type CardItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const startCards: CardItem[] = [
  {
    title: 'Mulai di sini',
    description: 'Login, navigasi sidebar, dan cara membuka panduan.',
    href: '/docs/navigasi-global',
    icon: <BookOpen className="size-5" />,
  },
  {
    title: 'Autentikasi',
    description: 'Sign-in, SSO panel pengawas, dan impersonate admin.',
    href: '/docs/auth',
    icon: <Shield className="size-5" />,
  },
  {
    title: 'Skenario per peran',
    description: 'Alur tipikal admin, operator, dan pengawas lapangan.',
    href: '/docs/skenario-penggunaan',
    icon: <Map className="size-5" />,
  },
];

const moduleCards: CardItem[] = [
  {
    title: 'Dashboard',
    description: 'Ringkasan metrik kegiatan, pagu, dan pekerjaan.',
    href: '/docs/dashboard',
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    title: 'Pekerjaan & Output',
    description: 'Paket proyek, tab detail, unduh ZIP berkas.',
    href: '/docs/pekerjaan-output',
    icon: <Briefcase className="size-5" />,
  },
  {
    title: 'OnlyOffice',
    description: 'Preview dan edit dokumen di browser.',
    href: '/docs/dokumen-onlyoffice',
    icon: <FileText className="size-5" />,
  },
  {
    title: 'SIPD Renja',
    description: 'Cache Penganggaran / Renja & rincian belanja SIPD.',
    href: '/docs/sipd-renja',
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    title: 'SPSE Import',
    description: 'Scan dan impor dokumen non-tender ke berkas.',
    href: '/docs/spse-import',
    icon: <Download className="size-5" />,
  },
  {
    title: 'Tiket',
    description: 'Kendala lapangan, komentar, dan penutupan isu.',
    href: '/docs/tiket',
    icon: <Ticket className="size-5" />,
  },
  {
    title: 'Checklist',
    description: 'Item wajib per fase pekerjaan.',
    href: '/docs/checklist',
    icon: <ClipboardCheck className="size-5" />,
  },
];

const collabCards: CardItem[] = [
  {
    title: 'Panel Pengawasan',
    description: 'Aplikasi lapangan via SSO dari Arumanis.',
    href: '/docs/pengawas-panel',
    icon: <Shield className="size-5" />,
  },
  {
    title: 'Puspen',
    description: 'KPI, progress fisik, media sharing, PDF tools.',
    href: '/docs/puspen',
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    title: 'WhatsApp',
    description: 'Inbox chat terhubung bridge APIAMIS.',
    href: '/docs/whatsapp',
    icon: <MessageCircle className="size-5" />,
  },
  {
    title: 'Asisten AI',
    description: 'Tanya jawab dan bantuan penulisan.',
    href: '/docs/asisten-ai',
    icon: <Bot className="size-5" />,
  },
];

const highlights = [
  {
    title: 'Satu akun APIAMIS',
    description: 'Arumanis, Panel Pengawasan, dan Puspen memakai sesi yang sama.',
  },
  {
    title: 'Dokumen di browser',
    description: 'Preview/edit lewat OnlyOffice tanpa unduh manual dulu.',
  },
  {
    title: 'Integrasi SIPD & SPSE',
    description: 'Renja/Penganggaran dari SIPD Lite; dokumen pengadaan dari SPSE.',
  },
  {
    title: 'Lapangan siap pakai',
    description: 'Foto slot, progress, tiket, dan laporan mingguan pengawas.',
  },
];

function SectionCard({ item }: { item: CardItem }) {
  return (
    <Link
      to={item.href}
      className="group flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-lg shadow-black/10 backdrop-blur transition hover:border-[var(--brand-yellow)] hover:shadow-xl dark:bg-fd-card/90 dark:border-fd-border"
    >
      <div
        className="flex size-10 items-center justify-center rounded-xl text-white"
        style={{ background: brand.primary }}
      >
        {item.icon}
      </div>
      <div>
        <h3 className="font-semibold text-fd-foreground group-hover:text-[var(--brand-primary)]">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-fd-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </div>
      <span
        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold"
        style={{ color: brand.primary }}
      >
        Buka
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function DocsHomePage() {
  const [cmsPages, setCmsPages] = useState<
    Array<{ slug: string; title: string; description?: string | null }>
  >([]);

  useEffect(() => {
    void fetchCmsPanduanSummary().then((rows) => {
      setCmsPages(
        rows.map((r) => ({
          slug: r.slug,
          title: r.title,
          description: r.description,
        })),
      );
    });
  }, []);

  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col">
        {/* Hero — landing-style purple gradient + logo */}
        <section className="relative overflow-hidden border-b border-white/10 docs-hero-gradient text-white">
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center md:py-24">
            <img
              src={brand.logoPublicPath}
              alt={brand.appName}
              className="h-20 w-auto drop-shadow-2xl md:h-28"
              width={200}
              height={112}
              fetchPriority="high"
              decoding="async"
            />
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
              <span className="size-1.5 rounded-full bg-[var(--brand-yellow)]" />
              Dokumentasi · Panduan Pengguna
            </div>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                {brand.docsTitle}
              </h1>
              <p className="text-lg text-white/90 md:text-xl leading-relaxed">
                Sistem informasi Air Minum &amp; Sanitasi Kabupaten Cianjur — dari
                perencanaan kegiatan, pekerjaan lapangan, dokumen SPSE, hingga panel
                pengawas.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/docs/navigasi-global"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition hover:brightness-105"
                style={{
                  background: brand.yellow,
                  color: brand.ink,
                }}
              >
                Mulai di sini
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/docs/pengantar"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
              >
                Daftar isi lengkap
              </Link>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white"
              >
                Buka aplikasi
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="border-b border-fd-border bg-[var(--brand-cream)]/40 dark:bg-fd-card/40">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.title} className="space-y-2">
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: brand.primary }}
                >
                  {h.title}
                </h2>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {h.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Get started */}
        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Get Started</h2>
            <p className="mt-1 text-fd-muted-foreground">
              Langkah pertama untuk semua pengguna.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {startCards.map((item) => (
              <SectionCard key={item.href} item={item} />
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="border-t border-fd-border bg-fd-card/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Modul inti</h2>
              <p className="mt-1 text-fd-muted-foreground">
                Operasional harian di Arumanis utama.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moduleCards.map((item) => (
                <SectionCard key={item.href} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* Collaboration */}
        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Kolaborasi &amp; lapangan</h2>
            <p className="mt-1 text-fd-muted-foreground">
              Pengawasan, Puspen, chat, dan AI.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collabCards.map((item) => (
              <SectionCard key={item.href} item={item} />
            ))}
          </div>
        </section>

        {/* CMS pages from dashboard */}
        {cmsPages.length > 0 && (
          <section className="border-t border-fd-border bg-[var(--brand-cream)]/50 dark:bg-fd-card/30">
            <div className="mx-auto w-full max-w-6xl px-6 py-14">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Dari admin (CMS)</h2>
                <p className="mt-1 text-fd-muted-foreground">
                  Halaman yang dikelola lewat dashboard · Manajemen Panduan.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cmsPages.map((p) => (
                  <SectionCard
                    key={p.slug}
                    item={{
                      title: p.title,
                      description: p.description || 'Halaman dinamis dari Manajemen Panduan',
                      href: `/docs/cms/${p.slug}`,
                      icon: <BookOpen className="size-5" />,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Admin strip */}
        <section
          className="border-t border-white/10 text-white"
          style={{
            background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primary} 55%, ${brand.primarySoft} 100%)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: brand.yellow, color: brand.ink }}
              >
                <Settings className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Administrasi &amp; troubleshooting</h2>
                <p className="mt-1 max-w-xl text-sm text-white/85">
                  Users, roles, backup, OnlyOffice, SPSE, unduhan ZIP, dan sesi pengawas.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { to: '/docs/settings', label: 'Settings' },
                { to: '/docs/pemecahan-masalah', label: 'Troubleshooting' },
                { to: '/docs/glosarium', label: 'Glosarium' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-fd-border py-8 text-center text-xs text-fd-muted-foreground">
          <div className="mx-auto flex flex-col items-center gap-3">
            <img
              src={brand.logoPublicPath}
              alt=""
              className="h-8 w-auto opacity-90"
              width={96}
              height={32}
            />
            <p>
              {brand.appName} Docs · Air Minum &amp; Sanitasi Kabupaten Cianjur
            </p>
          </div>
        </footer>
      </main>
    </HomeLayout>
  );
}
