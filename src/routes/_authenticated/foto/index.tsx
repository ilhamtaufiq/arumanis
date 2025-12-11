import { createFileRoute } from '@tanstack/react-router'
import FotoList from '@/features/foto/components/FotoList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/foto/')({
  component: () => (
    <ProtectedRoute requiredPath="/foto" requiredMethod="GET">
      <FotoList />
    </ProtectedRoute>
  ),
})
