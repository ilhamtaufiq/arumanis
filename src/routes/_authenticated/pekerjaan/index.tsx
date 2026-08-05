import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const PekerjaanList = lazy(() =>
    lazyImport(() => import('@/features/pekerjaan/components/PekerjaanList'), 'pekerjaan'),
)

export const Route = createFileRoute('/_authenticated/pekerjaan/')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
      <RouteSuspense label="Memuat Pekerjaan...">
        <PekerjaanList />
      </RouteSuspense>
    </ProtectedRoute>
  ),
})
