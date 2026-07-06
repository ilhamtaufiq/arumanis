import { describe, expect, it } from 'vitest'
import {
    matchKetToPekerjaan,
    normalizeLookupText,
    parseDesaKecamatanKet,
    type SipdPekerjaanLookup,
} from './pekerjaan-match'

const samplePekerjaan: SipdPekerjaanLookup[] = [
    {
        id: 1,
        nama_paket: 'Pembangunan SPAM Desa Mayak',
        progress_total: 45,
        desa: {
            id: 1,
            nama_desa: 'Mayak',
            kecamatan_id: 1,
            luas: null,
            jumlah_penduduk: null,
            created_at: '',
            updated_at: '',
        },
        kecamatan: {
            id: 1,
            nama_kecamatan: 'Cibeber',
            jumlah_desa: 0,
            created_at: '',
            updated_at: '',
        },
        kontrak: [{ id: 10 }],
    },
    {
        id: 2,
        nama_paket: 'Rehabilitasi Jalan Desa Padaasih',
        progress_total: 0,
        desa: {
            id: 2,
            nama_desa: 'Padaasih',
            kecamatan_id: 2,
            luas: null,
            jumlah_penduduk: null,
            created_at: '',
            updated_at: '',
        },
        kecamatan: {
            id: 2,
            nama_kecamatan: 'Cijati',
            jumlah_desa: 0,
            created_at: '',
            updated_at: '',
        },
    },
]

describe('normalizeLookupText', () => {
    it('strips non-alphanumeric and lowercases', () => {
        expect(normalizeLookupText('Desa Mayak - Kec. Cibeber')).toBe('desamayakkeccibeber')
    })
})

describe('parseDesaKecamatanKet', () => {
    it('parses desa kecamatan pattern', () => {
        expect(parseDesaKecamatanKet('Desa Mayak Kecamatan Cibeber')).toEqual({
            desa: 'Mayak',
            kecamatan: 'Cibeber',
        })
    })

    it('returns null for non-location keterangan', () => {
        expect(parseDesaKecamatanKet('Seminar Kit')).toBeNull()
        expect(parseDesaKecamatanKet('Pengadaan')).toBeNull()
    })
})

describe('matchKetToPekerjaan', () => {
    it('matches location keterangan to pekerjaan by desa/kecamatan', () => {
        const match = matchKetToPekerjaan('Desa Mayak Kecamatan Cibeber', samplePekerjaan)
        expect(match?.id).toBe(1)
    })

    it('matches exact nama_paket', () => {
        const match = matchKetToPekerjaan('Rehabilitasi Jalan Desa Padaasih', samplePekerjaan)
        expect(match?.id).toBe(2)
    })

    it('does not match expense-line keterangan', () => {
        expect(matchKetToPekerjaan('Seminar Kit', samplePekerjaan)).toBeNull()
        expect(matchKetToPekerjaan('Jamuan Makan', samplePekerjaan)).toBeNull()
    })
})