import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { PublikasiLayout } from '@/features/publikasi/components/PublikasiLayout'
import { usePageSeo } from '@/hooks/use-page-seo'
import { z } from 'zod'

const publikasiSearchSchema = z.object({
  category: z.string().optional(),
})

export const Route = createFileRoute('/publikasi')({
  validateSearch: (search) => publikasiSearchSchema.parse(search),
  component: PublicLayout,
})

function PublicLayout() {
  const isDetailRoute = useRouterState({
    select: (state) => state.location.pathname.match(/^\/publikasi\/[^/]+$/) != null,
  })

  usePageSeo(
    isDetailRoute
      ? null
      : {
          title: 'Arumanis Publikasi — Berita & Dokumentasi Air Minum dan Sanitasi',
          description:
            'Berita, galeri, informasi publik, dan dokumentasi resmi seputar pembangunan infrastruktur air minum dan sanitasi Kabupaten Cianjur.',
          url: `${typeof window !== 'undefined' ? window.location.origin : ''}/publikasi`,
          type: 'website',
        },
  )

  return (
    <PublikasiLayout>
      <Outlet />
    </PublikasiLayout>
  )
}
