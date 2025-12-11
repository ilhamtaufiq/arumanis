import { createFileRoute } from '@tanstack/react-router'
import MenuPermissionForm from '@/features/menu-permissions/components/MenuPermissionForm'

export const Route = createFileRoute('/_authenticated/menu-permissions/new')({
  component: MenuPermissionForm,
})
