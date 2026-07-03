import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { fetchSession } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'
import {
  ArrowRight,
  Hammer,
  Instagram,
  MapPin,
  Newspaper,
  Target,
} from 'lucide-react'
import SplitText from '@/components/SplitText'
import ShinyText from '@/components/ShinyText'
import GooeyNav from '@/components/ui/GooeyNav'
import DecryptedText from '@/components/DecryptedText'
import SpotlightCard from '@/components/ui/SpotlightCard'

import { getAppSettings, getSettingValue, isSpmDetailPageActive, useAppSettings } from '@/features/settings/api'
import { LandingHeroSummary } from '@/features/public/components/landing-hero-summary'
import { LandingMobileNav } from '@/features/public/components/landing-mobile-nav'
import { LandingContactSection } from '@/features/public/components/landing-contact-section'
import { LandingPublicationsPreview } from '@/features/public/components/landing-publications-preview'
import { LandingSpmAchievements } from '@/features/public/components/landing-spm-achievements'
import { LocaleToggle } from '@/features/public/components/locale-toggle'
import { usePrefersReducedMotion } from '@/features/public/hooks/use-prefers-reduced-motion'
import { usePublicLocale } from '@/features/public/i18n/use-public-locale'
import { lazyImport } from '@/lib/utils'
import { usePageSeo } from '@/hooks/use-page-seo'
import { buildOrganizationJsonLd } from '@/lib/seo'

const Grainient = lazy(() => lazyImport(() => import('@/components/ui/Grainient'), 'grainient'))

const ACCESS_ICONS = [
  <MapPin className="w-5 h-5" key="map" />,
  <Newspaper className="w-5 h-5" key="news" />,
  <Target className="w-5 h-5" key="target" />,
  <Hammer className="w-5 h-5" key="build" />,
]

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
      <a href={href} className={className}>
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

  const [showBackgroundEffect, setShowBackgroundEffect] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const { data: settingsResponse } = useAppSettings()
  const showSpmDetailPage = isSpmDetailPageActive(settingsResponse?.data)
  const { messages } = usePublicLocale()
  const copy = messages.landing

  useEffect(() => {
    if (reducedMotion) return
    const enableBackgroundEffect = () => setShowBackgroundEffect(true)

    const browserWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (browserWindow.requestIdleCallback && browserWindow.cancelIdleCallback) {
      const idleCallbackId = browserWindow.requestIdleCallback(enableBackgroundEffect, {
        timeout: 1200,
      })

      return () => browserWindow.cancelIdleCallback?.(idleCallbackId)
    }

    const timeoutId = window.setTimeout(enableBackgroundEffect, 250)
    return () => window.clearTimeout(timeoutId)
  }, [reducedMotion])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,159,252,0.9),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(82,39,255,0.95),transparent_42%),linear-gradient(135deg,#b497cf_0%,#8f78ff_48%,#5227ff_100%)] flex flex-col antialiased relative overflow-x-hidden">
      <header className="fixed top-5 md:top-8 w-full z-50 pointer-events-none">
        <div className="container mx-auto px-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <img src="/arumanis.svg" alt="Arumanis" className="h-10 w-auto drop-shadow-2xl" />
          </div>

          <div className="hidden md:block">
            <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-1 shadow-2xl">
              <GooeyNav
                items={[
                  { label: copy.nav.achievements, href: '#capaian-spm' },
                  { label: copy.nav.access, href: '#access' },
                  { label: copy.nav.about, href: '#about' },
                  { label: copy.nav.publications, href: '#publikasi' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LocaleToggle variant="header" className="hidden sm:inline-flex" />
            <LandingMobileNav copy={copy} showSpmDetailPage={showSpmDetailPage} />
            <Link
              to="/sign-in"
              className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-black/15 transition-colors hover:bg-white/90"
            >
              {copy.nav.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-transparent py-20 lg:py-28">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-block mb-8">
              {reducedMotion ? (
                <span className="text-[18px] font-bold uppercase tracking-[0.3em] text-white">
                  {copy.hero.tagline}
                </span>
              ) : (
                <ShinyText
                  text={copy.hero.tagline}
                  disabled={false}
                  speed={3}
                  className="text-[18px] font-bold uppercase tracking-[0.3em] text-white"
                />
              )}
            </div>
            <h1 className="mb-6 text-5xl font-medium leading-[0.95] tracking-tighter text-white lg:mb-8 lg:text-7xl">
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
            <p className="text-base lg:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed font-light">
              {copy.hero.description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#capaian-spm"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {copy.hero.ctaAchievements}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                to="/publikasi"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {copy.hero.ctaPublications}
              </Link>
            </div>
            <LandingHeroSummary />
          </div>
        </section>

        <LandingSpmAchievements />

        <section id="access" className="border-b border-white/10 bg-transparent py-20 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <h2 className="text-4xl font-medium tracking-tight mb-6 text-white">
                  {reducedMotion ? (
                    copy.access.title
                  ) : (
                    <DecryptedText text={copy.access.title} animateOn="view" />
                  )}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {copy.access.description}
                </p>
              </div>

              <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
                {copy.access.items.map((item, index) => (
                  <SpotlightCard
                    key={item.title}
                    className="bg-white/5 border-white/10 p-8 group flex flex-col"
                    spotlightColor="rgba(255, 255, 255, 0.1)"
                  >
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <div className="text-white/40 group-hover:text-white transition-colors">
                        {ACCESS_ICONS[index]}
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-3 text-white">{item.title}</h3>
                    <p className="text-white/75 leading-relaxed text-sm flex-1 mb-5">
                      {item.desc}
                    </p>
                    <LandingAccessLink
                      href={item.href}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors group-hover:text-white"
                    >
                      {item.cta}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </LandingAccessLink>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-b border-white/10 bg-transparent py-16 lg:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl lg:text-5xl font-medium tracking-tighter mb-8 text-white">
                {copy.about.title}
              </h2>
              <p className="text-base lg:text-xl text-white/80 leading-relaxed font-light mb-12">
                {copy.about.description}
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                {copy.about.cards.map((item) => (
                  <SpotlightCard
                    key={item.label}
                    className="bg-white/5 border-white/10 p-8"
                    spotlightColor="rgba(255, 255, 255, 0.05)"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 block">
                      {item.label}
                    </span>
                    <p className="text-white/85 text-sm leading-relaxed">{item.text}</p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="publikasi" className="border-b border-white/10 bg-transparent py-20 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                  {copy.publications.label}
                </span>
                <h2 className="mb-3 text-3xl font-medium tracking-tight text-white lg:text-4xl">
                  {copy.publications.title}
                </h2>
                <p className="text-white/78 leading-relaxed">
                  {copy.publications.description}
                </p>
              </div>
              <Link
                to="/publikasi"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {copy.publications.cta}
              </Link>
            </div>
            <LandingPublicationsPreview />
          </div>
        </section>

        <LandingContactSection copy={copy.contact} />
      </main>

      <footer className="border-t border-white/10 py-12 lg:py-16 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <img src="/arumanis.svg" alt="Arumanis" className="h-8 w-auto" />
              </div>
              <p className="text-xs text-white/65 leading-relaxed uppercase tracking-widest font-semibold">
                {copy.footer.tagline}
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  {copy.footer.instagram}
                </span>
                <a
                  href="https://www.instagram.com/bidang_ams/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2.5 text-xs text-white/70 transition-colors hover:text-white"
                >
                  <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-pink-400/90 group-hover:text-pink-300" aria-hidden />
                  <span>
                    <span className="block font-semibold uppercase tracking-wider">@bidang_ams</span>
                    <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-wide text-white/50 group-hover:text-white/70">
                      {copy.footer.instagramBidangAms}
                    </span>
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/disperkim.cianjur/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2.5 text-xs text-white/70 transition-colors hover:text-white"
                >
                  <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-pink-400/90 group-hover:text-pink-300" aria-hidden />
                  <span>
                    <span className="block font-semibold uppercase tracking-wider">@disperkim.cianjur</span>
                    <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-wide text-white/50 group-hover:text-white/70">
                      {copy.footer.instagramDisperkim}
                    </span>
                  </span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-16">
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">
                  {copy.footer.navigation}
                </span>
                {showSpmDetailPage ? (
                  <Link to="/capaian-spm" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
                    {copy.nav.achievements}
                  </Link>
                ) : (
                  <a href="#capaian-spm" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
                    {copy.nav.achievements}
                  </a>
                )}
                <a href="#access" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
                  {copy.nav.access}
                </a>
                <a href="#about" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
                  {copy.nav.about}
                </a>
                <a href="#publikasi" className="text-xs font-semibold uppercase tracking-widest text-white/75 hover:text-white transition-colors">
                  {copy.nav.publications}
                </a>
                <Link
                  to="/publikasi"
                  className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {copy.publications.cta}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all w-fit mt-2 flex items-center gap-2"
                >
                  {copy.footer.dashboard} →
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">
                  {copy.footer.information}
                </span>
                <Link
                  to="/tujuan-manfaat-hasil"
                  className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {copy.footer.objectives}
                </Link>
                <Link
                  to="/rancang-bangun-inovasi"
                  className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {copy.footer.designBuild}
                </Link>
                <Link
                  to="/changelog"
                  className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {copy.footer.changelog}
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">
                  {copy.footer.legal}
                </span>
                <Link
                  to="/terms"
                  className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {copy.footer.terms}
                </Link>
                <Link
                  to="/privacy-policy"
                  className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {copy.footer.privacy}
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-16 lg:mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
              {copy.footer.copyright}
            </p>
            <LocaleToggle variant="footer" />
          </div>
        </div>
      </footer>
      {showBackgroundEffect && !reducedMotion && (
        <Suspense fallback={null}>
          <Grainient
            className="fixed inset-0 z-[-1] opacity-90 dark:opacity-80 pointer-events-none overflow-hidden"
            color1="#FF9FFC"
            color2="#5227FF"
            color3="#B497CF"
            timeSpeed={0.15}
            warpStrength={0.8}
          />
        </Suspense>
      )}
    </div>
  )
}