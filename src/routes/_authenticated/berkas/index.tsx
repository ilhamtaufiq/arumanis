import { createFileRoute } from '@tanstack/react-router'
import BerkasList from '@/features/berkas/components/BerkasList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/berkas/')({
  component: () => (
    <ProtectedRoute requiredPath="/berkas" requiredMethod="GET">
      <BerkasList />
    </ProtectedRoute>
  ),
})
