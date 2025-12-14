import { createFileRoute, redirect } from '@tanstack/react-router'
import KegiatanRoleForm from '@/features/kegiatan-role/components/KegiatanRoleForm'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/kegiatan-role/$id/edit')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const userRoles = auth?.user?.roles || []
    const isAdmin = userRoles.some((r: any) =>
      (typeof r === 'string' ? r : r.name) === 'admin'
    )

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: KegiatanRoleForm,
})
