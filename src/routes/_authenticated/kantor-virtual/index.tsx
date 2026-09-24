import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const VirtualOfficePage = lazy(() =>
    lazyImport(
        () => import('@/features/virtual-office/components/VirtualOfficePage'),
        'kantor-virtual',
    ),
)

function KantorVirtualRoute() {
    return (
        <RouteSuspense label="Memuat Kantor Virtual...">
            <VirtualOfficePage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/kantor-virtual/')({
    component: KantorVirtualRoute,
})
