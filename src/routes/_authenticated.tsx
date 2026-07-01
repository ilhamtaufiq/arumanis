import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { requireAuthenticatedSession } from '@/lib/route-auth'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: AuthenticatedLayout,
})
