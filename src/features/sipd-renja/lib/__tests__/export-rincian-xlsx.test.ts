import { describe, expect, it } from 'bun:test'
import * as XLSX from 'xlsx'
import { buatWorkbookRincian } from '../export-rincian-xlsx'
import type { SipdRincianRow } from '@/features/sipd-renja/types'

const rows: SipdRincianRow[] = [
    {
        id_rinci_sub_bl: 1,
        subs_bl_teks: 'Pengadaan MCK',
        ket_bl_teks: 'Desa Sukarama Kecamatan Bojongpicung',
        kode_akun: '5.2.02.01',
        nama_akun: 'Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat',
        koefisien: '2',
        koefisien_murni: '1',
        harga_satuan: 1000,
        harga_satuan_murni: 900,
        total_harga: 2000,
        total_harga_murni: 900,
    },
]

describe('buatWorkbookRincian', () => {
    it('membuat sheet Rincian dengan kolom lokasi dan nilai sebelum/sesudah', () => {
        const lokasi = new Map([[1, { desa: 'Sukarama', kecamatan: 'Bojongpicung' }]])
        const stat = {
            berlokasi: 1,
            tanpaLokasi: 0,
            perKecamatan: [{ kecamatan: 'Bojongpicung', jumlah: 1 }],
            perDesa: [{ desa: 'Sukarama', kecamatan: 'Bojongpicung', jumlah: 1 }],
        }
        const wb = buatWorkbookRincian(rows, lokasi, stat, { subKegiatan: 'MCK', tahun: 2026 })
        expect(wb.SheetNames).toEqual(['Rincian', 'Statistik'])

        const data = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets.Rincian, { header: 1, defval: '' })
        const header = data[2]
        const baris = data[3]
        expect(header.indexOf('Desa')).toBeGreaterThan(-1)
        expect(baris[header.indexOf('Desa')]).toBe('Sukarama')
        expect(baris[header.indexOf('Kecamatan')]).toBe('Bojongpicung')
        expect(baris[header.indexOf('Koef. Sebelum')]).toBe(1)
        expect(baris[header.indexOf('Total Sesudah')]).toBe(2000)
    })

    it('sheet Statistik memuat ringkasan, per kecamatan, dan per desa', () => {
        const stat = {
            berlokasi: 3,
            tanpaLokasi: 1,
            perKecamatan: [{ kecamatan: 'Bojongpicung', jumlah: 3 }],
            perDesa: [{ desa: 'Sukarama', kecamatan: 'Bojongpicung', jumlah: 2 }],
        }
        const wb = buatWorkbookRincian([], new Map(), stat, { subKegiatan: 'MCK' })
        const teks = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets.Statistik, { header: 1, defval: '' }).flat()
        expect(teks).toContain('Baris berlokasi')
        expect(teks).toContain('Bojongpicung')
        expect(teks).toContain('Sukarama')
    })
})
