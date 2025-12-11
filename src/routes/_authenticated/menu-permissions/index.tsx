import { createFileRoute } from '@tanstack/react-router'
import MenuPermissionList from '@/features/menu-permissions/components/MenuPermissionList'

export const Route = createFileRoute('/_authenticated/menu-permissions/')({
  component: MenuPermissionList,
})
