import { LegalCallout, LegalTable } from '../legal-page-layout'
import { buildCapaianTableRows, type InnovationMetrics } from '../lib/innovation-stats'

type InnovationCapaianTableProps = {
    metrics: InnovationMetrics | null
    isLoading: boolean
}

export function InnovationCapaianTable({ metrics, isLoading }: InnovationCapaianTableProps) {
    if (isLoading) {
        return <LegalCallout>Memuat ringkasan capaian terbaru…</LegalCallout>
    }

    if (!metrics) {
        return (
            <LegalCallout variant='important'>
                Data capaian tidak dapat dimuat. Pastikan API publik tersedia, lalu muat ulang halaman.
            </LegalCallout>
        )
    }

    return (
        <LegalTable headers={['Indikator', 'Nilai']} rows={buildCapaianTableRows(metrics)} />
    )
}