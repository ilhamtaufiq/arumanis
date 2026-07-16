import type { Output } from '@/features/output/types'

/** Jumlah slot progress foto per unit/penerima (0%–100%). */
export const FOTO_PROGRESS_SLOT_COUNT = 5

export type OutputFotoProgressInput = Pick<
    Output,
    'id' | 'komponen' | 'satuan' | 'volume' | 'penerima_is_optional'
>

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
 * Unit yang dihitung untuk target foto — selaras API `resolveFotoMetrics`.
 * Komunal: volume hanya jika satuan unit; non-komunal: selalu volume output.
 */
export function getOutputFotoRequiredUnits(
    output: Pick<Output, 'satuan' | 'volume' | 'penerima_is_optional'>,
): number {
    if (output.penerima_is_optional) {
        const isUnitBased = output.satuan?.toLowerCase() === 'unit'
        return isUnitBased ? Math.max(1, Math.round(output.volume || 1)) : 1
    }
    return Math.max(1, Math.round(output.volume || 1))
}

export function getOutputFotoRequiredSlots(
    output: Pick<Output, 'satuan' | 'volume' | 'penerima_is_optional'>,
): number {
    return getOutputFotoRequiredUnits(output) * FOTO_PROGRESS_SLOT_COUNT
}

/**
 * Hitung ringkasan progress foto per komponen output.
 *
 * Target foto non-komunal berbasis volume output, bukan jumlah penerima terdaftar —
 * agar penerima < volume tidak mengecilkan target / menandai LENGKAP prematur.
 */
export function computeOutputFotoProgressSummary(
    output: OutputFotoProgressInput,
    fotoCount: number,
    penerimaCount: number,
): OutputFotoProgressSummary {
    const requiredUnits = getOutputFotoRequiredUnits(output)
    const totalTarget = requiredUnits * FOTO_PROGRESS_SLOT_COUNT
    const totalDone = fotoCount
    const percentage = totalTarget > 0 ? (totalDone / totalTarget) * 100 : 0

    if (output.penerima_is_optional) {
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

    const recipientTarget = requiredUnits
    const recipientsReady = penerimaCount >= recipientTarget
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
