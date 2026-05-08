import { createFileRoute, redirect } from '@tanstack/react-router'
import RoleList from '@/features/roles/components/RoleList'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/roles/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const isAdmin = auth?.user?.roles?.includes('admin') || false

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <div className="p-6">
      <RoleList />
    </div>
  ),
})
