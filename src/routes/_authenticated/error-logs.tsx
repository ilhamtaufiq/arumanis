import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const ErrorLogList = lazy(() =>
    lazyImport(() => import('@/features/error-logs/components/ErrorLogList'), 'error-log-list'),
)

function ErrorLogsRoute() {
    return (
        <RouteSuspense label="Memuat error logs...">
            <ErrorLogList />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/error-logs')({
    component: ErrorLogsRoute,
})