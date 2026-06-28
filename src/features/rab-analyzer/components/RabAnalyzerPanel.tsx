import { useEffect, useMemo, useState } from 'react'
import { Calculator, ClipboardPaste } from 'lucide-react'
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
import { parseRabPaste } from '../lib/parse-rab-paste'
import { saveRabPasteDraft } from '@/features/progress/lib/rab-import-bridge'
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
    const [analyzed, setAnalyzed] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
    const [selectedPekerjaanId, setSelectedPekerjaanId] = useState(initialPekerjaanId || '')

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

    const result = useMemo(() => {
        if (!analyzed || !pasteText.trim()) return null
        return analyzeRabItems(parseRabPaste(pasteText))
    }, [analyzed, pasteText])

    const handleAnalyze = () => {
        if (!pasteText.trim()) {
            toast.error('Tempel data RAB dari Excel terlebih dahulu')
            return
        }

        setAnalyzed(true)
        const analysis = analyzeRabItems(parseRabPaste(pasteText))

        if (analysis.items.length === 0) {
            toast.error('Tidak ada item pekerjaan yang valid ditemukan')
            return
        }

        toast.success(`${analysis.summary.itemCount} item pekerjaan berhasil dianalisa`)
    }

    const handleReset = () => {
        setPasteText('')
        setAnalyzed(false)
    }

    const handleImportToPekerjaan = () => {
        if (!result || result.items.length === 0) {
            toast.error('Analisa RAB terlebih dahulu')
            return
        }
        setImportOpen(true)
    }

    const confirmImportToPekerjaan = () => {
        if (!selectedPekerjaanId) {
            toast.error('Pilih pekerjaan tujuan')
            return
        }

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

                <RabPasteInput
                    value={pasteText}
                    onChange={(value) => {
                        setPasteText(value)
                        setAnalyzed(false)
                    }}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={handleAnalyze} disabled={!pasteText.trim()} className="gap-2">
                        <Calculator className="h-4 w-4" />
                        Analisa RAB
                    </Button>
                    {result && result.items.length > 0 ? (
                        <Button variant="secondary" onClick={handleImportToPekerjaan} className="gap-2">
                            Import ke Pekerjaan
                        </Button>
                    ) : null}
                    <Button variant="outline" onClick={handleReset} disabled={!pasteText && !analyzed}>
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
                        <DialogTitle>Import ke Buat Laporan</DialogTitle>
                        <DialogDescription>
                            Pilih pekerjaan untuk mengimpor {result?.summary.itemCount ?? 0} item RAB yang sudah dianalisa.
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
                        <Button variant="ghost" onClick={() => setImportOpen(false)}>Batal</Button>
                        <Button onClick={confirmImportToPekerjaan}>Lanjut ke Buat Laporan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}