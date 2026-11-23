import { createFileRoute, useParams } from '@tanstack/react-router'
import { ProyekDetailScreen } from '@/features/mobile/screens/ProyekDetailScreen'

export const Route = createFileRoute('/m/proyek/$id')({
    component: DetailRoute,
})

function DetailRoute() {
    const { id } = useParams({ from: '/m/proyek/$id' })
    return <ProyekDetailScreen id={Number(id)} />
}
