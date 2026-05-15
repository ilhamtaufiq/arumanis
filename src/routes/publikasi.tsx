import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PublikasiLayout } from '@/features/publikasi/components/PublikasiLayout'
import { z } from 'zod'

const publikasiSearchSchema = z.object({
  category: z.string().optional(),
})

export const Route = createFileRoute('/publikasi')({
  validateSearch: (search) => publikasiSearchSchema.parse(search),
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <PublikasiLayout>
      <Outlet />
    </PublikasiLayout>
  )
}
