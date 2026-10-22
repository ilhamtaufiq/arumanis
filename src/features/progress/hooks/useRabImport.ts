import { useCallback, useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { analyzeRabItems } from '@/features/rab-analyzer/lib/calculate-rab-totals'
import { analisaRabServer } from '@/features/rab-analyzer/api/analisa'
import { parseRabPaste, parseRabWorkbook } from '@/features/rab-analyzer/lib/parse-rab-paste'
import { parseNegoPdfFile } from '@/features/rab-analyzer/lib/parse-nego-pdf'
import {
    clearRabPasteDraft,
    loadRabPasteDraft,
    progressItemsFromRabImport,
    mapRabItemsToProgressImport,
} from '../lib/rab-import-bridge'
import type { RabAnalysisResult, RabParsedItem } from '@/features/rab-analyzer/types'
import type { EditableProgressItem } from '../types/progress-editor'

type UseRabImportOptions = {
    editableItems: EditableProgressItem[]
    onImport: (items: EditableProgressItem[]) => void
    onRequestAutoFill?: () => void
}

export function useRabImport({ editableItems, onImport, onRequestAutoFill }: UseRabImportOptions) {
    const [open, setOpen] = useState(false)
    const [pasteText, setPasteText] = useState('')
    const [analyzed, setAnalyzed] = useState(false)
    const [pendingReplace, setPendingReplace] = useState(false)

    const [analysis, setAnalysis] = useState<RabAnalysisResult | null>(null)

    /** Analisa lewat backend. Format yang tidak dikenali backend dibaca parser lama (Hasil Nego, SPAM JP). */
    const muatAnalisa = useCallback(async (teks: string): Promise<RabAnalysisResult> => {
        const dariServer = await analisaRabServer({ teks })
        return dariServer ?? analyzeRabItems(parseRabPaste(teks))
    }, [])

    const resetDialog = useCallback(() => {
        setPasteText('')
        setAnalyzed(false)
        setAnalysis(null)
        setPendingReplace(false)
    }, [])

    const commitImport = useCallback((hasilRab: RabParsedItem[]) => {
        const parsed = mapRabItemsToProgressImport(hasilRab)
        const items = progressItemsFromRabImport(parsed)

        if (items.length === 0) {
            toast.error('Tidak ada data pekerjaan yang valid ditemukan. Pastikan format kolom sesuai.')
            return
        }

        onImport(items)
        toast.success(`Berhasil mengimpor ${items.length} item pekerjaan`)
        setOpen(false)
        resetDialog()
        clearRabPasteDraft()

        if (onRequestAutoFill) {
            toast.message('Import selesai', {
                description: 'Jalankan Auto-Fill Rencana untuk mengisi rencana mingguan?',
                action: {
                    label: 'Auto-Fill',
                    onClick: onRequestAutoFill,
                },
            })
        }
    }, [onImport, onRequestAutoFill, resetDialog])

    const confirmImport = useCallback(async () => {
        if (!pasteText.trim()) {
            toast.error('Tempel data Hasil Nego / uraian pekerjaan terlebih dahulu')
            return
        }

        let result: RabAnalysisResult
        try {
            result = await muatAnalisa(pasteText)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Analisa RAB gagal')
            return
        }
        if (result.items.length === 0) {
            toast.error(result.warnings[0] || 'Tidak ada item pekerjaan yang valid ditemukan')
            return
        }

        if (editableItems.some((item) => item.nama_item.trim() || item.rincian_item.trim()) && !pendingReplace) {
            setPendingReplace(true)
            return
        }

        commitImport(result.items)
    }, [commitImport, editableItems, muatAnalisa, pasteText, pendingReplace])

    const handleAnalyze = useCallback(async () => {
        if (!pasteText.trim()) {
            toast.error('Tempel data Hasil Nego / uraian pekerjaan terlebih dahulu')
            return
        }

        setAnalyzed(true)
        let result: RabAnalysisResult
        try {
            result = await muatAnalisa(pasteText)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Analisa RAB gagal')
            return
        }
        setAnalysis(result)
        if (result.items.length === 0) {
            toast.error(result.warnings[0] || 'Tidak ada item pekerjaan yang valid ditemukan')
            return
        }

        toast.success(`${result.summary.itemCount} item pekerjaan siap diimpor`)
    }, [muatAnalisa, pasteText])

    const finishFileImport = useCallback(
        (
            items: EditableProgressItem[],
            sourceLabel: string,
        ) => {
            if (items.length === 0) {
                toast.error(
                    'Tidak ada item valid dari file. Pastikan format Hasil Nego (Excel sheet Nego / PDF lampiran BA).',
                )
                return
            }

            const analysisResult = analyzeRabItems(
                items.map((item) => ({
                    grup: item.nama_item,
                    uraian: item.rincian_item,
                    satuan: item.satuan,
                    volume: item.target_volume,
                    hargaSatuan: item.harga_satuan,
                })),
            )
            const dppLabel = analysisResult.summary.subtotalDpp.toLocaleString('id-ID')

            onImport(items)
            toast.success(
                `Import Nego (${sourceLabel}): ${items.length} item · harga nego · DPP ± ${dppLabel}`,
            )
            setOpen(false)
            resetDialog()
        },
        [onImport, resetDialog],
    )

    const handleFileUpload = useCallback(
        (file: File | undefined) => {
            if (!file) return

            const lower = file.name.toLowerCase()

            // ── PDF Hasil Nego (Lampiran BA) ─────────────────────────────
            if (lower.endsWith('.pdf')) {
                const loadingId = toast.loading('Membaca PDF Hasil Nego…')
                void (async () => {
                    try {
                        const result = await parseNegoPdfFile(file)
                        const parsed = mapRabItemsToProgressImport(result.items)
                        const items = progressItemsFromRabImport(parsed)
                        toast.dismiss(loadingId)

                        if (items.length === 0) {
                            toast.error(
                                'Tidak ada item valid dari PDF. Coba file Excel Hasil Nego bila tersedia.',
                            )
                            return
                        }

                        onImport(items)

                        const importTotal = Math.round(result.importGrandTotal)
                        const pdfTotal =
                            result.pdfGrandTotal != null
                                ? Math.round(result.pdfGrandTotal)
                                : null
                        const diff =
                            pdfTotal != null ? Math.abs(importTotal - pdfTotal) : 0
                        const diffPct =
                            pdfTotal && pdfTotal > 0 ? (diff / pdfTotal) * 100 : 0

                        if (pdfTotal != null && diffPct > 0.5) {
                            toast.warning(
                                `Import Nego (PDF): ${items.length} item. Total impor ± Rp${importTotal.toLocaleString('id-ID')} vs total PDF Rp${pdfTotal.toLocaleString('id-ID')} (selisih ${diffPct.toFixed(1)}%). Periksa item yang terpotong di PDF.`,
                                { duration: 10_000 },
                            )
                        } else if (pdfTotal != null) {
                            toast.success(
                                `Import Nego (PDF): ${items.length} item · total ≈ Rp${pdfTotal.toLocaleString('id-ID')} (sesuai TOTAL NILAI NEGOSIASI)`,
                            )
                        } else {
                            toast.success(
                                `Import Nego (PDF): ${items.length} item · total ± Rp${importTotal.toLocaleString('id-ID')}`,
                            )
                        }
                        setOpen(false)
                        resetDialog()
                    } catch (err) {
                        console.error(err)
                        toast.dismiss(loadingId)
                        toast.error(
                            'Gagal membaca PDF. Pastikan file berisi teks (bukan scan polos) atau gunakan Excel Hasil Nego.',
                        )
                    }
                })()
                return
            }

            // ── Excel Hasil Nego ─────────────────────────────────────────
            if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
                toast.error('Format tidak didukung. Gunakan Excel (.xlsx) atau PDF Hasil Nego.')
                return
            }

            void (async () => {
                try {
                    const dariServer = await analisaRabServer({ file })
                    const sumber: RabParsedItem[] = dariServer
                        ? dariServer.items
                        : parseRabWorkbook(XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' }))
                    const items = progressItemsFromRabImport(mapRabItemsToProgressImport(sumber))
                    finishFileImport(items, 'Excel')
                } catch (err) {
                    console.error(err)
                    toast.error('Gagal membaca file Excel Hasil Nego.')
                }
            })()
        },
        [finishFileImport],
    )

    const loadDraft = useCallback(() => {
        const draft = loadRabPasteDraft()
        if (!draft) return false
        setPasteText(draft.pasteText)
        setAnalyzed(true)
        setOpen(true)
        void muatAnalisa(draft.pasteText)
            .then(setAnalysis)
            .catch(() => setAnalysis(null))
        return true
    }, [muatAnalisa])

    return {
        open,
        setOpen,
        pasteText,
        setPasteText: (value: string) => {
            setPasteText(value)
            setAnalyzed(false)
            setAnalysis(null)
            setPendingReplace(false)
        },
        analyzed,
        analysis,
        pendingReplace,
        setPendingReplace,
        handleAnalyze,
        confirmImport,
        handleFileUpload,
        resetDialog,
        loadDraft,
    }
}