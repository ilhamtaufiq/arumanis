import { createFileRoute } from '@tanstack/react-router'
import OutputList from '@/features/output/components/OutputList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/output/')({
  component: () => (
    <ProtectedRoute requiredPath="/output" requiredMethod="GET">
      <OutputList />
    </ProtectedRoute>
  ),
})
