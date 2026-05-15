import { createFileRoute } from '@tanstack/react-router'
import { PublikasiManagement } from '@/features/publikasi/components/PublikasiManagement'

export const Route = createFileRoute('/_authenticated/manajemen-publikasi/')({
  component: PublikasiManagement,
})
