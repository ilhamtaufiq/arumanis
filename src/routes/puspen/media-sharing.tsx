import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const PuspenMediaSharingPage = lazy(() =>
    lazyImport(() => import('@/features/puspen').then((m) => ({ default: m.PuspenMediaSharingPage })), 'puspen-media-sharing'),
)

function PuspenMediaSharingRoute() {
    const location = useLocation()

    if (location.pathname !== '/puspen/media-sharing') {
        return <Outlet />
    }

    return (
        <RouteSuspense label="Memuat media sharing...">
            <PuspenMediaSharingPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/media-sharing')({
    component: PuspenMediaSharingRoute,
})