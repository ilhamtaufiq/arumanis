import { describe, expect, it } from 'vitest'
import type { Foto } from '@/features/foto/types'
import {
    collectFotoPrintItems,
    escapeHtml,
    filterGroupsForMatrix,
    gpsStatusOf,
    type FotoPrintOptions,
} from '../lib/foto-print'
import type { PenerimaFotoGroup } from '../lib/foto-tab'

function makeFoto(partial: Partial<Foto> & Pick<Foto, 'id'>): Foto {
    return {
        pekerjaan_id: 1,
        komponen_id: 1,
        keterangan: '0%',
        koordinat: '',
        validasi_koordinat: false,
        foto_url: 'https://example.com/a.jpg',
        created_at: '',
        updated_at: '',
        ...partial,
    }
}

function makeGroup(fotos: Foto[]): PenerimaFotoGroup {
    const buckets = {
        '0%': [] as Foto[],
        '25%': [] as Foto[],
        '50%': [] as Foto[],
        '75%': [] as Foto[],
        '100%': [] as Foto[],
    }
    for (const f of fotos) {
        const key = f.keterangan as keyof typeof buckets
        if (buckets[key]) buckets[key].push(f)
        else buckets['0%'].push(f)
    }
    return {
        penerima_id: 1,
        penerima_nama: 'Budi <script>',
        penerima_nik: '3201',
        komponen_id: 1,
        komponen_nama: 'SR',
        fotos: buckets,
    }
}

const baseOpts: FotoPrintOptions = {
    layout: 'grid2',
    scope: 'filtered',
    includeKoordinat: true,
    onlyValidGps: false,
    useFullQuality: false,
}

describe('foto-print', () => {
    it('escapes HTML special characters', () => {
        expect(escapeHtml(`a <b> & "c"`)).toBe('a &lt;b&gt; &amp; &quot;c&quot;')
    })

    it('classifies GPS status', () => {
        expect(gpsStatusOf({ koordinat: '', validasi_koordinat: false })).toBe('none')
        expect(gpsStatusOf({ koordinat: '-6,107', validasi_koordinat: false })).toBe('invalid')
        expect(gpsStatusOf({ koordinat: '-6,107', validasi_koordinat: true })).toBe('valid')
    })

    it('collects items and respects selected + valid GPS filters', () => {
        const f1 = makeFoto({ id: 1, keterangan: '0%', koordinat: '-6,107', validasi_koordinat: true })
        const f2 = makeFoto({ id: 2, keterangan: '50%', koordinat: '-6,108', validasi_koordinat: false })
        const f3 = makeFoto({ id: 3, keterangan: '100%', koordinat: '', validasi_koordinat: false })
        const groups = [makeGroup([f1, f2, f3])]

        expect(collectFotoPrintItems(groups, baseOpts)).toHaveLength(3)

        expect(
            collectFotoPrintItems(groups, { ...baseOpts, onlyValidGps: true }),
        ).toHaveLength(1)

        expect(
            collectFotoPrintItems(groups, { ...baseOpts, scope: 'selected' }, [2, 3]),
        ).toHaveLength(2)
    })

    it('filters matrix groups without empty rows', () => {
        const f1 = makeFoto({ id: 1, keterangan: '0%', koordinat: '-6,107', validasi_koordinat: true })
        const f2 = makeFoto({ id: 2, keterangan: '25%', koordinat: '', validasi_koordinat: false })
        const groups = [
            makeGroup([f1]),
            makeGroup([f2]),
        ]

        const filtered = filterGroupsForMatrix(
            groups,
            { ...baseOpts, layout: 'matrix', onlyValidGps: true },
            [],
        )
        expect(filtered).toHaveLength(1)
        expect(filtered[0].fotos['0%']).toHaveLength(1)
    })
})
