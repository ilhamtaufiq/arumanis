import { createFileRoute } from '@tanstack/react-router'
import { InformasiEditPage } from '@/features/informasi/components/InformasiEditorPage'

export const Route = createFileRoute('/_authenticated/informasi/$id/edit')({
  component: InformasiEditRoute,
})

function InformasiEditRoute() {
  const { id } = Route.useParams()
  return <InformasiEditPage id={Number(id)} />
}
