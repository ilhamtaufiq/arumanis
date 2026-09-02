import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PeripaanPage = lazy(() =>
    lazyImport(() => import('@/features/peripaan/components/PeripaanPage'), 'peripaan-page'),
)

function PeripaanPageWrapper() {
    return (
        <RouteSuspense label="Memuat Peta Perpipaan...">
            <PeripaanPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/peripaan/')({
    component: PeripaanPageWrapper,
})
