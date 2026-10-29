import { createFileRoute } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import NphdPage from '@/features/pekerjaan/components/NphdPage'
import { getPekerjaanById } from '@/features/pekerjaan/api/pekerjaan'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/$id/nphd')({
  loader: async ({ params, context }) => {
    const id = params.id
    if (!id) return
    // Sama seperti halaman detail: data pekerjaan sudah siap di cache sebelum halaman tampil.
    const queryClient = (context as { queryClient: QueryClient }).queryClient
    await queryClient.prefetchQuery({
      queryKey: ['pekerjaan', id],
      queryFn: async () => (await getPekerjaanById(Number(id))).data,
    })
  },
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
      <NphdPage />
    </ProtectedRoute>
  ),
})
