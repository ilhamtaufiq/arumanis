import { createFileRoute } from '@tanstack/react-router'
import KegiatanRoleForm from '@/features/kegiatan-role/components/KegiatanRoleForm'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/kegiatan-role/new')({
  component: () => (
    <ProtectedRoute requiredPath="/kegiatan-role/new" requiredMethod="GET">
      <KegiatanRoleForm />
    </ProtectedRoute>
  ),
})
