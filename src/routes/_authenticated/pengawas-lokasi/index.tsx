import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PengawasLocationPage = lazy(() =>
    lazyImport(() => import('@/features/pengawas/components/PengawasLocationPage'), 'pengawas-location-page'),
)

function PengawasLocationPageWrapper() {
    return (
        <RouteSuspense label="Memuat peta lokasi pengawas...">
            <PengawasLocationPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/pengawas-lokasi/')({
    component: PengawasLocationPageWrapper,
})