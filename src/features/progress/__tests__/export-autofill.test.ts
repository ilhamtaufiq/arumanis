import { describe, expect, it } from 'vitest'
import type { AppSetting } from '@/features/settings/api'
import type { ProgressReportData } from '../types'
import { buildExportAutofill, buildLaporanFileName } from '../lib/export-autofill'

function setting(key: string, value: string): AppSetting {
    return {
        id: 1,
        key,
        value,
        type: 'text',
        updated_at: '',
    }
}

const baseReport: ProgressReportData = {
    pekerjaan: {
        id: 1,
        nama: 'Paket Test',
        pagu: 1000,
        desa_nama: 'Ciranjang',
        kecamatan_nama: 'Ciranjang',
    },
    kegiatan: {
        nama_kegiatan: 'Kegiatan A',
        nama_sub_kegiatan: 'Sub A',
        sumber_dana: 'APBD',
        tahun_anggaran: 2026,
        nama_pptk: 'Siti PPTK',
        nip_pptk: '198803032010012003',
    },
    kontrak: null,
    penyedia: {
        nama: 'PT Maju',
        direktur: 'Budi Direktur',
    },
    pengawas: {
        nama: 'Andi Pengawas',
        nip: '197001011990031001',
        jabatan: 'Pengawas Lapangan',
    },
    items: [],
    totals: {
        total_bobot: 0,
        total_accumulated_real: 0,
        total_weighted_progress: 0,
    },
    max_minggu: 4,
}

describe('export-autofill', () => {
    it('autofills PPTK, pengawas, penyedia, and DPA from settings', () => {
        const settings = [
            setting('kontrak_nomor_dpa', '900/DPA/2026'),
            setting('kontrak_tanggal_dpa', '2026-02-03'),
            setting('kontrak_skpd', 'Dinas Perkim'),
            setting('kontrak_nama_pptk', 'PPTK Fallback'),
        ]

        const { signatureData, dpaData, sources } = buildExportAutofill(baseReport, settings)

        expect(signatureData.namaMengetahui).toBe('Siti PPTK')
        expect(signatureData.nipMengetahui).toBe('198803032010012003')
        expect(signatureData.jabatanMengetahui).toContain('Pejabat Pelaksana Teknis')
        expect(sources.mengetahui).toContain('sub kegiatan')

        expect(signatureData.namaDiperiksa).toBe('Andi Pengawas')
        expect(signatureData.nipDiperiksa).toBe('197001011990031001')
        expect(sources.diperiksa).toContain('Pengawas')

        expect(signatureData.namaPerusahaan).toBe('PT Maju')
        expect(signatureData.namaDirektur).toBe('Budi Direktur')
        expect(sources.penyedia).toContain('Penyedia')

        expect(dpaData.nomorDpa).toBe('900/DPA/2026')
        expect(dpaData.tanggalDpa).toBe('2026-02-03')
        expect(sources.dpa).toContain('Pengaturan')
    })

    it('falls back PPTK to app settings when kegiatan empty', () => {
        const report = {
            ...baseReport,
            kegiatan: {
                ...baseReport.kegiatan!,
                nama_pptk: null,
                nip_pptk: '',
            },
        }
        const settings = [
            setting('kontrak_nama_pptk', 'PPTK Settings'),
            setting('kontrak_nip_pptk', '111'),
        ]
        const { signatureData, sources } = buildExportAutofill(report, settings)
        expect(signatureData.namaMengetahui).toBe('PPTK Settings')
        expect(signatureData.nipMengetahui).toBe('111')
        expect(sources.mengetahui).toContain('fallback')
    })

    it('builds safe file names', () => {
        const name = buildLaporanFileName('Paket / Test #1', 'M3', 'pdf', new Date('2026-07-19'))
        expect(name).toMatch(/^Laporan_Mingguan_Paket.*_M3_2026-07-19\.pdf$/)
    })
})
