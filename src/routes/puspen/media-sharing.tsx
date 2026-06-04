import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'

import { PuspenMediaSharingPage } from '@/features/puspen'

export const Route = createFileRoute('/puspen/media-sharing')({
    component: PuspenMediaSharingRoute,
})

function PuspenMediaSharingRoute() {
    const location = useLocation()

    if (location.pathname !== '/puspen/media-sharing') {
        return <Outlet />
    }

    return <PuspenMediaSharingPage />
}
