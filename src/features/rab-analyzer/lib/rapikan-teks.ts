/** Persentase pajak default yang dipakai di tabel dan file rincian-hps. */
export const PAJAK_PERSEN = 11

const PECAHAN: Record<string, string> = {
    '¼': '1/4',
    '½': '1/2',
    '¾': '3/4',
    '⅐': '1/7',
    '⅑': '1/9',
    '⅒': '1/10',
    '⅓': '1/3',
    '⅔': '2/3',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8',
}

const SUPERSCRIPT: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
}

/**
 * Ganti tanda `"` menjadi `inch`, pecahan unicode menjadi `1/2` dan sejenisnya,
 * serta angka pangkat (m³) menjadi angka biasa (m3).
 */
export function rapikanTeks(teks: string): string {
    let hasil = teks.replace(/"/g, ' inch')
    for (const [pecahan, tulisan] of Object.entries(PECAHAN)) {
        // Angka bulat di depan pecahan (1¼) dipisah spasi jadi "1 1/4", bukan "11/4".
        hasil = hasil.replace(new RegExp(`(\\d)${pecahan}`, 'g'), (_, angka: string) => `${angka} ${tulisan}`)
        hasil = hasil.split(pecahan).join(tulisan)
    }
    for (const [pangkat, angka] of Object.entries(SUPERSCRIPT)) {
        hasil = hasil.split(pangkat).join(angka)
    }
    return hasil.replace(/\s+/g, ' ').trim()
}
