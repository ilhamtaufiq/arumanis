import { createFileRoute, useSearch } from '@tanstack/react-router'
import DesaList from '@/features/desa/components/DesaList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

type DesaSearch = { q?: string }

export const Route = createFileRoute('/_authenticated/desa/')({
  validateSearch: (search: Record<string, unknown>): DesaSearch => ({
    q: typeof search.q === 'string' && search.q.trim() !== '' ? search.q : undefined,
  }),
  component: DesaRoute,
})

function DesaRoute() {
  const { q } = useSearch({ from: '/_authenticated/desa/' })
  return (
    <ProtectedRoute requiredPath="/desa" requiredMethod="GET">
      <DesaList initialSearch={q ?? ''} />
    </ProtectedRoute>
  )
}
