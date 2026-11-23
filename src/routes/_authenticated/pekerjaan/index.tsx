import { createFileRoute, useSearch } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const PekerjaanList = lazy(() =>
    lazyImport(() => import('@/features/pekerjaan/components/PekerjaanList'), 'pekerjaan'),
)

type PekerjaanSearch = { q?: string }

export const Route = createFileRoute('/_authenticated/pekerjaan/')({
  validateSearch: (search: Record<string, unknown>): PekerjaanSearch => ({
    q: typeof search.q === 'string' && search.q.trim() !== '' ? search.q : undefined,
  }),
  component: PekerjaanRoute,
})

function PekerjaanRoute() {
  const { q } = useSearch({ from: '/_authenticated/pekerjaan/' })
  return (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
      <RouteSuspense label="Memuat Pekerjaan...">
        <PekerjaanList initialSearch={q ?? ''} />
      </RouteSuspense>
    </ProtectedRoute>
  )
}
