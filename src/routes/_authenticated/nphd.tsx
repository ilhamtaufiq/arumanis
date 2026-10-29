import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const NphdListPage = lazy(() =>
    lazyImport(() => import('@/features/pekerjaan/components/NphdListPage'), 'nphd-list-page'),
)

export const Route = createFileRoute('/_authenticated/nphd')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <RouteSuspense label="Memuat NPHD...">
                <NphdListPage />
            </RouteSuspense>
        </ProtectedRoute>
    ),
})
