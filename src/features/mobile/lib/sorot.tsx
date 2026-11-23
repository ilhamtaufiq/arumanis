import { pecahKueri } from './cari-modul'

/** Potongan teks dengan penanda apakah bagian itu cocok dengan kueri (untuk disorot). */
export type Potongan = { teks: string; cocok: boolean }

/** Pecah `judul` menjadi potongan yang cocok dengan kata kueri (tanpa huruf besar/kecil). */
export function sorotPotongan(judul: string, kueri: string): Potongan[] {
    const kata = pecahKueri(kueri)
    if (kata.length === 0) return [{ teks: judul, cocok: false }]
    const pola = new RegExp(`(${kata.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    return judul
        .split(pola)
        .filter((p) => p !== '')
        .map((p) => ({ teks: p, cocok: kata.includes(p.toLowerCase()) }))
}
