import { createFileRoute } from '@tanstack/react-router'
import FotoForm from '@/features/foto/components/FotoForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/foto/new')({
  component: () => (
    <ProtectedRoute requiredPath="/foto/new" requiredMethod="GET">
      <FotoForm />
    </ProtectedRoute>
  ),
})
