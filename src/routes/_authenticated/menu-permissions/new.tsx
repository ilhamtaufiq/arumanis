import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/menu-permissions/new')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const userRoles = auth?.user?.roles || []
    const isAdmin = userRoles.some((role: any) =>
      (typeof role === 'string' ? role : role.name) === 'admin'
    )

    if (!isAdmin) {
      throw redirect({ to: '/dashboard' })
    }

    throw redirect({ to: '/menu-permissions' })
  },
})
