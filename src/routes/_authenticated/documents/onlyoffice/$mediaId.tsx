import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { z } from 'zod'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const OnlyOfficeViewerPage = lazy(() =>
    lazyImport(
        () => import('@/features/documents/components/OnlyOfficeViewerPage'),
        'onlyoffice-viewer-page',
    ),
)

const onlyOfficeViewerSearchSchema = z.object({
    title: z.string().optional(),
    mode: z.enum(['view', 'edit']).optional(),
})

function OnlyOfficeViewerRoute() {
    return (
        <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
            <RouteSuspense label="Memuat dokumen...">
                <OnlyOfficeViewerPage />
            </RouteSuspense>
        </ProtectedRoute>
    )
}

export const Route = createFileRoute('/_authenticated/documents/onlyoffice/$mediaId')({
    validateSearch: onlyOfficeViewerSearchSchema,
    component: OnlyOfficeViewerRoute,
})