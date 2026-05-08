import { createFileRoute, redirect } from '@tanstack/react-router'
import PermissionList from '@/features/permissions/components/PermissionList'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/permissions/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const isAdmin = auth?.user?.roles?.includes('admin') || false

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <div className="p-6">
      <PermissionList />
    </div>
  ),
})
