import { JENIS_LABEL } from './jenis-labels'
import type { SpmSanitasiJenis } from '../types'

export type SpmSanitasiOutputType =
    | 'mck'
    | 'mck_individu'
    | 'mck_komunal'
    | 'tangki_septik'
    | 'tangki_septik_individu'
    | 'tangki_septik_komunal'
    | 'ipal'

export const OUTPUT_TYPE_LABEL: Record<SpmSanitasiOutputType, string> = {
    mck: 'MCK',
    mck_individu: 'MCK Individu',
    mck_komunal: 'MCK Komunal',
    tangki_septik: 'Tangki Septik',
    tangki_septik_individu: 'Tangki Septik Individu',
    tangki_septik_komunal: 'Tangki Septik Komunal',
    ipal: 'IPAL',
}

export const INTEGRASI_OUTPUT_LABELS = [
    'MCK',
    'MCK Individu',
    'MCK Komunal',
    'Tangki Septik Individu',
    'Tangki Septik Komunal',
    'IPAL',
] as const

export const INTEGRASI_OUTPUT_SUMMARY =
    'MCK, MCK Individu, MCK Komunal, Tangki Septik Individu, Tangki Septik Komunal, IPAL'

/** Urutan opsi filter output di UI integrasi */
export const OUTPUT_FILTER_OPTIONS: SpmSanitasiOutputType[] = [
    'mck',
    'mck_individu',
    'mck_komunal',
    'tangki_septik_individu',
    'tangki_septik_komunal',
    'ipal',
]

export const OUTPUT_TO_SPM_JENIS: Partial<Record<SpmSanitasiOutputType, SpmSanitasiJenis>> = {
    mck: 'mck_individu',
    mck_individu: 'mck_individu',
    mck_komunal: 'mck_komunal',
    tangki_septik: 'spalds',
    tangki_septik_individu: 'spalds',
    tangki_septik_komunal: 'spalds',
    ipal: 'spaldt',
}

export function getOutputFilterLabel(type: SpmSanitasiOutputType): string {
    if (type === 'mck') {
        return `${OUTPUT_TYPE_LABEL[type]} → ${JENIS_LABEL.mck_individu} / ${JENIS_LABEL.mck_komunal}`
    }
    const target = OUTPUT_TO_SPM_JENIS[type]
    if (!target) return OUTPUT_TYPE_LABEL[type]
    return `${OUTPUT_TYPE_LABEL[type]} → ${JENIS_LABEL[target]}`
}

export function getOutputTypeLabel(type: string): string {
    return OUTPUT_TYPE_LABEL[type as SpmSanitasiOutputType] ?? type
}