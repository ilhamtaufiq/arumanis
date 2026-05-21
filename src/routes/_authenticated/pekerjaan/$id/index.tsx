import { createFileRoute } from '@tanstack/react-router'
import PekerjaanDetail from '@/features/pekerjaan/components/PekerjaanDetail'
import { ProtectedRoute } from '@/components/ProtectedRoute'

type PekerjaanDetailSearch = {
  tab?: 'kontrak' | 'output' | 'penerima' | 'foto' | 'berkas' | 'progress'
}

export const Route = createFileRoute('/_authenticated/pekerjaan/$id/')({
  validateSearch: (search: Record<string, unknown>): PekerjaanDetailSearch => ({
    tab: ['kontrak', 'output', 'penerima', 'foto', 'berkas', 'progress'].includes(String(search.tab))
      ? search.tab as PekerjaanDetailSearch['tab']
      : undefined,
  }),
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
      <PekerjaanDetail />
    </ProtectedRoute>
  ),
})
