import { createFileRoute } from '@tanstack/react-router'
import { PuspenOrganizePdfFilesPage } from '@/features/puspen/components/PuspenOrganizePdfFilesPage'
import { requireAuthenticatedSession } from '@/lib/route-auth'

export const Route = createFileRoute('/puspen/organize-pdf')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: PuspenOrganizePdfRoute,
})

function PuspenOrganizePdfRoute() {
    return <PuspenOrganizePdfFilesPage />
}
