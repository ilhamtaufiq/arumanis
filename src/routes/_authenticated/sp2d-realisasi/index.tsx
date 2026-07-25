import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const Sp2dRealisasiPage = lazy(() =>
    lazyImport(
        () => import('@/features/sp2d-realisasi/components/Sp2dRealisasiPage'),
        'sp2d-realisasi-page',
    ),
)

function Sp2dRealisasiRoute() {
    return (
        <RouteSuspense label="Memuat Realisasi SP2D...">
            <Sp2dRealisasiPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/sp2d-realisasi/')({
    component: Sp2dRealisasiRoute,
})
