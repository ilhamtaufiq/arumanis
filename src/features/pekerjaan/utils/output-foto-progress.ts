import type { Output } from '@/features/output/types'
import { getRecipientRequirement } from './recipientRequirements'

/** Jumlah slot progress foto per unit/penerima (0%–100%). */
export const FOTO_PROGRESS_SLOT_COUNT = 5

export type OutputFotoProgressSummary = {
    id: number
    name: string
    mainLabel: string
    totalLabel: string
    subLabel: string
    percentage: number
    isOptional: boolean
    isComplete: boolean
    doneCount?: number
    targetCount?: number
    recipientsReady?: boolean
    recipientTarget?: number | null
    recipientCount?: number
}

/**
 * Hitung ringkasan progress foto per komponen output.
 *
 * Target foto untuk output non-komunal berbasis volume output (target penerima),
 * bukan jumlah penerima yang sudah terdaftar — agar penerima < volume tidak
 * mengecilkan target dan menandai LENGKAP secara prematur.
 */
export function computeOutputFotoProgressSummary(
    output: Pick<Output, 'id' | 'komponen' | 'satuan' | 'volume' | 'penerima_is_optional'>,
    fotoCount: number,
    penerimaCount: number,
): OutputFotoProgressSummary {
    if (output.penerima_is_optional) {
        const isUnitBased = output.satuan?.toLowerCase() === 'unit'
        const unitCount = isUnitBased ? Math.max(1, Math.round(output.volume || 1)) : 1
        const totalTarget = unitCount * FOTO_PROGRESS_SLOT_COUNT
        const totalDone = fotoCount
        const percentage = totalTarget > 0 ? (totalDone / totalTarget) * 100 : 0

        return {
            id: output.id,
            name: output.komponen,
            mainLabel: totalDone.toString(),
            totalLabel: totalTarget.toString(),
            subLabel: 'Total Foto',
            percentage,
            isOptional: true,
            isComplete: totalTarget > 0 && totalDone >= totalTarget,
        }
    }

    const recipientRequirement = getRecipientRequirement(output as Output)
    const recipientTarget = recipientRequirement?.targetRecipients ?? null
    const recipientsReady = recipientTarget === null || penerimaCount >= recipientTarget

    // Target slot = volume output (unit); jangan ikut mengecil ke jumlah penerima.
    // Fallback non-unit: max(penerima, 1) karena volume bukan hitungan penerima.
    const slotCount = recipientTarget ?? Math.max(penerimaCount, 1)
    const totalTarget = slotCount * FOTO_PROGRESS_SLOT_COUNT
    const totalDone = fotoCount
    const percentage = totalTarget > 0 ? (totalDone / totalTarget) * 100 : 0
    const photosComplete = totalTarget > 0 && totalDone >= totalTarget

    return {
        id: output.id,
        name: output.komponen,
        mainLabel: totalDone.toString(),
        totalLabel: totalTarget.toString(),
        subLabel: 'Total Foto',
        percentage,
        isOptional: false,
        isComplete: photosComplete && recipientsReady,
        doneCount: totalDone,
        targetCount: totalTarget,
        recipientsReady,
        recipientTarget,
        recipientCount: penerimaCount,
    }
}
