import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const ProgressRekap = lazy(() =>
  lazyImport(() => import('@/features/progress/components/ProgressRekap'), 'progress-rekap'),
)

export const Route = createFileRoute('/_authenticated/progress_rekap')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
      <RouteSuspense label="Memuat Rekap Progress...">
        <ProgressRekap />
      </RouteSuspense>
    </ProtectedRoute>
  ),
})
