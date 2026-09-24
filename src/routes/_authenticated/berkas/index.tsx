import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy, useCallback } from 'react'
import { z } from 'zod'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const DrivePage = lazy(() =>
    lazyImport(
        () => import('@/features/berkas/components/drive/DrivePage').then((m) => ({ default: m.DrivePage })),
        'drive-page',
    ),
)

const berkasSearchSchema = z.object({
    view: z.enum(['grid', 'list']).optional().catch('grid'),
})

export const Route = createFileRoute('/_authenticated/berkas/')({
    validateSearch: berkasSearchSchema,
    component: BerkasRoute,
})

function BerkasRoute() {
    const { view } = Route.useSearch()
    const navigate = useNavigate({ from: '/berkas/' })

    const handleViewChange = useCallback(
        (next: 'grid' | 'list') => {
            void navigate({ search: (prev) => ({ ...prev, view: next }), replace: true })
        },
        [navigate],
    )

    return (
        <ProtectedRoute requiredPath='/berkas' requiredMethod='GET'>
            <RouteSuspense label='Memuat Drive Saya...'>
                <DrivePage initialView={view ?? 'grid'} onViewChange={handleViewChange} />
            </RouteSuspense>
        </ProtectedRoute>
    )
}
