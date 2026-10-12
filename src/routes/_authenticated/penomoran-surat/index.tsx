import { createFileRoute } from '@tanstack/react-router'
import SuratPage from '@/features/surat/components/SuratPage'

export const Route = createFileRoute('/_authenticated/penomoran-surat/')({
  component: SuratPage,
})
