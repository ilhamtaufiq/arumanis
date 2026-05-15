import { createFileRoute } from '@tanstack/react-router'
import { PublikasiList } from '@/features/publikasi/components/PublikasiList'

export const Route = createFileRoute('/publikasi/')({
  component: PublikasiList,
})
