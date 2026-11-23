/**
 * Judul dari data impor kadang membawa tanda kutip atau titik berulang di depan/belakang
 * (mis. `"""Kp. Kaum ..."""`, `..Pembangunan ...`). Hanya untuk tampilan; data di server tidak diubah.
 */
export function bersihkanJudul(judul: string): string {
    return judul
        .replace(/\s+/g, ' ')
        .replace(/^[\s"'“”‘’.,;:\-–—]+/, '')
        .replace(/[\s"'“”‘’]+$/, '')
        .trim()
}
