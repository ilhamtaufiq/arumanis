import { createFileRoute } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import PekerjaanDetail from '@/features/pekerjaan/components/PekerjaanDetail'
import { getPekerjaanById } from '@/features/pekerjaan/api/pekerjaan'
import { ProtectedRoute } from '@/components/ProtectedRoute'

type PekerjaanDetailSearch = {
  tab?: 'kontrak' | 'output' | 'penerima' | 'foto' | 'berkas' | 'progress' | 'simulasi'
  from?: 'rekap'
}

export const Route = createFileRoute('/_authenticated/pekerjaan/$id/')({
  validateSearch: (search: Record<string, unknown>): PekerjaanDetailSearch => ({
    tab: ['kontrak', 'output', 'penerima', 'foto', 'berkas', 'progress', 'simulasi'].includes(String(search.tab))
      ? search.tab as PekerjaanDetailSearch['tab']
      : undefined,
    from: search.from === 'rekap' ? 'rekap' : undefined,
  }),
  // Prefetch on link hover/focus (defaultPreload: 'intent') so the detail data is
  // already in the query cache when the page mounts — no skeleton wait.
  loader: async ({ params, context }) => {
    const id = params.id
    if (!id) return
    // ponytail: router context type doesn't propagate to loaders in this setup
    // (Register augmentation not picked up), so read queryClient at runtime.
    // Fix globally by making Register.routerContext flow, then drop the cast.
    const queryClient = (context as { queryClient: QueryClient }).queryClient
    await queryClient.prefetchQuery({
      queryKey: ['pekerjaan', id],
      queryFn: async () => (await getPekerjaanById(Number(id))).data,
    })
  },
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
      <PekerjaanDetail />
    </ProtectedRoute>
  ),
})
