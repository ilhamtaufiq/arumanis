import { createFileRoute } from '@tanstack/react-router'
import KontrakForm from '@/features/kontrak/components/KontrakForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kontrak/new')({
  component: () => (
    <ProtectedRoute requiredPath="/kontrak/new" requiredMethod="GET">
      <KontrakForm />
    </ProtectedRoute>
  ),
})
