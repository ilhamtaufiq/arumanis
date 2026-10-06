import { describe, expect, it } from 'vitest'
import { buildSpmFormFromPekerjaan } from '../lib/auto-create-infrastruktur'
import { collectMissingJenis, collectSuggestedJenis } from '../lib/integration-helpers'
import type { SpmDesaIntegration, SpmPaketPekerjaan } from '../types'

function paket(id: number, outputs: Array<{ output_type: string; target_jenis: string }>, kk = 10): SpmPaketPekerjaan {
    return {
        id,
        nama_paket: `Paket ${id}`,
        pagu: 0,
        sanitasi_outputs: outputs.map((o, i) => ({
            id: id * 10 + i,
            komponen: o.output_type,
            satuan: 'unit',
            volume: 1,
            output_type: o.output_type,
            target_jenis: o.target_jenis as SpmPaketPekerjaan['target_jenis_list'][number],
        })),
        mck_outputs: [],
        output_types: outputs.map((o) => o.output_type),
        mck_types: [],
        // Backend: IPAL → semua jenis yang cocok
        target_jenis_list: outputs.flatMap((o) =>
            o.output_type === 'ipal' ? ['spaldt', 'iplt'] : [o.target_jenis],
        ) as SpmPaketPekerjaan['target_jenis_list'],
        derived: { unit: 1, mck_unit: 0, kk, jiwa: kk * 5, nilai_kontrak: 0, progress_total: 0 },
        is_linked: false,
        linked_spm_ids: [],
    }
}

function desa(pekerjaan: SpmPaketPekerjaan[], infra: SpmDesaIntegration['infrastruktur'] = []): SpmDesaIntegration {
    return {
        desa: { id: 1, n_desa: 'Ciloto', jumlah_penduduk: 1000, kecamatan: { id: 1, n_kec: 'Cipanas' } },
        infrastruktur: infra,
        infrastruktur_count: infra.length,
        pekerjaan_count: pekerjaan.length,
        linked_count: 0,
        pekerjaan,
        derived: { unit: 0, mck_unit: 0, kk: 0, jiwa: 0, nilai_kontrak: 0, progress_avg: 0 },
        manual: { kk: 0, jiwa: 0, nilai_kontrak: 0 },
        sync_status: 'no_infrastruktur',
    }
}

describe('integration-helpers sanitasi', () => {
    it('suggests only spaldt for IPAL (not iplt) to avoid duplicate masters', () => {
        const detail = desa([paket(1, [{ output_type: 'ipal', target_jenis: 'spaldt' }])])
        expect(collectSuggestedJenis(detail)).toEqual(['spaldt'])
    })

    it('treats existing IPLT master as covering IPAL need', () => {
        const detail = desa([paket(1, [{ output_type: 'ipal', target_jenis: 'spaldt' }])], [
            { id: 9, jenis: 'iplt', nama_infrastruktur: 'IPLT', jumlah_pemanfaat_kk: 0, linked_pekerjaan_count: 0 },
        ])
        expect(collectMissingJenis(detail)).toEqual([])
    })

    it('counts KK of a multi-jenis package only once', () => {
        const pkj = paket(1, [
            { output_type: 'ipal', target_jenis: 'spaldt' },
            { output_type: 'mck_komunal', target_jenis: 'mck_komunal' },
        ], 40)
        const counted = new Set<number>()
        const first = buildSpmFormFromPekerjaan(1, 'spaldt', [pkj], counted)
        counted.add(pkj.id)
        const second = buildSpmFormFromPekerjaan(1, 'mck_komunal', [pkj], counted)
        expect(first.jumlah_pemanfaat_kk).toBe(40)
        expect(second.jumlah_pemanfaat_kk).toBeNull()
    })
})
