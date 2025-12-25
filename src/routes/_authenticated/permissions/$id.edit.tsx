import { createFileRoute, redirect } from '@tanstack/react-router'
import PermissionForm from '@/features/permissions/components/PermissionForm'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/permissions/$id/edit')({
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
  component: PermissionForm,
})
