import { describe, expect, it } from 'vitest'
import {
    matchByKodeRekening,
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

    it('does not match location ket to konsultan without desa/kecamatan', () => {
        const list: SipdPekerjaanLookup[] = [
            {
                id: 99,
                nama_paket: 'Jasa Konsultan Pengawasan Paket 3',
                progress_total: 0,
                is_konsultan: true,
                desa: null as unknown as SipdPekerjaanLookup['desa'],
                kecamatan: null as unknown as SipdPekerjaanLookup['kecamatan'],
            },
            ...samplePekerjaan,
        ]
        expect(
            matchKetToPekerjaan('Desa Mekarlaksana Kecamatan Cikadu', list),
        ).toBeNull()
    })

    it('does not match location ket when pekerjaan has empty desa strings', () => {
        const list: SipdPekerjaanLookup[] = [
            {
                id: 88,
                nama_paket: 'Jasa Konsultan Pengawasan Paket 3',
                progress_total: 10,
                desa: {
                    id: 0,
                    nama_desa: '',
                    kecamatan_id: 0,
                    luas: null,
                    jumlah_penduduk: null,
                    created_at: '',
                    updated_at: '',
                },
                kecamatan: {
                    id: 0,
                    nama_kecamatan: '',
                    jumlah_desa: 0,
                    created_at: '',
                    updated_at: '',
                },
            },
        ]
        expect(
            matchKetToPekerjaan('Desa Mekarlaksana Kecamatan Cikadu', list),
        ).toBeNull()
    })

    it('matches Mekarlaksana only to pekerjaan in that desa', () => {
        const list: SipdPekerjaanLookup[] = [
            {
                id: 99,
                nama_paket: 'Jasa Konsultan Pengawasan Paket 3',
                is_konsultan: true,
                progress_total: 0,
            },
            {
                id: 50,
                nama_paket: 'SPAM Mekarlaksana',
                progress_total: 20,
                desa: {
                    id: 5,
                    nama_desa: 'Mekarlaksana',
                    kecamatan_id: 9,
                    luas: null,
                    jumlah_penduduk: null,
                    created_at: '',
                    updated_at: '',
                },
                kecamatan: {
                    id: 9,
                    nama_kecamatan: 'Cikadu',
                    jumlah_desa: 0,
                    created_at: '',
                    updated_at: '',
                },
            },
        ]
        expect(
            matchKetToPekerjaan('Desa Mekarlaksana Kecamatan Cikadu', list)?.id,
        ).toBe(50)
    })
})

describe('matchByKodeRekening', () => {
    const list: SipdPekerjaanLookup[] = [
        {
            id: 1,
            nama_paket: 'Pembangunan MCK Individu - Paket 6 Desa Bojongherang Kec. Cianjur',
            progress_total: 30,
            kode_rekening: '1.03.05.2.01.0044.5.1.02.01.001.00039',
        },
        {
            id: 2,
            nama_paket: 'Pembangunan MCK Individu - Paket 7 Desa Bojongherang Kec. Cianjur',
            progress_total: 10,
            kode_rekening: '1.03.05.2.01.0045.5.1.02.01.001.00039',
        },
    ]

    it('matches by kode_sub_giat + rekening', () => {
        expect(
            matchByKodeRekening('1.03.05.2.01.0044', '5.1.02.01.001.00039', list)?.id,
        ).toBe(1)
    })

    it('returns null when kode tidak cocok', () => {
        expect(
            matchByKodeRekening('1.03.05.2.01.9999', '5.1.02.01.001.00039', list),
        ).toBeNull()
    })

    it('returns null when sub_giat atau akun kosong', () => {
        expect(matchByKodeRekening(null, '5.1.02.01.001.00039', list)).toBeNull()
        expect(matchByKodeRekening('1.03.05.2.01.0044', '', list)).toBeNull()
    })
})

describe('matchKetToPekerjaan with kode rekening', () => {
    const list: SipdPekerjaanLookup[] = [
        {
            id: 1,
            nama_paket: 'Pembangunan MCK Individu - Paket 6 Desa Bojongherang Kec. Cianjur',
            progress_total: 30,
            kode_rekening: '1.03.05.2.01.0044.5.1.02.01.001.00039',
            desa: {
                id: 1,
                nama_desa: 'Bojongherang',
                kecamatan_id: 1,
                luas: null,
                jumlah_penduduk: null,
                created_at: '',
                updated_at: '',
            },
            kecamatan: {
                id: 1,
                nama_kecamatan: 'Cianjur',
                jumlah_desa: 0,
                created_at: '',
                updated_at: '',
            },
        },
        {
            id: 2,
            nama_paket: 'Pembangunan MCK Individu - Paket 7 Desa Bojongherang Kec. Cianjur',
            progress_total: 10,
            kode_rekening: '1.03.05.2.01.0045.5.1.02.01.001.00039',
            desa: {
                id: 1,
                nama_desa: 'Bojongherang',
                kecamatan_id: 1,
                luas: null,
                jumlah_penduduk: null,
                created_at: '',
                updated_at: '',
            },
            kecamatan: {
                id: 1,
                nama_kecamatan: 'Cianjur',
                jumlah_desa: 0,
                created_at: '',
                updated_at: '',
            },
        },
    ]

    it('kode rekening mengalahkan desa/kecamatan saat sama di sub kegiatan lain', () => {
        // Ket lokasi desa/kec identik untuk kedua paket, tapi kode sub kegiatan
        // berbeda → kode rekening menentukan paket yang benar.
        expect(
            matchKetToPekerjaan(
                'Desa Bojongherang Kecamatan Cianjur',
                list,
                { sub_giat: '1.03.05.2.01.0045', akun: '5.1.02.01.001.00039' },
            )?.id,
        ).toBe(2)
    })

    it('tanpa kode, match desa/kecamatan ambigu mengembalikan null', () => {
        // Dua paket desa/kec sama dan nama paket tidak memuat nama desa → jangan tebak
        expect(matchKetToPekerjaan('Desa Bojongherang Kecamatan Cianjur', list)).toBeNull()
    })
})