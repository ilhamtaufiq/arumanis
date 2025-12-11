import { createFileRoute } from '@tanstack/react-router'
import DesaList from '@/features/desa/components/DesaList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/desa/')({
  component: () => (
    <ProtectedRoute requiredPath="/desa" requiredMethod="GET">
      <DesaList />
    </ProtectedRoute>
  ),
})
