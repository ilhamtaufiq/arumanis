import { createFileRoute } from '@tanstack/react-router'
import KegiatanRoleList from '@/features/kegiatan-role/components/KegiatanRoleList'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/kegiatan-role/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: KegiatanRoleList,
})