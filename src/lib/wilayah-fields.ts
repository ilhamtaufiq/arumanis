/**
 * Wilayah field helpers — DB columns differ from API resource aliases.
 *
 * DB: tbl_kecamatan.n_kec, tbl_desa.n_desa
 * API Resource: nama_kecamatan, nama_desa (aliases)
 *
 * Prefer API aliases when reading JsonResource responses.
 * Use n_kec / n_desa only when reading raw Eloquent/query selects.
 *
 * @see .agent/API_FIELD_CONTRACT.md
 */

export type KecamatanLike = {
    nama_kecamatan?: string | null
    n_kec?: string | null
    name?: string | null
} | null | undefined

export type DesaLike = {
    nama_desa?: string | null
    n_desa?: string | null
    name?: string | null
} | null | undefined

/** Display name for kecamatan from API resource or raw model. */
export function getKecamatanName(kecamatan: KecamatanLike): string {
    if (!kecamatan) return ''
    return (
        kecamatan.nama_kecamatan?.trim() ||
        kecamatan.n_kec?.trim() ||
        kecamatan.name?.trim() ||
        ''
    )
}

/** Display name for desa from API resource or raw model. */
export function getDesaName(desa: DesaLike): string {
    if (!desa) return ''
    return desa.nama_desa?.trim() || desa.n_desa?.trim() || desa.name?.trim() || ''
}

/** "Desa X, Kecamatan Y" or partial. */
export function formatLokasiWilayah(
    desa?: DesaLike,
    kecamatan?: KecamatanLike,
): string {
    const parts = [getDesaName(desa), getKecamatanName(kecamatan)].filter(Boolean)
    return parts.join(', ')
}
