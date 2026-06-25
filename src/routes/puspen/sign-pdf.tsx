import { createFileRoute } from '@tanstack/react-router'
import { PuspenPage } from '@/features/puspen'
import { requireAuthenticatedSession } from '@/lib/route-auth'

export const Route = createFileRoute('/puspen/sign-pdf')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: PuspenSignPdfRoute,
})

function PuspenSignPdfRoute() {
    return <PuspenPage />
}
