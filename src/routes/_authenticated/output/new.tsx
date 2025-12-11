import { createFileRoute } from '@tanstack/react-router'
import OutputForm from '@/features/output/components/OutputForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/output/new')({
  component: () => (
    <ProtectedRoute requiredPath="/output/new" requiredMethod="GET">
      <OutputForm />
    </ProtectedRoute>
  ),
})
