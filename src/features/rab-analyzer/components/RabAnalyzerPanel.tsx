import { useEffect, useState } from 'react'
import { Calculator, ClipboardPaste, Upload } from 'lucide-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { analyzeRabItems } from '../lib/calculate-rab-totals'
import type { RabAnalysisResult } from '../types'
import { getBerkasList } from '@/features/berkas/api'
import type { Berkas } from '@/features/berkas/types'
import { normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { mapRabItemsToProgressImport, parseRabPaste } from '../lib/parse-rab-paste'
import api from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { saveRabPasteDraft } from '@/features/progress/lib/rab-import-bridge'
import { getProgressReport, saveProgressReport } from '@/features/progress/api/progress'
import { RabPasteInput } from './RabPasteInput'
import { RabAnalysisSummary } from './RabAnalysisSummary'
import { RabAnalysisTable } from './RabAnalysisTable'

type RabAnalyzerPanelProps = {
    initialPekerjaanId?: string
}

export function RabAnalyzerPanel({ initialPekerjaanId }: RabAnalyzerPanelProps) {
    const navigate = useNavigate()
    const { tahunAnggaran } = useAppSettingsValues()
    const [pasteText, setPasteText] = useState('')
    const [result, setResult] = useState<RabAnalysisResult | null>(null)
    const [uploadName, setUploadName] = useState('')
    const [berkasPekerjaanId, setBerkasPekerjaanId] = useState('')
    const [berkasKata, setBerkasKata] = useState('RAB')
    const [berkasList, setBerkasList] = useState<Berkas[] | null>(null)
    const [berkasMemuat, setBerkasMemuat] = useState(false)
    const [analyzed, setAnalyzed] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
    const [selectedPekerjaanId, setSelectedPekerjaanId] = useState(initialPekerjaanId || '')
    const [saving, setSaving] = useState(false)
    const [importMode, setImportMode] = useState<'laporan' | 'persist'>('persist')

    useEffect(() => {
        if (initialPekerjaanId) {
            setSelectedPekerjaanId(initialPekerjaanId)
        }
    }, [initialPekerjaanId])

    const { data: pekerjaanRes } = useQuery({
        queryKey: ['rab-import-pekerjaan', tahunAnggaran],
        queryFn: () => getPekerjaan({ tahun: tahunAnggaran, per_page: 100, summary: true }),
    })

    const pekerjaanList = pekerjaanRes?.data || []

    /** Analisa di backend: hasilnya dipakai langsung untuk tabel dan impor. */
    const analisaServer = (isi: FormData) => api.post<RabAnalysisResult>('/rab/analisa', isi)

    const analisaBerkas = async (berkas: Blob, nama: string) => {
        const isi = new FormData()
        isi.append('file', berkas, nama)
        try {
            const hasil = await analisaServer(isi)
            setPasteText('')
            setUploadName(nama)
            setResult(hasil)
            setAnalyzed(true)
            toast.success(`${hasil.summary.itemCount} item RAB dari ${nama} berhasil dianalisa`)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Berkas RAB tidak bisa dianalisa'))
        }
    }

    const handleUpload = (file: File) => analisaBerkas(file, file.name)

    const cariBerkas = async () => {
        if (!berkasPekerjaanId) {
            toast.error('Pilih pekerjaan dulu')
            return
        }
        setBerkasMemuat(true)
        try {
            const res = await getBerkasList({
                pekerjaan_id: Number(berkasPekerjaanId),
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

    const handleAnalyze = async () => {
        if (!pasteText.trim()) {
            toast.error('Tempel data RAB dari Excel terlebih dahulu')
            return
        }
        const isi = new FormData()
        isi.append('teks', pasteText)
        try {
            const hasil = await analisaServer(isi)
            setUploadName('')
            setResult(hasil)
            setAnalyzed(true)
            toast.success(`${hasil.summary.itemCount} item pekerjaan berhasil dianalisa`)
        } catch (error) {
            // Format yang belum dibaca backend (mis. SPAM JP) memakai parser lokal sebagai cadangan.
            const lokal = analyzeRabItems(parseRabPaste(pasteText))
            if (lokal.items.length === 0) {
                toast.error(getApiErrorMessage(error, 'Tidak ada item pekerjaan yang valid ditemukan'))
                return
            }
            setUploadName('')
            setResult(lokal)
            setAnalyzed(true)
            toast.success(`${lokal.summary.itemCount} item pekerjaan dianalisa dengan parser lokal`)
        }
    }

    const handleReset = () => {
        setPasteText('')
        setResult(null)
        setUploadName('')
        setAnalyzed(false)
    }

    const handleImportToPekerjaan = (mode: 'laporan' | 'persist') => {
        if (!result || result.items.length === 0) {
            toast.error('Analisa RAB terlebih dahulu')
            return
        }
        if (uploadName && mode === 'laporan') {
            toast.error('Dari file Excel, gunakan Simpan ke Progress')
            return
        }
        setImportMode(mode)
        setImportOpen(true)
    }

    const confirmImportToPekerjaan = async () => {
        if (!selectedPekerjaanId) {
            toast.error('Pilih pekerjaan tujuan')
            return
        }

        if (importMode === 'laporan') {
            const saved = saveRabPasteDraft(pasteText, result?.summary)
            if (!saved) {
                toast.error('Gagal menyimpan draft RAB. Data terlalu besar — paste ulang di Buat Laporan.')
                return
            }

            setImportOpen(false)
            navigate({
                to: '/buat-laporan/$id',
                params: { id: selectedPekerjaanId },
                search: { importRab: 1 },
            })
            return
        }

        // Persist langsung ke progress pekerjaan
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
                            <ClipboardPaste className="h-5 w-5 text-primary" />
                            Tempel Data dari Excel
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Blok baris RAB MCK/SPAM JP dari Excel (Ctrl+C), lalu tempel di sini.
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
                    <div className="flex flex-wrap gap-2">
                        <Select value={berkasPekerjaanId} onValueChange={setBerkasPekerjaanId}>
                            <SelectTrigger className="w-full sm:w-[320px]">
                                <SelectValue placeholder="Pilih pekerjaan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {pekerjaanList.map((item: { id: number; nama_paket: string }) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.nama_paket}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <input
                            value={berkasKata}
                            onChange={(event) => setBerkasKata(event.target.value)}
                            placeholder="Kata dalam nama berkas"
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        />
                        <Button variant="outline" onClick={() => void cariBerkas()} disabled={berkasMemuat}>
                            {berkasMemuat ? 'Mencari...' : 'Cari berkas'}
                        </Button>
                    </div>
                    {berkasList ? (
                        berkasList.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Tidak ada berkas yang cocok.</p>
                        ) : (
                            <ul className="divide-y rounded-md border">
                                {berkasList.map((berkas) => (
                                    <li key={berkas.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                                        <span className="truncate">
                                            {berkas.original_name || berkas.file_name || `Berkas #${berkas.id}`}
                                            <span className="ml-2 text-xs text-muted-foreground">{berkas.jenis_dokumen}</span>
                                        </span>
                                        <Button size="sm" variant="secondary" onClick={() => void pakaiBerkas(berkas)}>
                                            Baca
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : null}
                </div>

                <div className="my-4 text-center text-xs text-muted-foreground">atau paste dari Excel</div>

                <RabPasteInput
                    value={pasteText}
                    onChange={(value) => {
                        setPasteText(value)
                        setResult(null)
                        setUploadName('')
                        setAnalyzed(false)
                    }}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => void handleAnalyze()} disabled={!pasteText.trim() || !!uploadName} className="gap-2">
                        <Calculator className="h-4 w-4" />
                        Analisa RAB
                    </Button>
                    {result && result.items.length > 0 ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => handleImportToPekerjaan('persist')}
                                className="gap-2"
                            >
                                Simpan ke Progress
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!!uploadName}
                                onClick={() => handleImportToPekerjaan('laporan')}
                                className="gap-2"
                            >
                                Buka di Buat Laporan
                            </Button>
                        </>
                    ) : null}
                    <Button variant="outline" onClick={handleReset} disabled={!pasteText && !analyzed && !result}>
                        Reset
                    </Button>
                </div>
            </div>

            {result?.warnings.length && result.items.length === 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
                    {result.warnings.join(' ')}
                </div>
            ) : null}

            {result && result.items.length > 0 ? (
                <>
                    <RabAnalysisSummary summary={result.summary} />
                    <RabAnalysisTable result={result} />
                </>
            ) : (
                <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                    Tempel data RAB lalu klik <strong className="mx-1">Analisa RAB</strong> untuk melihat hasil.
                </div>
            )}

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {importMode === 'persist' ? 'Simpan RAB ke Progress' : 'Import ke Buat Laporan'}
                        </DialogTitle>
                        <DialogDescription>
                            {importMode === 'persist'
                                ? `Simpan ${result?.summary.itemCount ?? 0} item RAB sebagai item progress pekerjaan (menimpa item progress existing).`
                                : `Pilih pekerjaan untuk mengimpor ${result?.summary.itemCount ?? 0} item RAB ke editor Buat Laporan.`}
                        </DialogDescription>
                    </DialogHeader>
                    <Select value={selectedPekerjaanId} onValueChange={setSelectedPekerjaanId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih pekerjaan..." />
                        </SelectTrigger>
                        <SelectContent>
                            {pekerjaanList.map((item: { id: number; nama_paket: string }) => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                    {item.nama_paket}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setImportOpen(false)} disabled={saving}>
                            Batal
                        </Button>
                        <Button onClick={() => void confirmImportToPekerjaan()} disabled={saving}>
                            {saving
                                ? 'Menyimpan...'
                                : importMode === 'persist'
                                  ? 'Simpan ke Progress'
                                  : 'Lanjut ke Buat Laporan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}