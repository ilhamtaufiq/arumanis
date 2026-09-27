import { createFileRoute } from '@tanstack/react-router'
import { PublikasiList } from '@/features/publikasi/components/PublikasiList'
import { usePageSeo } from '@/hooks/use-page-seo'

export const Route = createFileRoute('/publikasi/')({
  component: PublikasiRoute,
})

function PublikasiRoute() {
  usePageSeo({
    title: 'Publikasi & Kabar Berita — Arumanis Cianjur',
    description: 'Berita, artikel, dan informasi publikasi terkait program air minum dan sanitasi di Kabupaten Cianjur.',
    url: typeof window !== 'undefined' ? `${window.location.origin}/publikasi` : undefined,
  })

  return <PublikasiList />
}
