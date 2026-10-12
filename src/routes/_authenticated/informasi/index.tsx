import { createFileRoute } from '@tanstack/react-router'
import InformasiPage from '@/features/informasi/components/InformasiPage'

export const Route = createFileRoute('/_authenticated/informasi/')({
  component: InformasiPage,
})
