import type { RabAnalysisResult } from '@/features/rab-analyzer/types'
import { mapRabItemsToProgressImport } from '@/features/rab-analyzer/lib/parse-rab-paste'
import type { EditableProgressItem } from '../types/progress-editor'

const RAB_PASTE_DRAFT_KEY = 'arumanis:rab-paste-draft'
const MAX_DRAFT_BYTES = 500_000

export type RabPasteDraft = {
    pasteText: string
    summary?: RabAnalysisResult['summary']
    savedAt: number
}

export function progressItemsFromRabImport(imported: ReturnType<typeof mapRabItemsToProgressImport>): EditableProgressItem[] {
    return imported.map((item) => ({
        id: item.id,
        nama_item: item.nama_item,
        rincian_item: item.rincian_item,
        satuan: item.satuan,
        harga_satuan: item.harga_satuan,
        target_volume: item.target_volume,
        bobot: item.bobot,
        weekly_data: (item.weekly_data || {}) as EditableProgressItem['weekly_data'],
    }))
}

export function saveRabPasteDraft(pasteText: string, summary?: RabAnalysisResult['summary']): boolean {
    if (!pasteText.trim()) return false
    if (new Blob([pasteText]).size > MAX_DRAFT_BYTES) return false

    const draft: RabPasteDraft = {
        pasteText,
        summary,
        savedAt: Date.now(),
    }

    try {
        sessionStorage.setItem(RAB_PASTE_DRAFT_KEY, JSON.stringify(draft))
        return true
    } catch {
        return false
    }
}

export function loadRabPasteDraft(): RabPasteDraft | null {
    try {
        const raw = sessionStorage.getItem(RAB_PASTE_DRAFT_KEY)
        if (!raw) return null
        const draft = JSON.parse(raw) as RabPasteDraft
        if (!draft.pasteText?.trim()) return null
        return draft
    } catch {
        return null
    }
}

export function clearRabPasteDraft(): void {
    sessionStorage.removeItem(RAB_PASTE_DRAFT_KEY)
}

export { mapRabItemsToProgressImport }