import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PuspenPekerjaanReviewPage = lazy(() =>
    lazyImport(
        () => import('@/features/puspen/components/PuspenPekerjaanReviewPage').then((m) => ({ default: m.PuspenPekerjaanReviewPage })),
        'puspen-review-pekerjaan',
    ),
)

function PuspenPekerjaanReviewRoute() {
    return (
        <RouteSuspense label="Memuat review pekerjaan...">
            <PuspenPekerjaanReviewPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/review-pekerjaan')({
    component: PuspenPekerjaanReviewRoute,
})