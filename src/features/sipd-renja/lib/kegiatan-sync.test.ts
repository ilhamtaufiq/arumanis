import { describe, expect, it } from 'vitest'
import type { Kegiatan } from '@/features/kegiatan/types'
import type { SipdRenjaItem } from '@/features/sipd-renja/types'
import {
    buildApplyPayload,
    buildKegiatanSyncRows,
    matchKegiatanForSipd,
    normalizeSyncText,
} from './kegiatan-sync'

const sipdBase: SipdRenjaItem = {
    id_sub_bl: 317003,
    kode_sub_giat: '1.03.03.2.01.0022',
    nama_sub_giat: 'Pembangunan SPAM Bukan Jaringan Perpipaan',
    pagu: 2_998_568_950,
    rincian: 2_998_568_950,
    pagu_murni: 2_498_568_950,
    synced_at: '2026-07-01T00:00:00Z',
    rincian_count: 10,
    tahun: 2026,
    id_daerah: 13,
    id_unit: 254,
    nama_program: 'PROGRAM PENGELOLAAN DAN PENGEMBANGAN SISTEM PENYEDIAAN AIR MINUM',
    nama_giat: 'Pengelolaan dan Pengembangan SPAM di Daerah Kabupaten/Kota',
    nama_bidang_urusan: 'URUSAN PEMERINTAHAN BIDANG PEKERJAAN UMUM',
}

function kegiatan(partial: Partial<Kegiatan> & Pick<Kegiatan, 'id'>): Kegiatan {
    return {
        nama_program: '',
        sub_bidang: null,
        nama_kegiatan: '',
        nama_sub_kegiatan: '',
        tahun_anggaran: '2026',
        sumber_dana: 'APBD',
        pagu: 0,
        kode_rekening: [],
        created_at: '',
        updated_at: '',
        ...partial,
    }
}

describe('kegiatan-sync', () => {
    it('normalizes text for matching', () => {
        expect(normalizeSyncText('  SPAM  Jaringan  ')).toBe('spam jaringan')
    })

    it('matches by sipd_id_sub_bl first', () => {
        const list = [
            kegiatan({
                id: 1,
                sipd_id_sub_bl: 317003,
                nama_sub_kegiatan: 'Lain',
            }),
        ]
        const m = matchKegiatanForSipd(sipdBase, list)
        expect(m.reason).toBe('sipd_id')
        expect(m.kegiatan?.id).toBe(1)
    })

    it('matches by kode_sub_giat', () => {
        const list = [
            kegiatan({
                id: 2,
                kode_sub_giat: '1.03.03.2.01.0022',
                nama_sub_kegiatan: 'X',
            }),
        ]
        const m = matchKegiatanForSipd(sipdBase, list)
        expect(m.reason).toBe('kode_sub_giat')
    })

    it('builds create row when no match', () => {
        const rows = buildKegiatanSyncRows([sipdBase], [])
        expect(rows).toHaveLength(1)
        expect(rows[0].action).toBe('create')
        expect(rows[0].fields.every((f) => f.changed)).toBe(true)
        expect(rows[0].selected).toBe(true)
    })

    it('builds update row only for changed fields', () => {
        const existing = kegiatan({
            id: 9,
            sipd_id_sub_bl: 317003,
            nama_program: sipdBase.nama_program!,
            nama_kegiatan: sipdBase.nama_giat!,
            nama_sub_kegiatan: sipdBase.nama_sub_giat!,
            pagu: 1_000, // different
        })
        const rows = buildKegiatanSyncRows([sipdBase], [existing])
        expect(rows[0].action).toBe('update')
        const pagu = rows[0].fields.find((f) => f.key === 'pagu')
        expect(pagu?.changed).toBe(true)
        expect(pagu?.apply).toBe(true)
        const program = rows[0].fields.find((f) => f.key === 'nama_program')
        expect(program?.changed).toBe(false)
        expect(program?.apply).toBe(false)
    })

    it('buildApplyPayload only includes applied fields on update', () => {
        const existing = kegiatan({
            id: 9,
            sipd_id_sub_bl: 317003,
            nama_program: 'OLD PROGRAM',
            nama_kegiatan: sipdBase.nama_giat!,
            nama_sub_kegiatan: sipdBase.nama_sub_giat!,
            pagu: 1_000,
        })
        const rows = buildKegiatanSyncRows([sipdBase], [existing])
        // User only applies pagu
        rows[0].fields = rows[0].fields.map((f) => ({
            ...f,
            apply: f.key === 'pagu',
        }))
        const payload = buildApplyPayload(rows[0])
        expect(payload.pagu).toBe(sipdBase.pagu)
        expect(payload.nama_program).toBeUndefined()
        expect(payload.sipd_id_sub_bl).toBe(317003)
    })

    it('create payload includes all SIPD names and default sumber dana', () => {
        const rows = buildKegiatanSyncRows([sipdBase], [])
        const payload = buildApplyPayload(rows[0])
        expect(payload.nama_program).toContain('PENYEDIAAN AIR MINUM')
        expect(payload.nama_sub_kegiatan).toContain('SPAM')
        expect(payload.sumber_dana).toBe('APBD')
        expect(payload.kode_sub_giat).toBe('1.03.03.2.01.0022')
    })
})
