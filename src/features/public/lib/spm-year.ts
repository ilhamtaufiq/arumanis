export const PUBLIC_SPM_TAHUN_OPTIONS = [
    '2026',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
] as const

export type PublicSpmTahun = (typeof PUBLIC_SPM_TAHUN_OPTIONS)[number]

const VALID_TAHUN = new Set<string>(PUBLIC_SPM_TAHUN_OPTIONS)

export function parseSpmTahun(value: unknown): string | undefined {
    if (typeof value !== 'string' || value.trim() === '') return undefined
    return VALID_TAHUN.has(value) ? value : undefined
}

export function buildSpmTahunQueryParam(tahun?: string) {
    return tahun ? { tahun } : undefined
}