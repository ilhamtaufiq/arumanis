import { createFileRoute } from '@tanstack/react-router'
import MenuPermissionList from '@/features/menu-permissions/components/MenuPermissionList'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/menu-permissions/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: MenuPermissionList,
})