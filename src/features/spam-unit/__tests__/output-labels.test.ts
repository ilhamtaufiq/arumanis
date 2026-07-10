import { describe, expect, it } from 'vitest'
import {
    estimateCapaianDisplay,
    isSambunganRumahOutput,
    suggestCapaianMetric,
} from '../lib/output-labels'

describe('spam-unit BJP / JP output mapping', () => {
    it('detects sambungan rumah / SR outputs', () => {
        expect(isSambunganRumahOutput({ output_type: 'sambungan_rumah' })).toBe(true)
        expect(isSambunganRumahOutput({ komponen: 'Sambungan Rumah' })).toBe(true)
        expect(isSambunganRumahOutput({ komponen: 'Box SR' })).toBe(true)
        expect(isSambunganRumahOutput({ komponen: 'Reservoir' })).toBe(false)
        expect(isSambunganRumahOutput({ komponen: 'Sumur Bor' })).toBe(false)
    })

    it('suggests BJP when sumur present', () => {
        expect(
            suggestCapaianMetric([
                { output_type: 'sambungan_rumah' },
                { output_type: 'bjp' },
            ]),
        ).toBe('bjp')
        expect(suggestCapaianMetric([{ output_type: 'sambungan_rumah' }])).toBe('jp')
    })

    it('maps SR volume to KK display when metric is BJP', () => {
        const row = {
            sr: 20,
            kk: 0,
            bjp_kk: 0,
            penerima_count: 0,
            air_minum_outputs: [
                { output_type: 'sambungan_rumah', komponen: 'Sambungan Rumah', volume: 15 },
            ],
        }

        expect(estimateCapaianDisplay('bjp', row)).toBe('15 KK (SR→KK)')
        expect(estimateCapaianDisplay('jp', row)).toBe('20 SR / 0 KK')
    })

    it('prefers penerima count when larger than SR volume on BJP', () => {
        const row = {
            sr: 0,
            kk: 0,
            bjp_kk: 0,
            penerima_count: 30,
            air_minum_outputs: [
                { output_type: 'sambungan_rumah', komponen: 'Sambungan Rumah', volume: 10 },
            ],
        }

        expect(estimateCapaianDisplay('bjp', row)).toBe('30 KK (SR→KK)')
    })
})
