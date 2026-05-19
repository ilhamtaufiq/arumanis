import { createFileRoute } from '@tanstack/react-router'
import PekerjaanDetail from '@/features/pekerjaan/components/PekerjaanDetail'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/$id/')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:pekerjaan" requiredMethod="GET">
      <PekerjaanDetail />
    </ProtectedRoute>
  ),
})
