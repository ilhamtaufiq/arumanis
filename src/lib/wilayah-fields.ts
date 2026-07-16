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
    options?: { separator?: string; kecamatanPrefix?: string },
): string {
    const sep = options?.separator ?? ', '
    const kecPrefix = options?.kecamatanPrefix
    const desaName = getDesaName(desa)
    const kecName = getKecamatanName(kecamatan)
    const kecPart = kecName ? (kecPrefix ? `${kecPrefix}${kecName}` : kecName) : ''
    return [desaName, kecPart].filter(Boolean).join(sep)
}

/** Lokasi paket pekerjaan dari relasi API (desa + kecamatan). */
export function formatPekerjaanLokasi(
    pekerjaan?: {
        desa?: DesaLike
        kecamatan?: KecamatanLike
        is_konsultan?: boolean
    } | null,
    options?: { separator?: string; kecamatanPrefix?: string; empty?: string },
): string {
    if (!pekerjaan) return options?.empty ?? '-'
    if (pekerjaan.is_konsultan) return options?.empty ?? '—'
    const label = formatLokasiWilayah(pekerjaan.desa, pekerjaan.kecamatan, {
        separator: options?.separator,
        kecamatanPrefix: options?.kecamatanPrefix,
    })
    return label || options?.empty || '-'
}
