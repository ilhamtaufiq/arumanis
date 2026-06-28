import { Banknote, HardHat, TrendingDown, TrendingUp } from 'lucide-react'
import type { PuspenProgressFisikSnapshot } from '@/features/pekerjaan/api/progress-estimasi'
import type { ProgressEstimasiReviewSummary } from '../../lib/pekerjaan-review-utils'
import { PuspenBadge, PuspenChip } from '../PuspenUi'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

function formatPercent(value: number | null | undefined) {
    if (value === null || value === undefined) return '-'
    return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)}%`
}

function formatTimestamp(value: string | null) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function EstimasiSectionCard({
    title,
    icon: Icon,
    accent,
    section,
}: {
    title: string
    icon: typeof HardHat
    accent: string
    section: ProgressEstimasiReviewSummary['fisik']
}) {
    const deviasi = section.deviasi
    const deviasiTone = deviasi === null
        ? 'paper'
        : deviasi < 0
            ? 'danger'
            : deviasi > 0
                ? 'success'
                : 'crt'

    return (
        <div className={`bg-white p-4 ${puspenBorder} ${puspenShadowMd}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 ${accent} ${puspenBorder}`}>
                        <Icon className="h-4 w-4 text-[#111111]" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]">{title}</h3>
                </div>
                <PuspenBadge tone="crt">{section.entryCount} entri</PuspenBadge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className={`bg-[#8ECAE6]/35 p-3 ${puspenBorder}`}>
                    <div className={`${puspenLabel} text-[#111111]/55`}>Rencana</div>
                    <div className="mt-1 text-2xl font-black text-[#111111]">{formatPercent(section.latestRencana)}</div>
                </div>
                <div className={`${accent} p-3 ${puspenBorder}`}>
                    <div className={`${puspenLabel} text-[#111111]/70`}>Realisasi</div>
                    <div className="mt-1 text-2xl font-black text-[#111111]">{formatPercent(section.latestRealisasi)}</div>
                </div>
                <div className={`bg-[#FFF7E8] p-3 ${puspenBorder}`}>
                    <div className={`${puspenLabel} text-[#111111]/55`}>Deviasi</div>
                    <div className="mt-1 flex items-center gap-2">
                        {deviasi !== null && deviasi < 0 ? (
                            <TrendingDown className="h-4 w-4 text-[#EF233C]" />
                        ) : deviasi !== null && deviasi > 0 ? (
                            <TrendingUp className="h-4 w-4 text-[#2ECC71]" />
                        ) : null}
                        <span className="text-2xl font-black text-[#111111]">{formatPercent(deviasi)}</span>
                        {deviasi !== null ? <PuspenBadge tone={deviasiTone}>{deviasi < 0 ? 'Tertinggal' : deviasi > 0 ? 'Unggul' : 'Sesuai'}</PuspenBadge> : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

type ReviewProgressEstimasiPanelProps = {
    tahun: number
    estimasi: ProgressEstimasiReviewSummary
    progressItemWeighted: number | null
    puspenSnapshots?: PuspenProgressFisikSnapshot[]
}

export function ReviewProgressEstimasiPanel({
    tahun,
    estimasi,
    progressItemWeighted,
    puspenSnapshots = [],
}: ReviewProgressEstimasiPanelProps) {
    const updatedLabel = formatTimestamp(estimasi.updatedAt)

    return (
        <section className={`bg-[#FFF7E8] p-4 sm:p-5 ${puspenBorder} ${puspenShadowMd}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div className={`${puspenLabel} text-[#111111]/60`}>Tab Progress Pekerjaan</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]">
                        Estimasi Progress
                    </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <PuspenChip>Tahun {tahun}</PuspenChip>
                    {updatedLabel ? (
                        <span className="text-xs font-bold text-[#111111]/60">Diperbarui {updatedLabel}</span>
                    ) : null}
                </div>
            </div>

            {!estimasi.hasInput ? (
                <p className="mb-4 text-sm font-bold text-[#111111]/65">
                    Belum ada input estimasi progress di tab Progress. Isi rencana dan realisasi fisik/keuangan untuk analisa deviasi.
                </p>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
                <EstimasiSectionCard
                    title="Progress Fisik"
                    icon={HardHat}
                    accent="bg-[#FFB703]/40"
                    section={estimasi.fisik}
                />
                <EstimasiSectionCard
                    title="Progress Keuangan"
                    icon={Banknote}
                    accent="bg-[#2ECC71]/25"
                    section={estimasi.keuangan}
                />
            </div>

            {progressItemWeighted !== null ? (
                <p className="mt-4 text-xs font-bold text-[#111111]/60">
                    Progress terukur dari laporan item mingguan: {formatPercent(progressItemWeighted)}
                    {' '}(bobot RAB, berbeda dari estimasi persen tab Progress).
                </p>
            ) : null}

            {puspenSnapshots.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {puspenSnapshots.map((item) => (
                        <PuspenBadge key={item.kontrak_id} tone="paper">
                            {item.kode_paket || `Kontrak #${item.kontrak_id}`}: R {formatPercent(item.rencana)} / A {formatPercent(item.realisasi)}
                        </PuspenBadge>
                    ))}
                </div>
            ) : null}
        </section>
    )
}