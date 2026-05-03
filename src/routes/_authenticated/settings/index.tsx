import { createFileRoute, redirect } from '@tanstack/react-router'
import SettingsPage from '@/features/settings/components/SettingsPage'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/settings/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const isAdmin = auth?.user?.roles?.includes('admin') || false

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: SettingsPage,
})
