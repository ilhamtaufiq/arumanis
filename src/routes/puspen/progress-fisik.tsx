import { createFileRoute } from '@tanstack/react-router'
import { PuspenProgressFisikPage } from '@/features/puspen/components/PuspenProgressFisikPage'

export const Route = createFileRoute('/puspen/progress-fisik')({
    component: PuspenProgressFisikRoute,
})

function PuspenProgressFisikRoute() {
    return <PuspenProgressFisikPage />
}
