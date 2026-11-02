import { describe, expect, it } from 'bun:test'
import { adalahAkunLokasi, cariLokasi, type MasterDesa } from '../lokasi-wilayah'

const master: MasterDesa[] = [
    { id: 1, nama: 'Sukarama', kecamatan: 'Bojongpicung' },
    { id: 2, nama: 'Bojongpicung', kecamatan: 'Bojongpicung' },
    { id: 3, nama: 'Sindangjaya', kecamatan: 'Cianjur' },
    { id: 4, nama: 'Sindang', kecamatan: 'Cilaku' },
    { id: 5, nama: 'Joglo', kecamatan: 'Bojongpicung' },
]

describe('cariLokasi', () => {
    it('contoh dari SIPD: desa dan kecamatan dicocokkan dari teks lengkap', () => {
        const hasil = cariLokasi(['Kp. Joglo Rt 02 Rw. 04 Desa Sukarama Kecamatan Bojongpicung, Kab. Cianjur'], master)
        expect(hasil).toEqual({ desa: 'Sukarama', kecamatan: 'Bojongpicung' })
    })

    it('nama desa tanpa kata "Desa" tetap cocok bila kecamatannya disebut', () => {
        expect(cariLokasi(['Sukarama, Kec. Bojongpicung'], master)).toEqual({ desa: 'Sukarama', kecamatan: 'Bojongpicung' })
    })

    it('hanya kecamatan yang disebut: desa dikosongkan', () => {
        expect(cariLokasi(['Pembangunan jalan di Kecamatan Bojongpicung'], master)).toEqual({ desa: null, kecamatan: 'Bojongpicung' })
    })

    it('nama desa yang kebetulan muncul sebagai kata biasa tidak ikut cocok', () => {
        expect(cariLokasi(['Pengadaan sindang pakaian untuk pegawai'], master)).toEqual({ desa: null, kecamatan: null })
    })

    it('cocok per kata utuh, bukan potongan kata', () => {
        expect(cariLokasi(['Desa Sindangjaya Kecamatan Cianjur'], master)).toEqual({ desa: 'Sindangjaya', kecamatan: 'Cianjur' })
    })

    it('beberapa desa cocok: pilih yang kecamatannya disebut di teks', () => {
        const dengan: MasterDesa[] = [
            { id: 10, nama: 'Cibeber', kecamatan: 'Cibeber' },
            { id: 11, nama: 'Cibeber', kecamatan: 'Cianjur' },
        ]
        expect(cariLokasi(['Desa Cibeber Kecamatan Cianjur'], dengan)).toEqual({ desa: 'Cibeber', kecamatan: 'Cianjur' })
    })

    it('teks kosong atau null menghasilkan nilai kosong', () => {
        expect(cariLokasi([null, '  '], master)).toEqual({ desa: null, kecamatan: null })
    })

    it('gabungan beberapa kolom teks dibaca bersama', () => {
        expect(cariLokasi(['Pembangunan MCK', 'Desa Joglo Kecamatan Bojongpicung'], master)).toEqual({ desa: 'Joglo', kecamatan: 'Bojongpicung' })
    })
})

describe('adalahAkunLokasi', () => {
    it('mengenali rekening Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat', () => {
        expect(adalahAkunLokasi('Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat')).toBe(true)
        expect(adalahAkunLokasi('  belanja barang untuk dijual / diserahkan kepada masyarakat ')).toBe(true)
    })

    it('rekening lain dan nilai kosong ditolak', () => {
        expect(adalahAkunLokasi('Belanja Barang Operasional')).toBe(false)
        expect(adalahAkunLokasi('Belanja Modal Peralatan')).toBe(false)
        expect(adalahAkunLokasi(null)).toBe(false)
        expect(adalahAkunLokasi('')).toBe(false)
    })
})
