import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/features/settings/components/SettingsPage'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/settings/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: SettingsPage,
})
