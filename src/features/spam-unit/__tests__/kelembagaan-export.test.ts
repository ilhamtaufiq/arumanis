import { describe, expect, it } from 'vitest'
import {
    buildCapaianSpmAmSheet,
    buildKelembagaanPokmasSheet,
    buildSpmAmDesaRows,
    CAPAIAN_SPM_AM_SHEET_NAME,
    groupKelembagaanByKecamatan,
    KELEMBAGAAN_COL_COUNT,
    KELEMBAGAAN_SHEET_NAME,
    mapUnitToKelembagaanRow,
    resolveProgramDisplay,
    resolveTahunPembangunan,
    type KelembagaanRow,
} from '../lib/kelembagaan'
import type { UnitSpam } from '../types'

function makeUnit(
    partial: Partial<UnitSpam> & {
        id: number
        desa_name: string
        kec: string
        achievements?: UnitSpam['achievements']
        budgets?: UnitSpam['budgets']
        tahun_pembangunan?: string | null
    },
): UnitSpam {
    return {
        id: partial.id,
        desa_id: partial.desa_id ?? partial.id,
        is_simspam: false,
        name: partial.name,
        sistem_layanan: partial.sistem_layanan ?? 'Gravitasi',
        sumber_mata_air_kap: partial.sumber_mata_air_kap ?? '2',
        tahun_pembangunan: partial.tahun_pembangunan ?? null,
        sumber_dana: partial.sumber_dana ?? 'APBD',
        program: partial.program ?? 'DISTARKIM',
        desa: {
            id: partial.desa_id ?? partial.id,
            nama_desa: partial.desa_name,
            n_desa: partial.desa_name,
            target: partial.desa?.target ?? 1000,
            bjp_master: partial.desa?.bjp_master ?? 50,
            kecamatan: {
                id: 1,
                nama_kecamatan: partial.kec,
                n_kec: partial.kec,
            },
        },
        pengelola: {
            id: 1,
            unit_spam_id: partial.id,
            pokmas: partial.pengelola?.pokmas ?? 'KSM TIRTA',
            perdes: '-',
            kepala: '-',
            bendahara: '-',
            sekretaris: '-',
        },
        budgets: partial.budgets,
        pekerjaan: partial.pekerjaan,
        achievements: partial.achievements ?? [
            {
                id: 1,
                unit_spam_id: partial.id,
                tahun: '2025',
                jumlah_sr: 100,
                jumlah_kk: 100,
                jumlah_jiwa: 400,
                jumlah_bjp_kk: 10,
                jumlah_bjp_jiwa: 40,
            },
        ],
    }
}

describe('kelembagaan export format (workbook Cianjur)', () => {
    it('groups by kecamatan with sequential No', () => {
        const rows: KelembagaanRow[] = [
            mapUnitToKelembagaanRow(makeUnit({ id: 1, desa_name: 'Desa A', kec: 'Kecamatan Cianjur' }), 1),
            mapUnitToKelembagaanRow(makeUnit({ id: 2, desa_name: 'Desa B', kec: 'Kecamatan Cianjur' }), 2),
            mapUnitToKelembagaanRow(makeUnit({ id: 3, desa_name: 'Desa C', kec: 'Kecamatan Cilaku' }), 3),
        ]
        const groups = groupKelembagaanByKecamatan(rows)
        expect(groups).toHaveLength(2)
        expect(groups[0].no).toBe(1)
        expect(groups[0].kecamatan).toBe('Kecamatan Cianjur')
        expect(groups[0].items).toHaveLength(2)
        expect(groups[1].no).toBe(2)
        expect(groups[1].items).toHaveLength(1)
    })

    it('builds sheet with multi-level header, 22 columns, and kecamatan merges', () => {
        const rows: KelembagaanRow[] = [
            mapUnitToKelembagaanRow(makeUnit({ id: 1, desa_name: 'Babakan Karet', kec: 'Kecamatan Cianjur' }), 1),
            mapUnitToKelembagaanRow(makeUnit({ id: 2, desa_name: 'Bojongherang', kec: 'Kecamatan Cianjur' }), 2),
            mapUnitToKelembagaanRow(makeUnit({ id: 3, desa_name: 'Cibinonghilir', kec: 'Kecamatan Cilaku' }), 3),
        ]
        const sheet = buildKelembagaanPokmasSheet(rows)

        // Header labels
        expect(sheet['A1']?.v).toBe('No.')
        expect(sheet['B1']?.v).toBe('LOKASI KECAMATAN')
        expect(sheet['C1']?.v).toBe('DESA/ KELURAHAN')
        expect(sheet['G1']?.v).toBe('KELEMBAGAAN POKMAS')
        expect(sheet['L1']?.v).toBe('DATA TEKNIS')
        expect(sheet['P1']?.v).toBe('PARAMETER')
        expect(sheet['G2']?.v).toBe('Pengelola')
        expect(sheet['I2']?.v).toBe('Pengurus')
        expect(sheet['I3']?.v).toBe('Kepala')
        expect(sheet['M3']?.v).toBe('Gravitasi/Pompa')
        expect(sheet['T2']?.v).toBe('JUMLAH SR (UNIT)')
        expect(sheet['V2']?.v).toMatch(/Jiwa/)

        // Column index row (Excel row 6)
        expect(sheet['A6']?.v).toBe(1)
        expect(sheet['V6']?.v).toBe(KELEMBAGAAN_COL_COUNT)

        // First data row (Excel row 7) — No=1 for first kecamatan
        expect(sheet['A7']?.v).toBe(1)
        expect(sheet['B7']?.v).toBe('Kecamatan Cianjur')
        expect(sheet['C7']?.v).toBe('Babakan Karet')
        expect(sheet['T7']?.v).toBe(100)

        // Second unit same kecamatan — No/Kec empty (merged)
        expect(sheet['A8']?.v).toBeUndefined()
        expect(sheet['C8']?.v).toBe('Bojongherang')

        // Third unit new kecamatan No=2
        expect(sheet['A9']?.v).toBe(2)
        expect(sheet['B9']?.v).toBe('Kecamatan Cilaku')

        // Merges include header and kecamatan vertical span (rows 7-8 → 0-based 6-7)
        const merges = sheet['!merges'] ?? []
        expect(merges.some((m) => m.s.r === 0 && m.s.c === 0 && m.e.r === 4 && m.e.c === 0)).toBe(true)
        expect(merges.some((m) => m.s.r === 0 && m.s.c === 6 && m.e.c === 10)).toBe(true)
        expect(
            merges.some((m) => m.s.r === 6 && m.e.r === 7 && m.s.c === 0 && m.e.c === 0),
        ).toBe(true)
        expect(
            merges.some((m) => m.s.r === 6 && m.e.r === 7 && m.s.c === 1 && m.e.c === 1),
        ).toBe(true)
    })

    it('uses official sheet name spelling', () => {
        expect(KELEMBAGAAN_SHEET_NAME).toBe('KELEMBAGAN SPAM POKMAS')
        expect(CAPAIAN_SPM_AM_SHEET_NAME).toBe('Capaian SPM AM')
    })

    it('derives multi-year tahun pembangunan from achievements and budgets', () => {
        const unit = makeUnit({
            id: 10,
            desa_name: 'Desa X',
            kec: 'Kec A',
            tahun_pembangunan: null,
            achievements: [
                {
                    id: 1,
                    unit_spam_id: 10,
                    tahun: '2025',
                    jumlah_sr: 10,
                    jumlah_kk: 10,
                    jumlah_jiwa: 40,
                    jumlah_bjp_kk: 0,
                    jumlah_bjp_jiwa: 0,
                },
                {
                    id: 2,
                    unit_spam_id: 10,
                    tahun: '2024',
                    jumlah_sr: 5,
                    jumlah_kk: 5,
                    jumlah_jiwa: 20,
                    jumlah_bjp_kk: 0,
                    jumlah_bjp_jiwa: 0,
                },
            ],
            budgets: [
                {
                    id: 1,
                    unit_spam_id: 10,
                    tahun: '2023',
                    nilai_kontrak: 1000,
                },
            ],
        })
        expect(resolveTahunPembangunan(unit)).toBe('2023, 2024, 2025')
        const row = mapUnitToKelembagaanRow(unit, 1)
        expect(row.tahun_pembangunan).toBe('2023, 2024, 2025')
    })

    it('prefers explicit tahun_pembangunan when set', () => {
        const unit = makeUnit({
            id: 11,
            desa_name: 'Desa Y',
            kec: 'Kec A',
            tahun_pembangunan: '2019, 2021',
        })
        expect(resolveTahunPembangunan(unit)).toBe('2019, 2021')
    })

    it('builds Capaian SPM AM sheet with title, desa aggregation, and footer rekap', () => {
        const units = [
            makeUnit({ id: 1, desa_id: 1, desa_name: 'Babakan', kec: 'Kecamatan Cianjur' }),
            makeUnit({ id: 2, desa_id: 1, desa_name: 'Babakan', kec: 'Kecamatan Cianjur' }),
            makeUnit({ id: 3, desa_id: 2, desa_name: 'Cibinong', kec: 'Kecamatan Cilaku' }),
        ]
        const desaRows = buildSpmAmDesaRows(units)
        expect(desaRows).toHaveLength(2)
        const babakan = desaRows.find((d) => d.desa === 'Babakan')!
        expect(babakan.jumlahKpspam).toBe(2)
        expect(babakan.jpKk).toBe(200) // 100+100
        expect(babakan.bjpKk).toBe(50 + 10 + 10) // master once + 2 unit BJP

        const sheet = buildCapaianSpmAmSheet(units)
        expect(sheet['A1']?.v).toBe('DATA CAPAIAN')
        expect(sheet['A2']?.v).toBe('SPM PEKERJAAN UMUM')
        expect(sheet['A5']?.v).toBe('No')
        expect(sheet['E6']?.v).toBe('Terlayani JP')
        // First data row Excel row 9
        expect(sheet['A9']?.v).toBe(1)
        expect(sheet['C9']?.v).toBe('Babakan')
        expect(sheet['G9']?.f).toMatch(/MAX\(0,D9-E9-F9\)/)

        // Footer fallback (tanpa stats): SUM baris
        expect(sheet['A11']?.v).toBe('Total')
        expect(sheet['D11']?.f).toMatch(/SUM\(D9:D10\)/)
        expect(sheet['A12']?.v).toBe('Persentase Layanan')
        expect(sheet['A13']?.v).toBe('Capaian SPM')
        expect(sheet['E13']?.f).toMatch(/E12\+F12/)
    })

    it('resolves program from linked pekerjaan kegiatan.nama_sub_kegiatan', () => {
        const unit = makeUnit({
            id: 20,
            desa_name: 'Desa Z',
            kec: 'Kec A',
            program: 'Manual Program',
            pekerjaan: [
                {
                    id: 1,
                    nama_paket: 'Paket A',
                    pagu: 0,
                    tahun_anggaran: '2025',
                    sumber_dana: 'APBD',
                    progress_total: 0,
                    nilai_kontrak: 0,
                    sr: 0,
                    kk: 0,
                    jiwa: 0,
                    penerima_count: 0,
                    foto_count: 0,
                    kegiatan: {
                        id: 1,
                        nama_sub_kegiatan: 'Pembangunan SPAM Perdesaan',
                        nama_kegiatan: 'Air Minum',
                    },
                },
                {
                    id: 2,
                    nama_paket: 'Paket B',
                    pagu: 0,
                    tahun_anggaran: '2025',
                    sumber_dana: 'DAK',
                    progress_total: 0,
                    nilai_kontrak: 0,
                    sr: 0,
                    kk: 0,
                    jiwa: 0,
                    penerima_count: 0,
                    foto_count: 0,
                    kegiatan: {
                        id: 2,
                        nama_sub_kegiatan: 'Pembangunan SPAM Perdesaan',
                    },
                },
            ],
        })
        expect(resolveProgramDisplay(unit)).toBe('Pembangunan SPAM Perdesaan')
        expect(mapUnitToKelembagaanRow(unit, 1).program).toBe('Pembangunan SPAM Perdesaan')
    })

    it('falls back to unit.program when no linked pekerjaan sub kegiatan', () => {
        const unit = makeUnit({
            id: 21,
            desa_name: 'Desa W',
            kec: 'Kec A',
            program: 'PAMSIMAS',
            pekerjaan: [],
        })
        expect(resolveProgramDisplay(unit)).toBe('PAMSIMAS')
    })

    it('footer Capaian SPM uses official stats totals (match tab Capaian SPM)', () => {
        const units = [
            makeUnit({ id: 1, desa_id: 1, desa_name: 'Babakan', kec: 'Kecamatan Cianjur' }),
        ]
        // Stats resmi: coverage 13.3% → (jp+bjp)/target
        const sheet = buildCapaianSpmAmSheet(units, undefined, {
            target_kk: 100000,
            jp_kk: 10000,
            total_bjp_kk: 3300,
            coverage_percentage: 13.3,
            unit_count: 50,
        })
        // 1 data row → footer at 10,11,12
        expect(sheet['A10']?.v).toBe('Total')
        expect(sheet['D10']?.v).toBe(100000)
        expect(sheet['E10']?.v).toBe(10000)
        expect(sheet['F10']?.v).toBe(3300)
        expect(sheet['A11']?.v).toBe('Persentase Layanan')
        expect(sheet['A12']?.v).toBe('Capaian SPM')
        expect(sheet['E12']?.v).toBeCloseTo(0.133, 5)
        expect(String(sheet['A13']?.v ?? '')).toMatch(/tab Capaian SPM/)
    })
})
