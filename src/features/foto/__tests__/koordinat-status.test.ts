import { describe, expect, it } from 'vitest'
import {
    isFotoKoordinatInvalid,
    summarizeFotoKoordinatStatus,
} from '../lib/koordinat-status'

describe('koordinat-status', () => {
    it('marks false validation with coords as invalid', () => {
        expect(
            isFotoKoordinatInvalid({
                koordinat: '-6.8, 107.1',
                validasi_koordinat: false,
            }),
        ).toBe(true)
    })

    it('does not mark valid or empty coords as invalid', () => {
        expect(
            isFotoKoordinatInvalid({
                koordinat: '-6.8, 107.1',
                validasi_koordinat: true,
            }),
        ).toBe(false)
        expect(
            isFotoKoordinatInvalid({
                koordinat: '',
                validasi_koordinat: false,
            }),
        ).toBe(false)
    })

    it('summarizes counts', () => {
        const summary = summarizeFotoKoordinatStatus([
            { koordinat: '-6.8, 107.1', validasi_koordinat: true },
            { koordinat: '-6.9, 107.2', validasi_koordinat: false },
            { koordinat: '', validasi_koordinat: false },
            { koordinat: '  ', validasi_koordinat: true },
        ])
        expect(summary).toEqual({
            total: 4,
            withCoords: 2,
            valid: 1,
            invalid: 1,
            noCoords: 2,
        })
    })
})
