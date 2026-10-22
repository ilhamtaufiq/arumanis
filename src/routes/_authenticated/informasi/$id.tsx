import { createFileRoute } from '@tanstack/react-router'
import { InformasiDetailPage } from '@/features/informasi/components/InformasiDetailPage'

export const Route = createFileRoute('/_authenticated/informasi/$id')({
  component: InformasiDetailRoute,
})

function InformasiDetailRoute() {
  const { id } = Route.useParams()
  return <InformasiDetailPage id={Number(id)} />
}
