import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '@/features/public/privacy-policy'
import { usePageSeo } from '@/hooks/use-page-seo'

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyRoute,
})

function PrivacyPolicyRoute() {
  usePageSeo({
    title: 'Kebijakan Privasi — Arumanis Cianjur',
    description: 'Kebijakan privasi perlindungan data dan privasi pengguna portal Arumanis Kabupaten Cianjur.',
    url: typeof window !== 'undefined' ? `${window.location.origin}/privacy-policy` : undefined,
  })

  return <PrivacyPolicy />
}
