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
            toast.error('Tempel data RAB terlebih dahulu')
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
            toast.error('Tempel data RAB terlebih dahulu')
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

    const handleFileUpload = useCallback((file: File | undefined) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const buffer = event.target?.result
            const workbook = XLSX.read(buffer, { type: 'binary' })
            const parsed = mapRabItemsToProgressImport(parseRabWorkbook(workbook))
            const items = progressItemsFromRabImport(parsed)

            if (items.length === 0) {
                toast.error('Tidak ada data pekerjaan yang valid ditemukan dari file Excel.')
                return
            }

            const analysisResult = analyzeRabItems(
                parsed.map((item) => ({
                    grup: item.nama_item,
                    uraian: item.rincian_item,
                    satuan: item.satuan,
                    volume: item.target_volume,
                    hargaSatuan: item.harga_satuan,
                })),
            )

            if (editableItems.some((item) => item.nama_item.trim() || item.rincian_item.trim())) {
                setPasteText('')
                setAnalyzed(true)
                onImport(items)
                toast.success(`Berhasil mengimpor ${items.length} item dari Excel (DPP ${analysisResult.summary.subtotalDpp.toLocaleString('id-ID')})`)
                setOpen(false)
                resetDialog()
                return
            }

            onImport(items)
            toast.success(`Berhasil mengimpor ${items.length} item dari Excel`)
            setOpen(false)
            resetDialog()
        }
        reader.readAsBinaryString(file)
    }, [editableItems, onImport, resetDialog])

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