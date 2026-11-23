/** Jarak tarik (px) yang harus dilewati agar daftar disegarkan saat jari dilepas. */
export const AMBANG_SEGARKAN = 70

/** Batas visual indikator, supaya tidak terus turun saat ditarik jauh. */
export const JARAK_MAKS = 96

/**
 * Jarak indikator dari selisih jari. Tarikan dilemahkan (×0,5) seperti pull-to-refresh di platform lain,
 * lalu dibatasi `JARAK_MAKS`. Nilai negatif (jari naik) menjadi 0.
 */
export function jarakTarik(dy: number): number {
    if (dy <= 0) return 0
    return Math.min(dy * 0.5, JARAK_MAKS)
}

/** Segarkan hanya bila tarikan sudah melewati ambang. */
export function perluSegarkan(dy: number): boolean {
    return dy >= AMBANG_SEGARKAN
}
