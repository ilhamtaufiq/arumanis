import { createFileRoute, redirect } from '@tanstack/react-router'
import KegiatanRoleList from '@/features/kegiatan-role/components/KegiatanRoleList'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/_authenticated/kegiatan-role/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const isAdmin = auth?.user?.roles?.includes('admin') || false

    if (!isAdmin) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <div className="p-6">
      <KegiatanRoleList />
    </div>
  ),
})
