import type { SpmSanitasiJenis } from '../types'

export const JENIS_LABEL: Record<SpmSanitasiJenis, string> = {
    spaldt: 'SPALDT',
    spalds: 'SPALDS',
    iplt: 'IPLT',
    mck_individu: 'MCK Individu',
    mck_komunal: 'MCK Komunal',
}

export const INFRA_JENIS_ORDER: SpmSanitasiJenis[] = [
    'spaldt',
    'spalds',
    'iplt',
    'mck_individu',
    'mck_komunal',
]

/** Jenis infrastruktur yang bisa ditautkan ke paket pekerjaan sanitasi */
export function isIntegrableJenis(jenis: SpmSanitasiJenis) {
    return (
        jenis === 'spaldt' ||
        jenis === 'spalds' ||
        jenis === 'iplt' ||
        jenis === 'mck_individu' ||
        jenis === 'mck_komunal'
    )
}

/** @deprecated Use isIntegrableJenis */
export function isMckJenis(jenis: SpmSanitasiJenis) {
    return isIntegrableJenis(jenis)
}