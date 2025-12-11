import { createFileRoute } from '@tanstack/react-router'
import KontrakList from '@/features/kontrak/components/KontrakList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kontrak/')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak" requiredMethod="GET">
      <KontrakList />
    </ProtectedRoute>
  ),
})
