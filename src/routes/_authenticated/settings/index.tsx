import { createFileRoute, redirect } from '@tanstack/react-router'
import SettingsPage from '@/features/settings/components/SettingsPage'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/settings/')({
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
  component: SettingsPage,
})
