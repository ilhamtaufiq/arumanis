import { createFileRoute } from '@tanstack/react-router'

import { PuspenMediaSharingPublicPage } from '@/features/puspen'

export const Route = createFileRoute('/puspen/media-sharing/$shareToken')({
    component: PuspenMediaSharingPublicRoute,
})

function PuspenMediaSharingPublicRoute() {
    const { shareToken } = Route.useParams()

    return <PuspenMediaSharingPublicPage shareToken={shareToken} />
}
