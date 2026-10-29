import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const PengaturanNomorSuratPage = lazy(() =>
    lazyImport(() => import('@/features/pekerjaan/components/PengaturanNomorSuratPage'), 'pengaturan-nomor-surat'),
)

export const Route = createFileRoute('/_authenticated/pengaturan-nomor-surat')({
    component: () => (
        <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
            <RouteSuspense label="Memuat Pengaturan Nomor Surat...">
                <PengaturanNomorSuratPage />
            </RouteSuspense>
        </ProtectedRoute>
    ),
})
