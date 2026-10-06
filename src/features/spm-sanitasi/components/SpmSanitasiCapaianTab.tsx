import { Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SpmRekapCapaian } from '@/components/common/spm-rekap'
import { useSpmSanitasiRekap } from '../hooks/useSpmSanitasiRekap'
import { SPM_TAHUN_OPTIONS } from '../lib/tahun-options'
import { SpmSanitasiCapaianPanel } from './SpmSanitasiCapaianPanel'

type KecamatanOption = { id: number; nama_kecamatan?: string; n_kec?: string }

interface SpmSanitasiCapaianTabProps {
    kecamatans: KecamatanOption[]
    kecamatanId?: number
    tahun?: string
    onKecChange: (kec: number | '') => void
    onTahunChange: (tahun: string) => void
}

export function SpmSanitasiCapaianTab({
    kecamatans,
    kecamatanId,
    tahun,
    onKecChange,
    onTahunChange,
}: SpmSanitasiCapaianTabProps) {
    const kec = kecamatanId ? kecamatans.find((k) => k.id === kecamatanId) : undefined
    const kecamatanName = kec?.nama_kecamatan || kec?.n_kec

    const rekap = useSpmSanitasiRekap({ kecamatanId, kecamatanName, tahun })
    const hasFilter = Boolean(kecamatanId || tahun)
    const scope = [tahun ? `Tahun konstruksi ${tahun}` : 'Semua tahun', kecamatanName ?? 'Seluruh kabupaten'].join(
        ' · ',
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Capaian SPM Sanitasi</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Pemanfaat (KK & jiwa) dibandingkan target KK desa — dari total, per tahun, per kecamatan
                                hingga per desa.
                            </p>
                            <Badge variant="secondary" className="text-[10px]">
                                {scope}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <Select
                                value={kecamatanId ? String(kecamatanId) : 'all'}
                                onValueChange={(v) => onKecChange(v === 'all' ? '' : Number(v))}
                            >
                                <SelectTrigger className="h-9 w-[200px] text-xs">
                                    <SelectValue placeholder="Semua Kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                                    {kecamatans.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>
                                            {k.nama_kecamatan || k.n_kec}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={tahun || 'all'} onValueChange={(v) => onTahunChange(v === 'all' ? '' : v)}>
                                <SelectTrigger className="h-9 w-[150px] text-xs">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    {SPM_TAHUN_OPTIONS.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            Tahun {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {hasFilter ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 text-xs"
                                    onClick={() => {
                                        onKecChange('')
                                        onTahunChange('')
                                    }}
                                >
                                    <X className="mr-1 h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <SpmSanitasiCapaianPanel kecamatanId={kecamatanId} tahun={tahun} showDesaTable={false} />

            <SpmRekapCapaian
                title="Rekap Capaian SPM Sanitasi"
                description={
                    <>
                        Baca capaian per tahun konstruksi (beserta peningkatannya), per kecamatan, dan per desa.
                        {tahun ? ` Tabel wilayah menampilkan infrastruktur tahun ${tahun}.` : ''}
                    </>
                }
                capaianLabel="KK Pemanfaat"
                desaInputs={rekap.desaInputs}
                isDesaLoading={rekap.isDesaLoading}
                yearlyRows={rekap.yearlyRows}
                isYearlyLoading={rekap.isYearlyLoading}
                yearlyBaseline={rekap.yearlyBaseline}
                yearlyBaselineLabel={`Sebelum ${rekap.firstTahun} / tanpa tahun`}
                highlightTahun={tahun}
                yearlyNote="Tambahan per tahun = KK pemanfaat dari infrastruktur yang dibangun pada tahun konstruksi tersebut. Kenaikan cakupan dihitung terhadap target KK wilayah."
                wilayahNote="Capaian wilayah = KK pemanfaat terhadap target KK desa (jumlah penduduk ÷ 5)."
                exportFilename={`rekap-spm-sanitasi${tahun ? `-${tahun}` : ''}`}
            />
        </div>
    )
}
