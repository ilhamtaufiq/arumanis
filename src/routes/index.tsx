import { createFileRoute, redirect } from '@tanstack/react-router'
import { fetchSession } from '@/lib/auth-session'
import { isPublicOnlyUser } from '@/lib/post-login-redirect'

import {
  getAppSettings,
  getSettingValue,
} from '@/features/settings/api'
import { shouldBlockForMaintenance } from '@/lib/maintenance-session'
import { usePageSeo } from '@/hooks/use-page-seo'
import { buildOrganizationJsonLd } from '@/lib/seo'
import { LandingContactSection } from '@/features/public/components/landing-contact-section'
import { usePublicLocale } from '@/features/public/i18n/use-public-locale'
import '../features/landing-v2/landing-v2.css'
import { Navigation } from '@/features/landing-v2/components/navigation'
import { HeroSection } from '@/features/landing-v2/components/hero-section'
import { FeaturesSection } from '@/features/landing-v2/components/features-section'
import { HowItWorksSection } from '@/features/landing-v2/components/how-it-works-section'
import { InfrastructureSection } from '@/features/landing-v2/components/infrastructure-section'
import { MetricsSection } from '@/features/landing-v2/components/metrics-section'
import { IntegrationsSection } from '@/features/landing-v2/components/integrations-section'
import { SecuritySection } from '@/features/landing-v2/components/security-section'
import { DevelopersSection } from '@/features/landing-v2/components/developers-section'
import { TestimonialsSection } from '@/features/landing-v2/components/testimonials-section'
import { CtaSection } from '@/features/landing-v2/components/cta-section'
import { FooterSection } from '@/features/landing-v2/components/footer-section'

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
      </main>
      <FooterSection />
    </div>
  )
}
