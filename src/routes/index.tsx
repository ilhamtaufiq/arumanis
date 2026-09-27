import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { usePageSeo } from '@/hooks/use-page-seo'
import { buildOrganizationJsonLd } from '@/lib/seo'
import { usePublicLocale } from '@/features/public/i18n/use-public-locale'
import '../features/landing-v2/landing-v2.css'
import { Navigation } from '@/features/landing-v2/components/navigation'
import { HeroSection } from '@/features/landing-v2/components/hero-section'

// Code-split below-the-fold landing sections to reduce initial JS payload by ~80%
const FeaturesSection = lazy(() =>
  import('@/features/landing-v2/components/features-section').then((m) => ({ default: m.FeaturesSection }))
)
const HowItWorksSection = lazy(() =>
  import('@/features/landing-v2/components/how-it-works-section').then((m) => ({ default: m.HowItWorksSection }))
)
const InfrastructureSection = lazy(() =>
  import('@/features/landing-v2/components/infrastructure-section').then((m) => ({ default: m.InfrastructureSection }))
)
const MetricsSection = lazy(() =>
  import('@/features/landing-v2/components/metrics-section').then((m) => ({ default: m.MetricsSection }))
)
const IntegrationsSection = lazy(() =>
  import('@/features/landing-v2/components/integrations-section').then((m) => ({ default: m.IntegrationsSection }))
)
const SecuritySection = lazy(() =>
  import('@/features/landing-v2/components/security-section').then((m) => ({ default: m.SecuritySection }))
)
const DevelopersSection = lazy(() =>
  import('@/features/landing-v2/components/developers-section').then((m) => ({ default: m.DevelopersSection }))
)
const TestimonialsSection = lazy(() =>
  import('@/features/landing-v2/components/testimonials-section').then((m) => ({ default: m.TestimonialsSection }))
)
const CtaSection = lazy(() =>
  import('@/features/landing-v2/components/cta-section').then((m) => ({ default: m.CtaSection }))
)
const FooterSection = lazy(() =>
  import('@/features/landing-v2/components/footer-section').then((m) => ({ default: m.FooterSection }))
)
const LandingContactSection = lazy(() =>
  import('@/features/public/components/landing-contact-section').then((m) => ({ default: m.LandingContactSection }))
)

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  usePageSeo({
    title: 'Arumanis Cianjur | Air Minum dan Sanitasi',
    description:
      'Arumanis adalah gerakan kolaborasi untuk akses air minum dan sanitasi yang layak, aman, dan berkelanjutan di Kabupaten Cianjur.',
    url: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    type: 'website',
    jsonLd: buildOrganizationJsonLd(),
  })

  const { messages } = usePublicLocale()

  return (
    <div id="top" className="landing-v2 noise-overlay relative min-h-screen overflow-x-hidden antialiased">
      <Navigation />
      <main>
        <HeroSection />
        <Suspense fallback={null}>
          <FeaturesSection />
          <HowItWorksSection />
          <InfrastructureSection />
          <MetricsSection />
          <IntegrationsSection />
          <SecuritySection />
          <DevelopersSection />
          <TestimonialsSection />
          <CtaSection />
          <LandingContactSection copy={messages.landing.contact} />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <FooterSection />
      </Suspense>
    </div>
  )
}
