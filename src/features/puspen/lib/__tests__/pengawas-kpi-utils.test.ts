import { describe, expect, it } from 'vitest'
import { getScorePerPekerjaan } from '../pengawas-kpi-utils'

describe('getScorePerPekerjaan', () => {
    it('uses backend value when available', () => {
        expect(getScorePerPekerjaan({
            score: 20,
            pekerjaan_count: 4,
            score_per_pekerjaan: 5.5,
        })).toBe(5.5)
    })

    it('derives average when backend value is missing', () => {
        expect(getScorePerPekerjaan({
            score: 21,
            pekerjaan_count: 3,
        })).toBe(7)
    })

    it('returns zero when there is no pekerjaan', () => {
        expect(getScorePerPekerjaan({
            score: 10,
            pekerjaan_count: 0,
        })).toBe(0)
    })
})