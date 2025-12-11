import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/features/settings/components/SettingsPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: () => (
    <ProtectedRoute requiredPath="/settings" requiredMethod="GET">
      <SettingsPage />
    </ProtectedRoute>
  ),
})
