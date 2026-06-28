import { createFileRoute } from '@tanstack/react-router'
import { SpmDetailPage } from '@/features/public/components/spm-detail/SpmDetailPage'
import { parseSpmSector } from '@/features/public/lib/spm-sector'
import { parseSpmTahun } from '@/features/public/lib/spm-year'

export const Route = createFileRoute('/capaian-spm')({
    validateSearch: (search: Record<string, unknown>) => ({
        sector: parseSpmSector(search.sector),
        tahun: parseSpmTahun(search.tahun),
    }),
    component: CapaianSpmRoute,
})

function CapaianSpmRoute() {
    const { sector, tahun } = Route.useSearch()
    return <SpmDetailPage sector={parseSpmSector(sector)} tahun={tahun} />
}