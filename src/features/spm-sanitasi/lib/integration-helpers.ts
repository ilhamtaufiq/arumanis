import { ApiError } from '@/lib/api-client'
import { OUTPUT_TO_SPM_JENIS } from './output-labels'
import type {
    SpmDesaIntegration,
    SpmPaketPekerjaan,
    SpmSanitasiJenis,
    SpmSanitasiOutput,
} from '../types'
import type { SpmSanitasiOutputType } from './output-labels'

export function getDesaLabel(d: { nama_desa?: string; n_desa?: string }): string {
    return d.nama_desa ?? d.n_desa ?? '-'
}

export function collectSuggestedJenis(detail: SpmDesaIntegration): SpmSanitasiJenis[] {
    const jenis = new Set<SpmSanitasiJenis>()
    for (const pkj of detail.pekerjaan) {
        for (const output of pkj.sanitasi_outputs ?? pkj.mck_outputs) {
            if (output.target_jenis) {
                jenis.add(output.target_jenis)
            }
        }
        for (const target of pkj.target_jenis_list ?? []) {
            jenis.add(target)
        }
    }
    return [...jenis]
}

export function findPekerjaanForJenis(
    detail: SpmDesaIntegration,
    jenis: SpmSanitasiJenis
): SpmPaketPekerjaan | undefined {
    return detail.pekerjaan.find((pkj) => pkj.target_jenis_list?.includes(jenis))
}

export function inferJenisFromIntegrationRow(row: SpmDesaIntegration): SpmSanitasiJenis | null {
    const fromPekerjaan = collectSuggestedJenis(row)
    if (fromPekerjaan.length > 0) return fromPekerjaan[0]

    for (const type of row.output_types ?? []) {
        const mapped = OUTPUT_TO_SPM_JENIS[type as SpmSanitasiOutputType]
        if (mapped) return mapped
    }

    return null
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        return error.message || fallback
    }
    return fallback
}

export function filterOutputsForSpmJenis(
    outputs: SpmSanitasiOutput[],
    jenis: SpmSanitasiJenis
): SpmSanitasiOutput[] {
    return outputs.filter((output) => {
        if (output.target_jenis === jenis) return true
        if (!output.output_type) return false
        const mapped = OUTPUT_TO_SPM_JENIS[output.output_type as SpmSanitasiOutputType]
        if (mapped === jenis) return true
        if (output.output_type === 'mck' && (jenis === 'mck_individu' || jenis === 'mck_komunal')) {
            return true
        }
        if (
            output.output_type === 'tangki_septik' &&
            jenis === 'spalds'
        ) {
            return true
        }
        return false
    })
}

export function pickDefaultOutput(
    outputs: SpmSanitasiOutput[],
    jenis: SpmSanitasiJenis
): SpmSanitasiOutput | undefined {
    const matching = filterOutputsForSpmJenis(outputs, jenis)
    return matching[0] ?? outputs[0]
}