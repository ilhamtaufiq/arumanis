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

/**
 * Jenis master infrastruktur yang dibutuhkan paket pekerjaan di desa.
 * Contoh: output "Tangki Septik Individu" → spalds; "IPAL" → spaldt (bukan iplt, agar tidak dobel).
 */
export function collectSuggestedJenis(detail: SpmDesaIntegration): SpmSanitasiJenis[] {
    const jenis = new Set<SpmSanitasiJenis>()
    for (const pkj of detail.pekerjaan) {
        for (const output of pkj.sanitasi_outputs ?? pkj.mck_outputs) {
            // Primary only (IPAL → spaldt, bukan sekalian iplt) agar auto-create tidak dobel
            if (output.target_jenis) {
                jenis.add(output.target_jenis)
                continue
            }
            // Fallback jika API belum kirim target_jenis
            if (output.output_type) {
                const mapped = OUTPUT_TO_SPM_JENIS[output.output_type as SpmSanitasiOutputType]
                if (mapped) jenis.add(mapped)
            }
        }
        for (const target of pkj.target_jenis_list ?? []) {
            jenis.add(target)
        }
        // Paket-level output_types (ringkas dari list/detail)
        for (const type of pkj.output_types ?? []) {
            const mapped = OUTPUT_TO_SPM_JENIS[type as SpmSanitasiOutputType]
            if (mapped) jenis.add(mapped)
        }
    }
    return [...jenis]
}

/** Jenis yang dibutuhkan satu paket (untuk badge mismatch di UI) */
export function suggestedJenisForPekerjaan(pkj: SpmPaketPekerjaan): SpmSanitasiJenis[] {
    const jenis = new Set<SpmSanitasiJenis>()
    for (const output of pkj.sanitasi_outputs ?? pkj.mck_outputs ?? []) {
        if (output.target_jenis) {
            jenis.add(output.target_jenis)
            continue
        }
        if (output.output_type) {
            const mapped = OUTPUT_TO_SPM_JENIS[output.output_type as SpmSanitasiOutputType]
            if (mapped) jenis.add(mapped)
        }
    }
    for (const target of pkj.target_jenis_list ?? []) {
        jenis.add(target)
    }
    for (const type of pkj.output_types ?? []) {
        const mapped = OUTPUT_TO_SPM_JENIS[type as SpmSanitasiOutputType]
        if (mapped) jenis.add(mapped)
    }
    return [...jenis]
}

/** Jenis yang disarankan dari pekerjaan tapi belum ada master infrastruktur sejenis di desa */
export function collectMissingJenis(detail: SpmDesaIntegration): SpmSanitasiJenis[] {
    const existing = new Set(detail.infrastruktur.map((i) => i.jenis))
    return collectSuggestedJenis(detail).filter((jenis) => !existing.has(jenis))
}

/** True jika partial/no_infra bisa dilengkapi: ada jenis hilang atau ada paket belum tertaut */
export function canAutoCompleteIntegration(detail: SpmDesaIntegration): boolean {
    if ((detail.pekerjaan_count ?? detail.pekerjaan?.length ?? 0) === 0) return false
    if (collectMissingJenis(detail).length > 0) return true
    return (detail.pekerjaan ?? []).some((p) => !p.is_linked)
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
        // IPLT berbagi output terpusat (IPAL) dengan SPALDT
        if (jenis === 'iplt' && (output.target_jenis === 'spaldt' || output.output_type === 'ipal')) {
            return true
        }
        if (!output.output_type) return false
        const mapped = OUTPUT_TO_SPM_JENIS[output.output_type as SpmSanitasiOutputType]
        if (mapped === jenis) return true
        if (jenis === 'iplt' && mapped === 'spaldt') return true
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
    // Jangan fallback ke output beda jenis — backend menolak
    // (Tangki Septik/SPALDS → SPALDS, IPAL/IPLT/SPALDT → SPALDT/IPLT, MCK → MCK).
    const matching = filterOutputsForSpmJenis(outputs, jenis)
    return matching[0]
}