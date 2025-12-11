import { createFileRoute } from '@tanstack/react-router'
import KegiatanRoleList from '@/features/kegiatan-role/components/KegiatanRoleList'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kegiatan-role/')({
  component: () => (
    <ProtectedRoute requiredPath="/kegiatan-role" requiredMethod="GET">
      <KegiatanRoleList />
    </ProtectedRoute>
  ),
})
