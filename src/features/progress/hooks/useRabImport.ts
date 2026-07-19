import { useCallback, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { analyzeRabItems } from '@/features/rab-analyzer/lib/calculate-rab-totals'
import {
    parseBestImportRows,
    parseRabPaste,
    parseRabPasteText,
    parseRabWorkbook,
} from '@/features/rab-analyzer/lib/parse-rab-paste'
import { parseNegoPdfFile } from '@/features/rab-analyzer/lib/parse-nego-pdf'
import {
    clearRabPasteDraft,
    loadRabPasteDraft,
    progressItemsFromRabImport,
    mapRabItemsToProgressImport,
} from '../lib/rab-import-bridge'
import type { RabAnalysisResult } from '@/features/rab-analyzer/types'
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

    const analysis: RabAnalysisResult | null = useMemo(() => {
        if (!analyzed || !pasteText.trim()) return null
        return analyzeRabItems(parseRabPaste(pasteText))
    }, [analyzed, pasteText])

    const resetDialog = useCallback(() => {
        setPasteText('')
        setAnalyzed(false)
        setPendingReplace(false)
    }, [])

    const commitImport = useCallback((rows: unknown[][]) => {
        const parsed = mapRabItemsToProgressImport(parseBestImportRows(rows))
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

    const confirmImport = useCallback(() => {
        if (!pasteText.trim()) {
            toast.error('Tempel data Hasil Nego / uraian pekerjaan terlebih dahulu')
            return
        }

        const result = analyzeRabItems(parseRabPaste(pasteText))
        if (result.items.length === 0) {
            toast.error(result.warnings[0] || 'Tidak ada item pekerjaan yang valid ditemukan')
            return
        }

        if (editableItems.some((item) => item.nama_item.trim() || item.rincian_item.trim()) && !pendingReplace) {
            setPendingReplace(true)
            return
        }

        commitImport(parseRabPasteText(pasteText))
    }, [commitImport, editableItems, pasteText, pendingReplace])

    const handleAnalyze = useCallback(() => {
        if (!pasteText.trim()) {
            toast.error('Tempel data Hasil Nego / uraian pekerjaan terlebih dahulu')
            return
        }

        setAnalyzed(true)
        const result = analyzeRabItems(parseRabPaste(pasteText))
        if (result.items.length === 0) {
            toast.error(result.warnings[0] || 'Tidak ada item pekerjaan yang valid ditemukan')
            return
        }

        toast.success(`${result.summary.itemCount} item pekerjaan siap diimpor`)
    }, [pasteText])

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

            const reader = new FileReader()
            reader.onload = (event) => {
                try {
                    const buffer = event.target?.result
                    const workbook = XLSX.read(buffer, { type: 'binary' })
                    const parsed = mapRabItemsToProgressImport(parseRabWorkbook(workbook))
                    const items = progressItemsFromRabImport(parsed)
                    finishFileImport(items, 'Excel')
                } catch (err) {
                    console.error(err)
                    toast.error('Gagal membaca file Excel Hasil Nego.')
                }
            }
            reader.readAsBinaryString(file)
        },
        [finishFileImport],
    )

    const loadDraft = useCallback(() => {
        const draft = loadRabPasteDraft()
        if (!draft) return false
        setPasteText(draft.pasteText)
        setAnalyzed(true)
        setOpen(true)
        return true
    }, [])

    return {
        open,
        setOpen,
        pasteText,
        setPasteText: (value: string) => {
            setPasteText(value)
            setAnalyzed(false)
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