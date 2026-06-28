import { createFileRoute, redirect } from '@tanstack/react-router'
import { SpmDetailPage } from '@/features/public/components/spm-detail/SpmDetailPage'
import { parseSpmSector } from '@/features/public/lib/spm-sector'
import { parseSpmTahun } from '@/features/public/lib/spm-year'
import { getAppSettings, isSpmDetailPageActive } from '@/features/settings/api'

export const Route = createFileRoute('/capaian-spm')({
    validateSearch: (search: Record<string, unknown>) => ({
        sector: parseSpmSector(search.sector),
        tahun: parseSpmTahun(search.tahun),
    }),
    beforeLoad: async () => {
        let settings = null
        try {
            settings = await getAppSettings()
        } catch {
            return
        }

        if (settings && !isSpmDetailPageActive(settings.data)) {
            throw redirect({ to: '/' })
        }
    },
    component: CapaianSpmRoute,
})

function CapaianSpmRoute() {
    const { sector, tahun } = Route.useSearch()
    return <SpmDetailPage sector={parseSpmSector(sector)} tahun={tahun} />
}