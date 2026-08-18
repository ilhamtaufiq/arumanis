import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { fetchSession } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'
import {
  ArrowRight,
  Instagram,
  Sparkles,
  Star,
} from 'lucide-react'
import SplitText from '@/components/SplitText'

import {
  getAppSettings,
  getSettingValue,
  isCapaianPublikSectionActive,
  isSpmDetailPageActive,
  useAppSettings,
} from '@/features/settings/api'
import { shouldBlockForMaintenance } from '@/lib/maintenance-session'
import { LandingHeroSummary } from '@/features/public/components/landing-hero-summary'
import { LandingWeather } from '@/features/public/components/landing-weather'
import { LandingMobileNav } from '@/features/public/components/landing-mobile-nav'
import { LandingContactSection } from '@/features/public/components/landing-contact-section'
import { LandingPublicationsPreview } from '@/features/public/components/landing-publications-preview'
import { LandingInstagramGallery } from '@/features/public/components/landing-instagram-gallery'
import { LandingSpmAchievements } from '@/features/public/components/landing-spm-achievements'
import { LocaleToggle } from '@/features/public/components/locale-toggle'
import { usePrefersReducedMotion } from '@/features/public/hooks/use-prefers-reduced-motion'
import { usePublicLocale } from '@/features/public/i18n/use-public-locale'
import { usePageSeo } from '@/hooks/use-page-seo'
import { buildOrganizationJsonLd } from '@/lib/seo'

function LandingAccessLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          // Scroll directly — avoid browser hash jump + router history flicker.
          e.preventDefault()
          const el = document.querySelector(href)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Prefer maintenance over landing — never paint the public page first.
    if (await shouldBlockForMaintenance('/')) {
      throw redirect({ to: '/maintenance' })
    }

    const session = await fetchSession()

    if (session?.user && !isPublicOnlyUser(session.user.roles)) {
      throw redirect({
        to: '/dashboard',
      })
    }

    let settings = null
    try {
      settings = await getAppSettings()
    } catch {
      // Ignore API errors for landing page check
    }

    if (settings) {
      const landingActive = getSettingValue(settings.data, 'landing_page_active')
      if (landingActive === '0') {
        throw redirect({
          to: '/sign-in',
        })
      }
    }
  },
  component: LandingPage,
})

function LandingPage() {
  usePageSeo({
    title: 'Arumanis — Portal Air Minum & Sanitasi Kabupaten Cianjur',
    description:
      'Portal informasi publik capaian layanan air minum dan sanitasi Kabupaten Cianjur. Peta interaktif, data per desa, publikasi, dan dokumen terbuka.',
    url: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    type: 'website',
    jsonLd: buildOrganizationJsonLd(),
  })

  const reducedMotion = usePrefersReducedMotion()
  const { data: settingsResponse } = useAppSettings()
  const showSpmDetailPage = isSpmDetailPageActive(settingsResponse?.data)
  const showCapaianPublikSection = isCapaianPublikSectionActive(settingsResponse?.data)
  const { messages } = usePublicLocale()
  const copy = messages.landing
  const showAchievementsNav = showCapaianPublikSection || showSpmDetailPage
  const achievementsNavHref = showCapaianPublikSection
    ? '#capaian-spm'
    : '/capaian-spm'
  const navItems = [
    ...(showAchievementsNav
      ? [{ label: copy.nav.achievements, href: achievementsNavHref }]
      : []),
    { label: copy.nav.about, href: '#about' },
    { label: copy.nav.publications, href: '#publikasi' },
    { label: copy.nav.instagram, href: '#instagram' },
  ]
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash
      if (!hash) return
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // Native anchor scroll fires before async boot renders the sections — retry after mount.
    const id = window.setTimeout(scrollToHash, 150)
    window.addEventListener('hashchange', scrollToHash)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1C1C1C] flex flex-col antialiased relative overflow-x-hidden">
      <header className="sticky top-0 w-full z-50 bg-[#FAFAFA] border-b-4 border-[#1C1C1C]">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/arumanis.svg" alt="Arumanis" className="h-10 w-auto" />
            <span className="font-display text-lg font-bold tracking-tight text-[#1C1C1C]">
              arumanis
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <LandingAccessLink
                key={item.label}
                href={item.href}
                className="text-xs font-bold uppercase tracking-[0.15em] text-[#1C1C1C] transition-colors hover:text-[#9B72CF]"
              >
                {item.label}
              </LandingAccessLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleToggle variant="header" className="hidden sm:inline-flex" />
            <LandingMobileNav
              copy={copy}
              showSpmDetailPage={showSpmDetailPage}
              showCapaianPublikSection={showCapaianPublikSection}
            />
            <Link
              to="/sign-in"
              className="brutal-btn rounded-sm px-5 py-2 text-[11px] uppercase tracking-[0.15em]"
            >
              {copy.nav.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b-4 border-[#1C1C1C] py-20 lg:py-28 bg-[#FF9CBA]/10">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(#1C1C1C 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="container mx-auto px-6 text-center relative z-10">
            {!reducedMotion && (
              <>
                <Star
                  aria-hidden
                  className="pointer-events-none absolute left-[15%] top-8 hidden h-8 w-8 fill-[#FCE954] text-[#1C1C1C] animate-[brutal-sparkle_3s_ease-in-out_infinite] lg:block"
                />
                <Sparkles
                  aria-hidden
                  className="pointer-events-none absolute right-[10%] top-16 hidden h-10 w-10 text-[#FCE954] animate-[brutal-sparkle_3.5s_ease-in-out_infinite] lg:block"
                />
              </>
            )}
            <div className="mb-8 inline-flex flex-wrap items-center justify-center gap-3">
              <LandingWeather />
            </div>
            <h1 className="mb-6 font-display text-5xl font-bold leading-[0.95] tracking-tighter text-[#1C1C1C] lg:mb-8 lg:text-7xl">
              {reducedMotion ? (
                copy.hero.title
              ) : (
                <SplitText
                  text={copy.hero.title}
                  className="inline-block"
                  delay={150}
                />
              )}
            </h1>
            <p className="text-base lg:text-xl text-[#1C1C1C]/80 max-w-2xl mx-auto leading-relaxed font-medium">
              {copy.hero.description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {showAchievementsNav ? (
                showCapaianPublikSection ? (
                  <a
                    href="#capaian-spm"
                    className="brutal-btn rounded-sm px-6 py-3 text-sm"
                    onClick={(e) => {
                      e.preventDefault()
                      const el = document.querySelector('#capaian-spm')
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {copy.hero.ctaAchievements}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <Link
                    to="/capaian-spm"
                    className="brutal-btn rounded-sm px-6 py-3 text-sm"
                  >
                    {copy.hero.ctaAchievements}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )
              ) : null}
              <Link
                to="/publikasi"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#1C1C1C] bg-[#FAFAFA] brutal-shadow px-6 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                {copy.hero.ctaPublications}
              </Link>
            </div>
            {showCapaianPublikSection ? <LandingHeroSummary /> : null}
          </div>
        </section>

        {showCapaianPublikSection ? <LandingSpmAchievements /> : null}

        <section id="about" className="border-b-4 border-[#1C1C1C] bg-transparent py-16 lg:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <span className="mb-3 inline-block border-2 border-[#1C1C1C] bg-[#FCE954] brutal-shadow px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1C1C1C]">
                {copy.about.label}
              </span>
              <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter mb-8 text-[#1C1C1C]">
                {copy.about.title}
              </h2>
              <p className="text-base lg:text-xl text-[#1C1C1C]/80 leading-relaxed font-medium mb-12">
                {copy.about.description}
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                {copy.about.cards.map((item, index) => {
                  const cardBg =
                    index % 3 === 0
                      ? 'bg-[#FF9CBA]'
                      : index % 3 === 1
                        ? 'bg-[#FCE954]'
                        : 'bg-[#9B72CF]'
                  const textColor = cardBg === 'bg-[#9B72CF]' ? 'text-white' : 'text-[#1C1C1C]'
                  return (
                    <div
                      key={item.label}
                      className={`brutal-card p-8 flex flex-col ${cardBg} ${textColor} transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <span className="inline-flex h-10 items-center border-2 border-[#1C1C1C] bg-[#FAFAFA] px-3 font-display text-sm font-bold uppercase tracking-[0.15em] text-[#1C1C1C]">
                          {item.label}
                        </span>
                        <span className={`font-display text-4xl font-bold ${textColor === 'text-white' ? 'text-white/25' : 'text-[#1C1C1C]/15'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className={`${textColor === 'text-white' ? 'text-white/90' : 'text-[#1C1C1C]/85'} text-sm leading-relaxed`}>
                        {item.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="publikasi" className="border-b-4 border-[#1C1C1C] bg-transparent py-20 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#1C1C1C]/60">
                  {copy.publications.label}
                </span>
                <h2 className="mb-3 font-display text-3xl font-bold tracking-tight text-[#1C1C1C] lg:text-4xl">
                  {copy.publications.title}
                </h2>
                <p className="text-[#1C1C1C]/75 leading-relaxed">
                  {copy.publications.description}
                </p>
              </div>
              <Link
                to="/publikasi"
                className="brutal-btn shrink-0 rounded-sm px-6 py-3 text-sm"
              >
                {copy.publications.cta}
              </Link>
            </div>
            <LandingPublicationsPreview />
          </div>
        </section>

        <section id="instagram" className="border-b-4 border-[#1C1C1C] bg-transparent py-20 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="mb-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#1C1C1C]/60">
                  {copy.instagram.label}
                </span>
                <h2 className="mb-3 font-display text-3xl font-bold tracking-tight text-[#1C1C1C] lg:text-4xl">
                  {copy.instagram.title}
                </h2>
                <p className="text-[#1C1C1C]/75 leading-relaxed">
                  {copy.instagram.description}
                </p>
              </div>
              <a
                href="https://www.instagram.com/bidang_ams/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 border-2 border-[#1C1C1C] bg-[#FCE954] brutal-shadow px-6 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <Instagram className="h-4 w-4" aria-hidden />
                {copy.instagram.cta}
              </a>
            </div>
            <LandingInstagramGallery />
          </div>
        </section>

        <LandingContactSection copy={copy.contact} />
      </main>

      <footer className="border-t-4 border-[#1C1C1C] py-12 lg:py-16 bg-[#9B72CF] text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <img src="/arumanis.svg" alt="Arumanis" className="h-8 w-auto" />
              </div>
              <p className="text-xs text-white/80 leading-relaxed uppercase tracking-widest font-semibold">
                {copy.footer.tagline}
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FCE954]">
                  {copy.footer.instagram}
                </span>
                <a
                  href="https://www.instagram.com/bidang_ams/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2.5 text-xs text-white/85 transition-colors hover:text-[#FCE954]"
                >
                  <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-[#FF9CBA] group-hover:text-[#FCE954]" aria-hidden />
                  <span>
                    <span className="block font-semibold uppercase tracking-wider">@bidang_ams</span>
                    <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-wide text-white/70 group-hover:text-white">
                      {copy.footer.instagramBidangAms}
                    </span>
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/disperkim.cianjur/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2.5 text-xs text-white/85 transition-colors hover:text-[#FCE954]"
                >
                  <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-[#FF9CBA] group-hover:text-[#FCE954]" aria-hidden />
                  <span>
                    <span className="block font-semibold uppercase tracking-wider">@disperkim.cianjur</span>
                    <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-wide text-white/70 group-hover:text-white">
                      {copy.footer.instagramDisperkim}
                    </span>
                  </span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-16">
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FCE954] mb-2">
                  {copy.footer.navigation}
                </span>
                {showAchievementsNav ? (
                  showSpmDetailPage ? (
                    <Link to="/capaian-spm" className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors">
                      {copy.nav.achievements}
                    </Link>
                  ) : (
                    <a
                      href="#capaian-spm"
                      className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        const el = document.querySelector('#capaian-spm')
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {copy.nav.achievements}
                    </a>
                  )
                ) : null}
                <a
                  href="#about"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.querySelector('#about')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {copy.nav.about}
                </a>
                <a
                  href="#publikasi"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.querySelector('#publikasi')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {copy.nav.publications}
                </a>
                <a
                  href="#instagram"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.querySelector('#instagram')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {copy.nav.instagram}
                </a>
                <Link
                  to="/publikasi"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                >
                  {copy.publications.cta}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#1C1C1C] bg-[#FCE954] brutal-shadow px-3 py-2 rounded-sm transition-all w-fit mt-2 flex items-center gap-2"
                >
                  {copy.footer.dashboard} →
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FCE954] mb-2">
                  {copy.footer.information}
                </span>
                <Link
                  to="/tujuan-manfaat-hasil"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                >
                  {copy.footer.objectives}
                </Link>
                <Link
                  to="/rancang-bangun-inovasi"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                >
                  {copy.footer.designBuild}
                </Link>
                <Link
                  to="/changelog"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                >
                  {copy.footer.changelog}
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FCE954] mb-2">
                  {copy.footer.legal}
                </span>
                <Link
                  to="/terms"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                >
                  {copy.footer.terms}
                </Link>
                <Link
                  to="/privacy-policy"
                  className="text-xs font-semibold uppercase tracking-widest text-white/85 hover:text-[#FCE954] transition-colors"
                >
                  {copy.footer.privacy}
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-16 lg:mt-20 pt-8 border-t-2 border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">
              {copy.footer.copyright}
            </p>
            <LocaleToggle variant="footer" />
          </div>
        </div>
      </footer>
    </div>
  )
}