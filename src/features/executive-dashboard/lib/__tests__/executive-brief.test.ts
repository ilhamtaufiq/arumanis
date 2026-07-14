import { describe, expect, it } from 'vitest'
import { buildTopRisks, buildTrafficKpis } from '../executive-brief'
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
            totalPekerjaan: 100,
            totalPaguPekerjaan: 800_000_000,
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
            total_jobs: 100,
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
    it('builds traffic KPIs with tones', () => {
        const kpis = buildTrafficKpis(sampleData())
        expect(kpis).toHaveLength(4)
        expect(kpis[0].label).toContain('Progres')
        expect(['green', 'yellow', 'red', 'neutral']).toContain(kpis[0].tone)
    })

    it('surfaces data quality and lagging regions as risks', () => {
        const risks = buildTopRisks(sampleData())
        expect(risks.length).toBeGreaterThan(0)
        expect(risks.some((r) => r.title.includes('koordinat'))).toBe(true)
        expect(risks.some((r) => r.title.includes('Wilayah lag'))).toBe(true)
    })
})
