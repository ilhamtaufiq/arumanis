import { describe, expect, it } from 'vitest'
import { ringkasProgres } from '../progres'

describe('ringkasProgres', () => {
    const rows = [
        { id: 1, nama_paket: 'C', progress_estimasi_fisik: 40, progress_estimasi_keuangan: 30 },
        { id: 2, nama_paket: 'Selesai', progress_estimasi_fisik: 100, progress_estimasi_keuangan: 100 },
        { id: 3, nama_paket: 'A', progress_estimasi_fisik: '10', progress_estimasi_keuangan: null },
        { id: 4, nama_paket: 'B', progress_estimasi_fisik: null, progress_estimasi_keuangan: 5 },
        { id: 5, nama_paket: 'D', progress_estimasi_fisik: 70 },
        { id: 6, nama_paket: 'E', progress_estimasi_fisik: 80 },
        { id: 7, nama_paket: 'F', progress_estimasi_fisik: 90 },
    ]

    it('membuang yang sudah 100% dan mengurutkan dari yang terendah', () => {
        const { terendah, jumlahBelum } = ringkasProgres(rows, 5)
        expect(jumlahBelum).toBe(6)
        expect(terendah.map((p) => p.id)).toEqual([4, 3, 1, 5, 6])
    })

    it('membatasi jumlah yang ditampilkan tanpa mengubah jumlah belum 100%', () => {
        const { terendah, jumlahBelum } = ringkasProgres(rows, 2)
        expect(terendah).toHaveLength(2)
        expect(jumlahBelum).toBe(6)
    })

    it('mengubah nilai teks dan kosong menjadi angka', () => {
        const [pertama] = ringkasProgres(rows).terendah
        expect(pertama).toEqual({ id: 4, nama_paket: 'B', fisik: 0, keuangan: 5 })
    })

    it('kosong bila semua paket sudah 100%', () => {
        expect(ringkasProgres([rows[1]])).toEqual({ terendah: [], jumlahBelum: 0 })
    })
})
