import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import RkaPage from '@/features/rka/components/RkaPage'

export const Route = createFileRoute('/_authenticated/rka/')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
      <RkaPage />
    </ProtectedRoute>
  ),
})
