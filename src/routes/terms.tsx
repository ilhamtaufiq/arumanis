import { createFileRoute } from '@tanstack/react-router'
import { Terms } from '@/features/public/terms'
import { usePageSeo } from '@/hooks/use-page-seo'

export const Route = createFileRoute('/terms')({
  component: TermsRoute,
})

function TermsRoute() {
  usePageSeo({
    title: 'Syarat & Ketentuan — Arumanis Cianjur',
    description: 'Syarat dan ketentuan penggunaan portal informasi Arumanis Kabupaten Cianjur.',
    url: typeof window !== 'undefined' ? `${window.location.origin}/terms` : undefined,
  })

  return <Terms />
}
