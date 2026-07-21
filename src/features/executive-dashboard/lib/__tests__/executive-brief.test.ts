import { describe, expect, it } from 'vitest'
import {
    buildTopRisks,
    buildTrafficKpis,
    getPekerjaanStatusRecap,
} from '../executive-brief'
import type { ExecutiveDashboardData } from '../../types'

function sampleData(overrides: Partial<ExecutiveDashboardData> = {}): ExecutiveDashboardData {
    return {
        dashboard: {
            totalKegiatan: 10,
            totalPagu: 1_000_000_000,
            kegiatanPerTahun: [],
            kegiatanPerSumberDana: [],
            paguPerTahun: [],
            availableYears: ['2026'],
            totalPekerjaan: 90,
            totalPaguPekerjaan: 800_000_000,
            totalPaguPekerjaanFisik: 700_000_000,
            totalPaguPekerjaanKonsultan: 100_000_000,
            pekerjaanAktif: 90,
            pekerjaanBatal: 10,
            pekerjaanBerkontrak: 70,
            pekerjaanBelumBerkontrak: 20,
            pekerjaanFisik: 80,
            pekerjaanKonsultan: 10,
            pekerjaanFisikBerkontrak: 65,
            pekerjaanFisikBelumBerkontrak: 15,
            pekerjaanPerKecamatan: [],
            pekerjaanPerDesa: [],
            paguPekerjaanPerKecamatan: [],
            totalKontrak: 70,
            totalNilaiKontrak: 500_000_000,
            kontrakPerPenyedia: [],
            nilaiKontrakPerPenyedia: [],
            totalOutput: 40,
            outputPerKomponen: [],
            totalPenerima: 200,
            totalJiwa: 800,
            penerimaKomunalVsIndividu: [],
        },
        spam: {
            total_foto_dokumentasi: 50,
            total_units: 40,
            coverage_percentage: 55,
            total_target: 12000,
            total_kk: 6600,
            total_bjp_kk: 800,
            ringkasan: {
                scope_label: 'TA',
                capaian: { label: 'c', sr: 0, kk: 6600, jiwa: 0, nilai_kontrak: 0 },
                integrasi: {
                    label: 'i',
                    paket_tertaut: 0,
                    paket_tersedia: 0,
                    paket_belum_tertaut: 0,
                    unit_dengan_tautan: 0,
                    desa_terintegrasi: 0,
                    desa_partial: 0,
                    desa_tanpa_unit: 0,
                    desa_tanpa_pekerjaan: 0,
                },
                potensi: { label: 'p', sr: 0, kk: 0, jiwa: 0, nilai_kontrak: 0 },
                dari_tautan: { label: 'd', sr: 0, kk: 0, jiwa: 0, nilai_kontrak: 0 },
                selisih_potensi_capaian: { sr: 0, kk: 0, jiwa: 0, nilai_kontrak: 0 },
                spm: {
                    target_kk: 12000,
                    jp_kk: 6600,
                    bjp_master_kk: 0,
                    bjp_unit_kk: 800,
                    total_bjp_kk: 800,
                    coverage_percentage: 55,
                },
            },
        } as ExecutiveDashboardData['spam'],
        sanitasi: {
            coverage_kk_percentage: 62,
            target_kk: 1000,
            total_pemanfaat_kk: 620,
            total_pemanfaat_jiwa: 2500,
            total_count: 80,
            berfungsi_count: 70,
            total_investasi: 100_000_000,
            desa_with_infrastruktur: 30,
        } as ExecutiveDashboardData['sanitasi'],
        pengawas: {
            total_pengawas: 12,
            total_lokasi: 90,
            total_pagu: 400_000_000,
        },
        dataQuality: {
            no_coordinates: 25,
            no_photos: 15,
            started_no_photos: 8,
            no_contracts: 10,
            total_jobs: 90,
        },
        analytics: {
            trend: [
                { week: 'W1', rencana: 20, realisasi: 18 },
                { week: 'W2', rencana: 40, realisasi: 28 },
            ],
            regions: [
                { name: 'A', value: 25 },
                { name: 'B', value: 80 },
            ],
            categories: [],
        },
        ...overrides,
    }
}

describe('executive brief helpers', () => {
    it('builds traffic KPIs including SPM air minum and sanitasi', () => {
        const kpis = buildTrafficKpis(sampleData())
        expect(kpis).toHaveLength(5)
        expect(kpis[0].label).toContain('Progres')
        expect(kpis.some((k) => k.label.includes('Air Minum'))).toBe(true)
        expect(kpis.some((k) => k.label.includes('Sanitasi'))).toBe(true)
        expect(['green', 'yellow', 'red', 'neutral']).toContain(kpis[0].tone)
    })

    it('recaps active, canceled, contracted, uncontracted, fisik, and konsultan', () => {
        const recap = getPekerjaanStatusRecap(sampleData())
        expect(recap.aktif).toBe(90)
        expect(recap.batal).toBe(10)
        expect(recap.berkontrak).toBe(70)
        expect(recap.belumBerkontrak).toBe(20)
        expect(recap.fisik).toBe(80)
        expect(recap.konsultan).toBe(10)
        expect(recap.paguFisik).toBe(700_000_000)
        expect(recap.paguKonsultan).toBe(100_000_000)
        expect(recap.total).toBe(100)
    })

    it('scopes operational metrics to fisik when excludeKonsultan', () => {
        const recap = getPekerjaanStatusRecap(sampleData(), { excludeKonsultan: true })
        expect(recap.aktif).toBe(80)
        expect(recap.berkontrak).toBe(65)
        expect(recap.belumBerkontrak).toBe(15)
        expect(recap.paguAktif).toBe(700_000_000)
        expect(recap.konsultan).toBe(10)
        expect(recap.fisik).toBe(80)

        const kpis = buildTrafficKpis(sampleData(), { excludeKonsultan: true })
        expect(kpis.some((k) => k.label.includes('fisik'))).toBe(true)
    })

    it('surfaces data quality and lagging regions as risks', () => {
        const risks = buildTopRisks(sampleData())
        expect(risks.length).toBeGreaterThan(0)
        expect(risks.some((r) => r.title.includes('koordinat'))).toBe(true)
        expect(risks.some((r) => r.title.includes('Wilayah lag'))).toBe(true)
        expect(risks.some((r) => r.title.includes('dibatalkan'))).toBe(true)
        expect(risks.some((r) => r.title.includes('belum berkontrak'))).toBe(true)
        expect(risks.some((r) => r.title.includes('konsultan'))).toBe(true)
    })
})
