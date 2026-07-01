import { createFileRoute } from '@tanstack/react-router'
import RoleForm from '@/features/roles/components/RoleForm'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/roles/$id/edit')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: RoleForm,
})