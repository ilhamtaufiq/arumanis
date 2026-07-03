import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import KontrakAddendumDetail from '@/features/kontrak/components/KontrakAddendumDetail'

export const Route = createFileRoute('/_authenticated/kontrak-addendums/$id/')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
      <KontrakAddendumDetail />
    </ProtectedRoute>
  ),
})