import { createFileRoute, redirect } from '@tanstack/react-router'
import UserList from '@/features/users/components/UserList'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const isAdmin = auth?.user?.roles?.includes('admin') || false

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <div className="p-6">
      <UserList />
    </div>
  ),
})
