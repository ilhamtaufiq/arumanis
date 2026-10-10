import { useMemo, useState, type ReactNode } from 'react'
import {
    Award,
    CalendarRange,
    CheckCircle2,
    CircleAlert,
    FileSpreadsheet,
    Grid3x3,
    Loader2,
    Map as MapIcon,
    MapPin,
    TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
    aggregateByKecamatan,
    buildDesaRows,
    buildProjection,
    getLatestIncrease,
    getPeakYear,
    sortWilayahRows,
    type SpmRekapDesaInput,
    type SpmRekapWilayahRow,
    type SpmYearlyRow,
} from '@/lib/spm-rekap'
import { exportRekapExcel } from '@/lib/spm-rekap-excel'
import { SpmRekapMatrix } from './SpmRekapMatrix'
import { SpmRekapProyeksi } from './SpmRekapProyeksi'
import { useTargetSetting } from './use-target-setting'
import { SpmRekapWilayah } from './SpmRekapWilayah'
import { SpmRekapYearly } from './SpmRekapYearly'
import { formatNumber, formatPercent } from './format'

type RekapTab = 'tahun' | 'kecamatan' | 'desa' | 'matriks'

export type SpmRekapCapaianProps = {
    title: string
    description?: ReactNode
    /** Keterangan cakupan filter untuk ekspor, mis. "Kec. Cipanas · Tahun 2025" */
    scopeLabel?: string
    /** Label capaian, mis. "KK Terlayani" / "KK Pemanfaat" */
    capaianLabel: string
    showSr?: boolean
    showBjp?: boolean
    desaInputs: SpmRekapDesaInput[]
    isDesaLoading?: boolean
    yearlyRows: SpmYearlyRow[]
    isYearlyLoading?: boolean
    highlightTahun?: string
    yearlyNote?: string
    yearlyBaseline?: number
    yearlyBaselineLabel?: string
    /** Target KK wilayah (basis cakupan) — mengaktifkan panel target vs realisasi */
    targetKk?: number
    /** Kunci penyimpanan pengaturan target, mis. "spm-air-minum" */
    targetStorageKey?: string
    wilayahNote?: string
    exportFilename: string
    onDesaSelect?: (row: SpmRekapWilayahRow) => void
    /** Matriks peningkatan wilayah × tahun (dimuat saat tab dibuka) */
    matrix?: {
        years: readonly string[]
        byYear: readonly (SpmRekapDesaInput[] | undefined)[]
        isLoading?: boolean
        onOpen: () => void
    }
}

function Highlight({
    icon: Icon,
    tone,
    label,
    value,
    sub,
}: {
    icon: typeof TrendingUp
    tone: string
    label: string
    value: ReactNode
    sub?: ReactNode
}) {
    return (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <div className={cn('rounded-md p-2', tone)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <div className="truncate text-base font-bold tabular-nums">{value}</div>
                {sub ? <div className="truncate text-[11px] text-muted-foreground">{sub}</div> : null}
            </div>
        </div>
    )
}

export function SpmRekapCapaian({
    title,
    description,
    scopeLabel = 'Seluruh wilayah',
    capaianLabel,
    showSr,
    showBjp,
    desaInputs,
    isDesaLoading,
    yearlyRows,
    isYearlyLoading,
    highlightTahun,
    yearlyNote,
    yearlyBaseline,
    yearlyBaselineLabel,
    targetKk,
    targetStorageKey = 'spm-rekap',
    wilayahNote,
    exportFilename,
    onDesaSelect,
    matrix,
}: SpmRekapCapaianProps) {
    const [tab, setTab] = useState<RekapTab>('tahun')
    const [kecamatanDrill, setKecamatanDrill] = useState('')

    const desaRows = useMemo(() => buildDesaRows(desaInputs), [desaInputs])
    const kecamatanRows = useMemo(() => aggregateByKecamatan(desaInputs), [desaInputs])

    const [targetSetting, setTargetSetting] = useTargetSetting(`spm-rekap-target:${targetStorageKey}`)
    const projection = useMemo(
        () => (targetKk != null ? buildProjection(yearlyRows, targetKk, targetSetting) : null),
        [yearlyRows, targetKk, targetSetting],
    )

    const latest = useMemo(() => getLatestIncrease(yearlyRows), [yearlyRows])
    const peak = useMemo(() => getPeakYear(yearlyRows), [yearlyRows])

    const desaTuntas = desaRows.filter((row) => row.coverage != null && row.coverage >= 100).length
    const desaBelum = desaRows.filter((row) => row.capaian <= 0).length

    const kecRanked = useMemo(
        () => sortWilayahRows(kecamatanRows.filter((row) => row.coverage != null), 'coverage', 'desc'),
        [kecamatanRows],
    )
    const kecTop = kecRanked[0]
    const kecBottom = kecRanked.length > 1 ? kecRanked[kecRanked.length - 1] : undefined

    const [exporting, setExporting] = useState(false)
    const handleExportExcel = async () => {
        setExporting(true)
        try {
            await exportRekapExcel(
                {
                    title,
                    scopeLabel,
                    capaianLabel,
                    showSr,
                    showBjp,
                    desaInputs,
                    yearlyRows,
                    yearlyBaseline,
                    yearlyBaselineLabel,
                    projection,
                    matrix: matrix ? { years: matrix.years, byYear: matrix.byYear } : undefined,
                },
                exportFilename,
            )
        } catch {
            toast.error('Gagal membuat file Excel rekap.')
        } finally {
            setExporting(false)
        }
    }
    const matrixLoaded = matrix?.byYear.some(Boolean) ?? false

    const handleKecamatanSelect = (kecamatan: string) => {
        setKecamatanDrill(kecamatan)
        setTab('desa')
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarRange className="h-4 w-4 text-sky-600" />
                            {title}
                        </CardTitle>
                        {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0 text-xs"
                        onClick={() => void handleExportExcel()}
                        disabled={exporting || isDesaLoading || isYearlyLoading}
                        title={
                            matrix && !matrixLoaded
                                ? 'Buka tab Matriks Peningkatan terlebih dahulu agar matriks ikut diekspor'
                                : undefined
                        }
                    >
                        {exporting ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                        )}
                        Unduh Excel
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Highlight
                        icon={TrendingUp}
                        tone="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                        label={latest ? `Peningkatan ${latest.tahun}` : 'Peningkatan terakhir'}
                        value={latest ? `+${formatNumber(latest.capaian)} KK` : '—'}
                        sub={
                            latest?.coverageGain != null
                                ? `+${formatPercent(latest.coverageGain, 2)} poin cakupan`
                                : 'Belum ada tambahan capaian'
                        }
                    />
                    <Highlight
                        icon={Award}
                        tone="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                        label="Tahun tertinggi"
                        value={peak ? peak.tahun : '—'}
                        sub={peak ? `+${formatNumber(peak.capaian)} KK dalam setahun` : undefined}
                    />
                    <Highlight
                        icon={CheckCircle2}
                        tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        label="Desa tuntas (≥ 100%)"
                        value={isDesaLoading ? '…' : `${formatNumber(desaTuntas)} desa`}
                        sub={isDesaLoading ? undefined : `dari ${formatNumber(desaRows.length)} desa`}
                    />
                    <Highlight
                        icon={CircleAlert}
                        tone="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        label="Desa belum ada capaian"
                        value={isDesaLoading ? '…' : `${formatNumber(desaBelum)} desa`}
                        sub="Prioritas intervensi"
                    />
                    <Highlight
                        icon={MapIcon}
                        tone="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        label="Kecamatan tertinggi"
                        value={kecTop ? kecTop.nama : '—'}
                        sub={
                            kecTop
                                ? `${formatPercent(kecTop.coverage)}${
                                      kecBottom ? ` · terendah ${kecBottom.nama} ${formatPercent(kecBottom.coverage)}` : ''
                                  }`
                                : undefined
                        }
                    />
                </div>

                <Tabs
                    value={tab}
                    onValueChange={(v) => {
                        if (v === 'matriks') matrix?.onOpen()
                        setTab(v as RekapTab)
                    }}
                    className="space-y-4"
                >
                    <TabsList className="h-auto flex-wrap">
                        <TabsTrigger value="tahun" className="gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Per Tahun & Peningkatan
                        </TabsTrigger>
                        <TabsTrigger value="kecamatan" className="gap-1.5">
                            <MapIcon className="h-3.5 w-3.5" />
                            Per Kecamatan
                            <span className="text-muted-foreground">({kecamatanRows.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="desa" className="gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Per Desa
                            <span className="text-muted-foreground">({desaRows.length})</span>
                        </TabsTrigger>
                        {matrix ? (
                            <TabsTrigger value="matriks" className="gap-1.5">
                                <Grid3x3 className="h-3.5 w-3.5" />
                                Matriks Peningkatan
                            </TabsTrigger>
                        ) : null}
                    </TabsList>

                    <TabsContent value="tahun">
                        <SpmRekapYearly
                            rows={yearlyRows}
                            isLoading={isYearlyLoading}
                            capaianLabel={capaianLabel}
                            showSr={showSr}
                            highlightTahun={highlightTahun}
                            note={yearlyNote}
                            baseline={yearlyBaseline}
                            baselineLabel={yearlyBaselineLabel}
                            projectionPoints={projection?.points}
                            header={
                                targetKk != null ? (
                                    <SpmRekapProyeksi
                                        projection={projection}
                                        setting={targetSetting}
                                        onSettingChange={setTargetSetting}
                                        capaianLabel={capaianLabel}
                                    />
                                ) : undefined
                            }
                        />
                    </TabsContent>

                    <TabsContent value="kecamatan" className="space-y-2">
                        <SpmRekapWilayah
                            mode="kecamatan"
                            rows={kecamatanRows}
                            isLoading={isDesaLoading}
                            capaianLabel={capaianLabel}
                            showSr={showSr}
                            showBjp={showBjp}
                            onKecamatanSelect={handleKecamatanSelect}
                            exportFilename={exportFilename}
                        />
                        {wilayahNote ? <p className="text-[11px] text-muted-foreground">{wilayahNote}</p> : null}
                    </TabsContent>

                    <TabsContent value="desa" className="space-y-2">
                        <SpmRekapWilayah
                            mode="desa"
                            rows={desaRows}
                            isLoading={isDesaLoading}
                            capaianLabel={capaianLabel}
                            showSr={showSr}
                            showBjp={showBjp}
                            kecamatanFilter={kecamatanDrill}
                            onClearKecamatanFilter={() => setKecamatanDrill('')}
                            onDesaSelect={onDesaSelect}
                            exportFilename={exportFilename}
                        />
                        {wilayahNote ? <p className="text-[11px] text-muted-foreground">{wilayahNote}</p> : null}
                    </TabsContent>

                    {matrix ? (
                        <TabsContent value="matriks">
                            <SpmRekapMatrix
                                years={matrix.years}
                                byYear={matrix.byYear}
                                isLoading={matrix.isLoading}
                                capaianLabel={capaianLabel}
                                exportFilename={exportFilename}
                            />
                        </TabsContent>
                    ) : null}
                </Tabs>
            </CardContent>
        </Card>
    )
}
