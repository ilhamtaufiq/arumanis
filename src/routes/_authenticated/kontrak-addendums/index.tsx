import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import KontrakAddendumList from '@/features/kontrak/components/KontrakAddendumList'

export const Route = createFileRoute('/_authenticated/kontrak-addendums/')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
      <KontrakAddendumList />
    </ProtectedRoute>
  ),
})
