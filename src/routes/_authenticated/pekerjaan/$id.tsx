import { createFileRoute } from '@tanstack/react-router'
import PekerjaanDetail from '@/features/pekerjaan/components/PekerjaanDetail'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/$id')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan/:id" requiredMethod="GET">
      <PekerjaanDetail />
    </ProtectedRoute>
  ),
})
