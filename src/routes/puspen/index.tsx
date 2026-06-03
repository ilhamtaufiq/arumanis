import { createFileRoute } from '@tanstack/react-router'
import { PuspenHomePage } from '@/features/puspen'

export const Route = createFileRoute('/puspen/')({
    component: PuspenIndexRoute,
})

function PuspenIndexRoute() {
    return <PuspenHomePage />
}
