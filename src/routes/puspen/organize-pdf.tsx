import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { requireAuthenticatedSession } from '@/lib/route-auth'

const PuspenOrganizePdfFilesPage = lazy(() =>
    lazyImport(
        () => import('@/features/puspen/components/PuspenOrganizePdfFilesPage').then((m) => ({ default: m.PuspenOrganizePdfFilesPage })),
        'puspen-organize-pdf',
    ),
)

function PuspenOrganizePdfRoute() {
    return (
        <RouteSuspense label="Memuat pengatur PDF...">
            <PuspenOrganizePdfFilesPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/organize-pdf')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: PuspenOrganizePdfRoute,
})