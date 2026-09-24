import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const RegisterDokumen = lazy(() =>
    lazyImport(() => import('@/features/pekerjaan/components/RegisterDokumen'), 'register-dokumen'),
)

export const Route = createFileRoute('/_authenticated/pekerjaan/register')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <RouteSuspense label="Memuat Register Dokumen...">
                <RegisterDokumen />
            </RouteSuspense>
        </ProtectedRoute>
    ),
})
