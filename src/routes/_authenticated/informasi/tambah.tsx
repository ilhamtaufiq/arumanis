import { createFileRoute } from '@tanstack/react-router'
import { InformasiEditorPage } from '@/features/informasi/components/InformasiEditorPage'

export const Route = createFileRoute('/_authenticated/informasi/tambah')({
  component: () => <InformasiEditorPage item={null} />,
})
