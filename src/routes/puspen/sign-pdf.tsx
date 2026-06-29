import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { requireAuthenticatedSession } from '@/lib/route-auth'

const PuspenPage = lazy(() =>
    lazyImport(() => import('@/features/puspen').then((m) => ({ default: m.PuspenPage })), 'puspen-sign-pdf'),
)

function PuspenSignPdfRoute() {
    return (
        <RouteSuspense label="Memuat penandatangan PDF...">
            <PuspenPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/puspen/sign-pdf')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: PuspenSignPdfRoute,
})