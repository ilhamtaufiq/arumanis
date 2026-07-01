import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PuspenProgressFisikPage = lazy(() =>
    lazyImport(
        () => import('@/features/puspen/components/PuspenProgressFisikPage').then((m) => ({ default: m.PuspenProgressFisikPage })),
        'puspen-progress-fisik',
    ),
)

function PuspenProgressFisikRoute() {
    return (
        <RouteSuspense label="Memuat progress fisik...">
            <PuspenProgressFisikPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/progress-fisik')({
    component: PuspenProgressFisikRoute,
})