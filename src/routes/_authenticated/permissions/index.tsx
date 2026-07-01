import { createFileRoute } from '@tanstack/react-router'
import PermissionList from '@/features/permissions/components/PermissionList'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/permissions/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: () => (
    <div className="p-6">
      <PermissionList />
    </div>
  ),
})