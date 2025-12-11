import { createFileRoute } from '@tanstack/react-router'
import OutputForm from '@/features/output/components/OutputForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/output/$id/edit')({
  component: () => (
    <ProtectedRoute requiredPath="/output/:id/edit" requiredMethod="GET">
      <OutputForm />
    </ProtectedRoute>
  ),
})
