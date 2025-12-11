import { createFileRoute } from '@tanstack/react-router'
import ProgressFullscreen from '@/features/pekerjaan/components/ProgressFullscreen'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/$id/progress')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:id" requiredMethod="GET">
      <ProgressFullscreen />
    </ProtectedRoute>
  ),
})
