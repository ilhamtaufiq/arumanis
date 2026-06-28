import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/kegiatan-role/$id/edit')({
  beforeLoad: () => {
    requireAdmin()
    throw redirect({ to: '/kegiatan-role' })
  },
})