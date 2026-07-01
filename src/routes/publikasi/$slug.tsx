import { createFileRoute } from '@tanstack/react-router'
import { PublikasiDetail } from '@/features/publikasi/components/PublikasiDetail'

export const Route = createFileRoute('/publikasi/$slug')({
    component: PublikasiDetailPage,
})

function PublikasiDetailPage() {
    const { slug } = Route.useParams()
    return <PublikasiDetail slug={slug} />
}