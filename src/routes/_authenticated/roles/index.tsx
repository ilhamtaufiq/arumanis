import { createFileRoute } from '@tanstack/react-router'
import RoleList from '@/features/roles/components/RoleList'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/roles/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: () => (
    <div className="p-6">
      <RoleList />
    </div>
  ),
})