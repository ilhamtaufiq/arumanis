import { createFileRoute } from '@tanstack/react-router'
import KegiatanRoleForm from '@/features/kegiatan-role/components/KegiatanRoleForm'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/kegiatan-role/new')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: KegiatanRoleForm,
})