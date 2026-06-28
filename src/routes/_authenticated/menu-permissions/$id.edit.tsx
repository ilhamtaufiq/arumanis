import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/menu-permissions/$id/edit')({
  beforeLoad: () => {
    requireAdmin()
    throw redirect({ to: '/menu-permissions' })
  },
})