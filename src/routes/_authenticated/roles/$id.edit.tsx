import { createFileRoute, redirect } from '@tanstack/react-router'
import RoleForm from '@/features/roles/components/RoleForm'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/roles/$id/edit')({
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
  component: RoleForm,
})
