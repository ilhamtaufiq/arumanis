import { describe, expect, it } from 'vitest'
import {
    buildBuatPaketSearch,
    defaultNamaPaket,
    defaultPagu,
    matchKegiatanForBuatPaket,
} from '../buat-paket'
import type { SipdRincianRow } from '@/features/sipd-renja/types'
import type { Kegiatan } from '@/features/kegiatan/types'

const PARENT = { idSubBl: 123, kodeSubGiat: '1.02.01.2.01.0001', namaSubGiat: 'Sub Giat Air Minum' }

function row(overrides: Partial<SipdRincianRow> = {}): SipdRincianRow {
    return {
        id_rinci_sub_bl: 456,
        subs_bl_teks: 'Pembangunan Jaringan Air',
        ket_bl_teks: 'Keterangan',
        kode_akun: '5.1.02.01.001.00039',
        nama_akun: 'Belanja Barang',
        total_harga: 50000000,
        total_harga_murni: 45000000,
        ...overrides,
    }
}

describe('defaultNamaPaket', () => {
    it('prefers keterangan, falls back to uraian then SSH', () => {
        expect(defaultNamaPaket(row())).toBe('Keterangan')
        expect(defaultNamaPaket(row({ ket_bl_teks: '' }))).toBe('Pembangunan Jaringan Air')
        expect(
            defaultNamaPaket(row({ ket_bl_teks: '', subs_bl_teks: '', nama_standar_harga: 'SSH Item' })),
        ).toBe('SSH Item')
        expect(defaultNamaPaket(row({ ket_bl_teks: '', subs_bl_teks: '', nama_standar_harga: '' }))).toBe('')
    })
})

describe('defaultPagu', () => {
    it('prefers total sesudah, falls back to murni', () => {
        expect(defaultPagu(row())).toBe(50000000)
        expect(defaultPagu(row({ total_harga: 0 }))).toBe(45000000)
    })
})

describe('buildBuatPaketSearch', () => {
    it('builds string-only search params with sipd link ids', () => {
        expect(buildBuatPaketSearch(row(), PARENT)).toEqual({
            sipd_nama_paket: 'Keterangan',
            sipd_kode_rekening: '1.02.01.2.01.0001',
            sipd_pagu: '50000000',
            sipd_kode_sub_giat: '1.02.01.2.01.0001',
            sipd_nama_sub: 'Sub Giat Air Minum',
            sipd_id_sub_bl: '123',
            sipd_id_rinci: '456',
        })
    })

    it('omits empty optionals', () => {
        const search = buildBuatPaketSearch(
            row({ ket_bl_teks: '', subs_bl_teks: '', kode_akun: '' }),
            { idSubBl: 0, kodeSubGiat: '', namaSubGiat: '' },
        )
        expect(search.sipd_nama_paket).toBeUndefined()
        expect(search.sipd_kode_rekening).toBeUndefined()
        expect(search.sipd_id_sub_bl).toBeUndefined()
        expect(search.sipd_pagu).toBe('50000000')
    })
})

describe('matchKegiatanForBuatPaket', () => {
    const kegiatan = {
        id: 7,
        sipd_id_sub_bl: 123,
        kode_sub_giat: '1.02.01.2.01.0001',
        kode_rekening: [],
        nama_sub_kegiatan: 'Sub Giat Air Minum',
        tahun_anggaran: '2026',
    } as unknown as Kegiatan

    it('matches by sipd id first', () => {
        expect(
            matchKegiatanForBuatPaket({ sipd_id_sub_bl: '123' }, [kegiatan], '2026')?.id,
        ).toBe(7)
    })

    it('matches by kode_sub_giat', () => {
        const other = { ...kegiatan, id: 8, sipd_id_sub_bl: null } as unknown as Kegiatan
        expect(
            matchKegiatanForBuatPaket({ sipd_kode_sub_giat: '1.02.01.2.01.0001' }, [other], '2026')?.id,
        ).toBe(8)
    })

    it('returns null when ambiguous or missing', () => {
        expect(matchKegiatanForBuatPaket({}, [kegiatan], '2026')).toBeNull()
        const dup = [
            { ...kegiatan, id: 1, sipd_id_sub_bl: null, kode_sub_giat: null },
            { ...kegiatan, id: 2, sipd_id_sub_bl: null, kode_sub_giat: null },
        ] as unknown as Kegiatan[]
        expect(
            matchKegiatanForBuatPaket({ sipd_nama_sub: 'Sub Giat Air Minum' }, dup, '2026'),
        ).toBeNull()
    })
})
