import { createFileRoute } from '@tanstack/react-router'
import PermissionForm from '@/features/permissions/components/PermissionForm'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/permissions/new')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: PermissionForm,
})