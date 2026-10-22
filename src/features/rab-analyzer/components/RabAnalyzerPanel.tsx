import { useEffect, useState } from 'react'
import { Calculator, Upload } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import type { RabAnalysisResult } from '../types'
import { getBerkasList } from '@/features/berkas/api'
import type { Berkas } from '@/features/berkas/types'
import { normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { mapRabItemsToProgressImport } from '../lib/parse-rab-paste'
import api from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getProgressReport, saveProgressReport } from '@/features/progress/api/progress'
import { RabAnalysisSummary } from './RabAnalysisSummary'
import { RabAnalysisTable } from './RabAnalysisTable'
import { downloadRincianHps } from '../lib/export-rincian-hps'

type RabAnalyzerPanelProps = {
    initialPekerjaanId?: string
}

export function RabAnalyzerPanel({ initialPekerjaanId }: RabAnalyzerPanelProps) {
    const navigate = useNavigate()
    const { tahunAnggaran } = useAppSettingsValues()
    const [result, setResult] = useState<RabAnalysisResult | null>(null)
    const [uploadName, setUploadName] = useState('')
    const [berkasPekerjaanId, setBerkasPekerjaanId] = useState('')
    const [berkasKata, setBerkasKata] = useState('RAB')
    const [berkasList, setBerkasList] = useState<Berkas[] | null>(null)
    const [berkasMemuat, setBerkasMemuat] = useState(false)
    const [analisaMemuat, setAnalisaMemuat] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
    const [selectedPekerjaanId, setSelectedPekerjaanId] = useState(initialPekerjaanId || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (initialPekerjaanId) {
            setSelectedPekerjaanId(initialPekerjaanId)
        }
    }, [initialPekerjaanId])

    const { data: pekerjaanRes } = useQuery({
        queryKey: ['rab-import-pekerjaan', tahunAnggaran],
        queryFn: () => getPekerjaan({ tahun: tahunAnggaran, per_page: -1, summary: true }),
    })

    const pekerjaanList = pekerjaanRes?.data || []
    const pekerjaanOptions = pekerjaanList.map((item: { id: number; nama_paket: string; kode_rekening?: string | null }) => ({
        value: String(item.id),
        label: item.nama_paket,
        keywords: item.kode_rekening ?? undefined,
    }))

    /** Analisa di backend: hasilnya dipakai langsung untuk tabel dan impor. */
    const analisaServer = (isi: FormData) => api.post<RabAnalysisResult>('/rab/analisa', isi)

    const analisaBerkas = async (berkas: Blob, nama: string) => {
        const isi = new FormData()
        isi.append('file', berkas, nama)
        setAnalisaMemuat(true)
        try {
            const hasil = await analisaServer(isi)
            setUploadName(nama)
            setResult(hasil)
            toast.success(`${hasil.summary.itemCount} item RAB dari ${nama} berhasil dianalisa`)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Berkas RAB tidak bisa dianalisa'))
        } finally {
            setAnalisaMemuat(false)
        }
    }

    const handleUpload = (file: File) => analisaBerkas(file, file.name)

    const cariBerkas = async (pekerjaanId: string = berkasPekerjaanId) => {
        if (!pekerjaanId) {
            toast.error('Pilih pekerjaan dulu')
            return
        }
        setBerkasMemuat(true)
        try {
            const res = await getBerkasList({
                pekerjaan_id: Number(pekerjaanId),
                search: berkasKata.trim() || undefined,
            })
            setBerkasList(res.data ?? [])
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Berkas tidak bisa dicari')
        } finally {
            setBerkasMemuat(false)
        }
    }

    const pakaiBerkas = async (berkas: Berkas) => {
        const nama = berkas.original_name || berkas.file_name || 'berkas.xlsx'
        if (!/\.xlsx?$/i.test(nama)) {
            toast.error('Pilih berkas Excel (.xlsx atau .xls)')
            return
        }
        try {
            const res = await fetch(normalizeStorageUrl(berkas.berkas_url))
            if (!res.ok) throw new Error(`Berkas tidak bisa diunduh (status ${res.status}).`)
            await analisaBerkas(await res.blob(), nama)
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? `${error.message} Unduh berkas lalu upload dari komputer.`
                    : 'Berkas tidak bisa diambil. Unduh lalu upload dari komputer.',
            )
        }
    }

    const handleReset = () => {
        setResult(null)
        setUploadName('')
    }

    const handleImportToPekerjaan = () => {
        if (!result || result.items.length === 0) {
            toast.error('Analisa RAB terlebih dahulu')
            return
        }
        setImportOpen(true)
    }

    const confirmImportToPekerjaan = async () => {
        if (!selectedPekerjaanId) {
            toast.error('Pilih pekerjaan tujuan')
            return
        }

        // Simpan langsung ke progress pekerjaan
        setSaving(true)
        try {
            const pekerjaanId = Number(selectedPekerjaanId)
            const existing = await getProgressReport(pekerjaanId)
            const mapped = mapRabItemsToProgressImport(result?.items ?? []).map((item) => ({
                nama_item: item.nama_item,
                rincian_item: item.rincian_item,
                satuan: item.satuan || 'ls',
                harga_satuan: item.harga_satuan ?? 0,
                target_volume: item.target_volume ?? 0,
                bobot: item.bobot ?? 0,
                weekly_data: item.weekly_data ?? {},
            }))

            const weekCount = Math.max(existing?.data?.max_minggu ?? 4, 4)
            await saveProgressReport(pekerjaanId, {
                items: mapped,
                week_count: weekCount,
            })

            toast.success(`${mapped.length} item RAB disimpan ke progress pekerjaan`)
            setImportOpen(false)
            navigate({
                to: '/pekerjaan/$id/progress',
                params: { id: selectedPekerjaanId },
            })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal menyimpan RAB ke pekerjaan')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="flex items-center gap-2 text-base font-semibold">
                            <Calculator className="h-5 w-5 text-primary" />
                            Analisa RAB
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload berkas RAB (.xlsx) atau ambil dari berkas pekerjaan.
                        </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[11px]">
                        PPN 11% (kalkulasi)
                    </Badge>
                </div>

                <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Upload className="h-3.5 w-3.5" />
                        Upload file RAB (.xlsx)
                    </p>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5"
                        onChange={(event) => {
                            const file = event.target.files?.[0]
                            event.target.value = ''
                            if (file) void handleUpload(file)
                        }}
                    />
                    {uploadName ? (
                        <p className="text-xs text-muted-foreground">Dibaca dari: {uploadName}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Ambil dari berkas pekerjaan
                    </p>
                    <SearchableSelect
                        options={pekerjaanOptions}
                        value={berkasPekerjaanId}
                        onValueChange={(nilai) => {
                            setBerkasPekerjaanId(nilai)
                            void cariBerkas(nilai)
                        }}
                        placeholder="Pilih pekerjaan..."
                        searchPlaceholder="Cari nama paket atau kode rekening..."
                        emptyMessage="Pekerjaan tidak ditemukan."
                        className="w-full"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            value={berkasKata}
                            onChange={(event) => setBerkasKata(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') void cariBerkas()
                            }}
                            placeholder="Kata dalam nama berkas (default: RAB)"
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        />
                        <Button variant="outline" onClick={() => void cariBerkas()} disabled={berkasMemuat || !berkasPekerjaanId}>
                            {berkasMemuat ? 'Mencari...' : 'Cari berkas'}
                        </Button>
                    </div>
                    {berkasList ? (
                        berkasList.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Tidak ada berkas yang cocok.</p>
                        ) : (
                            <ul className="divide-y overflow-hidden rounded-md border">
                                {berkasList.map((berkas) => (
                                    <li key={berkas.id}>
                                        <button
                                            type="button"
                                            onClick={() => void pakaiBerkas(berkas)}
                                            disabled={analisaMemuat}
                                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-60"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium">
                                                    {berkas.original_name || berkas.file_name || `Berkas #${berkas.id}`}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">{berkas.jenis_dokumen}</span>
                                            </span>
                                            <span className="shrink-0 text-xs font-medium text-primary">
                                                {analisaMemuat ? 'Membaca...' : 'Analisa'}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : null}
                </div>

                {result && result.items.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={handleImportToPekerjaan} className="gap-2">
                            Simpan ke Progress
                        </Button>
                        <Button variant="outline" onClick={() => downloadRincianHps(result)} className="gap-2">
                            Download rincian-hps
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                ) : null}
            </div>

            {result?.warnings.length && result.items.length === 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
                    {result.warnings.join(' ')}
                </div>
            ) : null}

            {result && result.items.length > 0 ? (
                <>
                    <RabAnalysisSummary summary={result.summary} rekap={result.rekap} />
                    <RabAnalysisTable result={result} />
                </>
            ) : (
                <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                    Upload berkas RAB atau pilih dari berkas pekerjaan untuk melihat hasil.
                </div>
            )}

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Simpan RAB ke Progress</DialogTitle>
                        <DialogDescription>
                            Simpan {result?.summary.itemCount ?? 0} item RAB sebagai item progress pekerjaan (menimpa item progress existing).
                        </DialogDescription>
                    </DialogHeader>
                    <SearchableSelect
                        options={pekerjaanOptions}
                        value={selectedPekerjaanId}
                        onValueChange={setSelectedPekerjaanId}
                        placeholder="Pilih pekerjaan..."
                        searchPlaceholder="Cari nama paket atau kode rekening..."
                        emptyMessage="Pekerjaan tidak ditemukan."
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setImportOpen(false)} disabled={saving}>
                            Batal
                        </Button>
                        <Button onClick={() => void confirmImportToPekerjaan()} disabled={saving}>
                            {saving ? 'Menyimpan...' : 'Simpan ke Progress'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}