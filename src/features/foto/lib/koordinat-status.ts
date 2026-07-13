import type { Foto } from '../types'

/** Foto punya string koordinat yang non-kosong. */
export function hasFotoKoordinat(foto: Pick<Foto, 'koordinat'>): boolean {
    return Boolean(foto.koordinat && String(foto.koordinat).trim())
}

/**
 * Koordinat invalid = ada nilai koordinat tetapi validasi desa gagal.
 * (validasi_koordinat === false dari API)
 */
export function isFotoKoordinatInvalid(
    foto: Pick<Foto, 'koordinat' | 'validasi_koordinat'>,
): boolean {
    if (!hasFotoKoordinat(foto)) return false
    return foto.validasi_koordinat === false
}

export type FotoKoordinatStatusSummary = {
    total: number
    withCoords: number
    valid: number
    invalid: number
    noCoords: number
}

export function summarizeFotoKoordinatStatus(
    fotos: Array<Pick<Foto, 'koordinat' | 'validasi_koordinat'>> = [],
): FotoKoordinatStatusSummary {
    let withCoords = 0
    let valid = 0
    let invalid = 0
    let noCoords = 0

    for (const foto of fotos) {
        if (!hasFotoKoordinat(foto)) {
            noCoords += 1
            continue
        }
        withCoords += 1
        if (foto.validasi_koordinat === false) invalid += 1
        else if (foto.validasi_koordinat === true) valid += 1
    }

    return {
        total: fotos.length,
        withCoords,
        valid,
        invalid,
        noCoords,
    }
}
