import { createFileRoute } from '@tanstack/react-router'
import KecamatanList from '@/features/kecamatan/components/KecamatanList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kecamatan/')({
  component: () => (
    <ProtectedRoute requiredPath="/kecamatan" requiredMethod="GET">
      <KecamatanList />
    </ProtectedRoute>
  ),
})
