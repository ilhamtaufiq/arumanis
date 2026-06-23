import { createFileRoute } from '@tanstack/react-router'
import { PuspenPengawasKpiPage } from '@/features/puspen/components/PuspenPengawasKpiPage'

export const Route = createFileRoute('/puspen/pengawas-kpi')({
    component: PuspenPengawasKpiRoute,
})

function PuspenPengawasKpiRoute() {
    return <PuspenPengawasKpiPage />
}
