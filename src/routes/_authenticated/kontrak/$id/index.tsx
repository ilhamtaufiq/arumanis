import { createFileRoute } from '@tanstack/react-router'
import KontrakDetail from '@/features/kontrak/components/KontrakDetail'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kontrak/$id/')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
      <KontrakDetail />
    </ProtectedRoute>
  ),
})
