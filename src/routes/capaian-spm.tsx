import { createFileRoute } from '@tanstack/react-router'
import { SpmDetailPage } from '@/features/public/components/spm-detail/SpmDetailPage'
import { parseSpmSector } from '@/features/public/lib/spm-sector'

export const Route = createFileRoute('/capaian-spm')({
    validateSearch: (search: Record<string, unknown>) => ({
        sector: parseSpmSector(search.sector),
    }),
    component: CapaianSpmRoute,
})

function CapaianSpmRoute() {
    const { sector } = Route.useSearch()
    return <SpmDetailPage sector={parseSpmSector(sector)} />
}