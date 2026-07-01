import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const RabAnalyzerPage = lazy(() =>
    lazyImport(() => import('@/features/rab-analyzer/components/RabAnalyzerPage'), 'rab-analyzer-page'),
)

function RabAnalyzerRoute() {
    return (
        <RouteSuspense label="Memuat Analisa RAB...">
            <RabAnalyzerPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/rab-analyzer/')({
    validateSearch: (search: Record<string, unknown>) => ({
        pekerjaanId: search.pekerjaanId,
    }),
    component: RabAnalyzerRoute,
})