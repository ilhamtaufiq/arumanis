export type SpamAirMinumOutputType =
    | 'sambungan_rumah'
    | 'pipa_jaringan'
    | 'reservoir'
    | 'sumber_air'
    | 'bjp'

export type SpamCapaianMetric = 'jp' | 'bjp'

export const OUTPUT_TYPE_LABEL: Record<SpamAirMinumOutputType, string> = {
    sambungan_rumah: 'Sambungan Rumah (JP)',
    pipa_jaringan: 'Pipa / Jaringan',
    reservoir: 'Reservoir / Tandon',
    sumber_air: 'Sumber Air',
    bjp: 'BJP (Sumur / Sumur Bor)',
}

/**
 * JP = Jaringan Perpipaan → SR + KK.
 * BJP = Bukan Jaringan Perpipaan → KK saja (output SR dihitung sebagai KK, bukan SR).
 */
export const CAPAIAN_METRIC_LABEL: Record<SpamCapaianMetric, string> = {
    jp: 'JP — Jaringan Perpipaan (SR/KK)',
    bjp: 'BJP — Bukan Perpipaan (KK saja)',
}

export const INTEGRASI_OUTPUT_SUMMARY =
    'Sambungan Rumah (khusus JP), Pipa/Jaringan, Reservoir/Tandon, Sumber Air, BJP (Sumur; SR→KK)'

export const CAPAIAN_METRIC_HINT =
    'JP: volume Sambungan Rumah/SR masuk kolom SR. BJP: volume SR dihitung sebagai KK saja (bukan SR).'

export const OUTPUT_FILTER_OPTIONS: SpamAirMinumOutputType[] = [
    'sambungan_rumah',
    'pipa_jaringan',
    'reservoir',
    'sumber_air',
    'bjp',
]

export function suggestCapaianMetric(outputs: Array<{ output_type?: string | null }>): SpamCapaianMetric {
    if (outputs.some((o) => o.output_type === 'bjp')) {
        return 'bjp'
    }
    if (outputs.some((o) => !o.output_type)) {
        return 'bjp'
    }
    return 'jp'
}

/** Apakah output bertipe SR/sambungan rumah (untuk badge UI). */
export function isSambunganRumahOutput(output: {
    output_type?: string | null
    komponen?: string | null
}): boolean {
    if (output.output_type === 'sambungan_rumah') return true
    const name = `${output.komponen ?? ''}`.toLowerCase()
    if (name.includes('sambungan') && name.includes('rumah')) return true
    return /\bsr\b/.test(name) && !name.includes('reservoir')
}

/**
 * Estimasi KK BJP dari baris pekerjaan + pilihan metric di UI (sebelum attach).
 * Volume SR di BJP dihitung sebagai KK, bukan SR.
 */
export function estimateCapaianDisplay(
    metric: SpamCapaianMetric,
    row: {
        sr?: number | null
        kk?: number | null
        bjp_kk?: number | null
        penerima_count?: number | null
        air_minum_outputs?: Array<{
            output_type?: string | null
            komponen?: string | null
            volume?: number | string | null
        }>
    },
): string {
    if (metric === 'bjp') {
        const penerima = Number(row.penerima_count ?? 0)
        const outputs = row.air_minum_outputs ?? []
        let volumeAsKk = 0
        for (const o of outputs) {
            const vol = Math.round(Number(o.volume) || 0)
            if (vol <= 0) continue
            const type = o.output_type
            if (type === 'sambungan_rumah' || type === 'bjp' || !type || isSambunganRumahOutput(o)) {
                volumeAsKk += vol
            }
        }
        const bjpKk = Math.max(penerima, volumeAsKk, Number(row.bjp_kk ?? 0))
        const hasSrOutput = outputs.some((o) => isSambunganRumahOutput(o))
        return hasSrOutput
            ? `${bjpKk} KK (SR→KK)`
            : `${bjpKk} BJP KK`
    }

    const sr = Number(row.sr ?? 0)
    const kk = Number(row.kk ?? 0)
    return `${sr} SR / ${kk} KK`
}

export function getOutputFilterLabel(type: SpamAirMinumOutputType): string {
    return OUTPUT_TYPE_LABEL[type]
}

export function getOutputTypeLabel(type: string): string {
    return OUTPUT_TYPE_LABEL[type as SpamAirMinumOutputType] ?? type
}