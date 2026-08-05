import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const ArumanisInsight = lazy(() =>
    lazyImport(
        () =>
            import('@/features/arumanis-insight/components/ArumanisInsight').then((m) => ({
                default: m.ArumanisInsight,
            })),
        'arumanis-insight',
    ),
)

export const Route = createFileRoute('/_authenticated/arumanis-insight')({
    component: ArumanisInsightRoute,
})

function ArumanisInsightRoute() {
    return (
        <RouteSuspense label="Memuat Insight...">
            <ArumanisInsight />
        </RouteSuspense>
    )
}
