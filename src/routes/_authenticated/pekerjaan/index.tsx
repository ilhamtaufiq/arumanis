import { createFileRoute } from '@tanstack/react-router'
import PekerjaanList from '@/features/pekerjaan/components/PekerjaanList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/pekerjaan/')({
  component: () => (
    <ProtectedRoute requiredPath="/pekerjaan" requiredMethod="GET">
      <PekerjaanList />
    </ProtectedRoute>
  ),
})
