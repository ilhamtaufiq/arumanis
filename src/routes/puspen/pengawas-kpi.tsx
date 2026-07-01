import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PuspenPengawasKpiPage = lazy(() =>
    lazyImport(
        () => import('@/features/puspen/components/PuspenPengawasKpiPage').then((m) => ({ default: m.PuspenPengawasKpiPage })),
        'puspen-pengawas-kpi',
    ),
)

function PuspenPengawasKpiRoute() {
    return (
        <RouteSuspense label="Memuat KPI pengawas...">
            <PuspenPengawasKpiPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/pengawas-kpi')({
    component: PuspenPengawasKpiRoute,
})