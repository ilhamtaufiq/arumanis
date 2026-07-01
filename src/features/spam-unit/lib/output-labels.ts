export type SpamAirMinumOutputType =
    | 'sambungan_rumah'
    | 'pipa_jaringan'
    | 'reservoir'
    | 'sumber_air'
    | 'bjp'

export type SpamCapaianMetric = 'jp' | 'bjp'

export const OUTPUT_TYPE_LABEL: Record<SpamAirMinumOutputType, string> = {
    sambungan_rumah: 'Sambungan Rumah',
    pipa_jaringan: 'Pipa / Jaringan',
    reservoir: 'Reservoir / Tandon',
    sumber_air: 'Sumber Air',
    bjp: 'BJP (Sumur / Sumur Bor)',
}

export const CAPAIAN_METRIC_LABEL: Record<SpamCapaianMetric, string> = {
    jp: 'JP (SR / KK)',
    bjp: 'BJP (Sumur / tidak yakin)',
}

export const INTEGRASI_OUTPUT_SUMMARY =
    'Sambungan Rumah, Pipa/Jaringan, Reservoir/Tandon, Sumber Air, BJP (Sumur)'

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

export function getOutputFilterLabel(type: SpamAirMinumOutputType): string {
    return OUTPUT_TYPE_LABEL[type]
}

export function getOutputTypeLabel(type: string): string {
    return OUTPUT_TYPE_LABEL[type as SpamAirMinumOutputType] ?? type
}