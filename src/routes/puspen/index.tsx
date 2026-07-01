import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PuspenHomePage = lazy(() =>
    lazyImport(() => import('@/features/puspen').then((m) => ({ default: m.PuspenHomePage })), 'puspen-home'),
)

function PuspenIndexRoute() {
    return (
        <RouteSuspense label="Memuat Puspen...">
            <PuspenHomePage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/')({
    component: PuspenIndexRoute,
})