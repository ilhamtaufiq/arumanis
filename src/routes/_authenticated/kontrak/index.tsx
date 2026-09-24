import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const KontrakList = lazy(() =>
    lazyImport(() => import('@/features/kontrak/components/KontrakList'), 'kontrak'),
)

export const Route = createFileRoute('/_authenticated/kontrak/')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
      <RouteSuspense label="Memuat Kontrak...">
        <KontrakList />
      </RouteSuspense>
    </ProtectedRoute>
  ),
})
