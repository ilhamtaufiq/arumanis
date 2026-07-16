import { describe, expect, it } from 'vitest'
import { computeOutputFotoProgressSummary } from '../utils/output-foto-progress'

const base = {
    id: 1,
    komponen: 'SR',
    satuan: 'unit',
    volume: 10,
    penerima_is_optional: false,
}

describe('computeOutputFotoProgressSummary', () => {
    it('uses output volume for target when penerima < volume (not penerima count)', () => {
        const summary = computeOutputFotoProgressSummary(base, 15, 3)

        expect(summary.totalLabel).toBe('50')
        expect(summary.targetCount).toBe(50)
        expect(summary.mainLabel).toBe('15')
        expect(summary.percentage).toBe(30)
        expect(summary.isComplete).toBe(false)
        expect(summary.recipientsReady).toBe(false)
        expect(summary.recipientCount).toBe(3)
        expect(summary.recipientTarget).toBe(10)
    })

    it('is complete only when photos full and penerima >= volume', () => {
        const summary = computeOutputFotoProgressSummary(base, 50, 10)

        expect(summary.isComplete).toBe(true)
        expect(summary.recipientsReady).toBe(true)
        expect(summary.percentage).toBe(100)
    })

    it('is not complete when penerima enough but photos incomplete', () => {
        const summary = computeOutputFotoProgressSummary(base, 20, 10)

        expect(summary.isComplete).toBe(false)
        expect(summary.recipientsReady).toBe(true)
        expect(summary.percentage).toBe(40)
        expect(summary.totalLabel).toBe('50')
    })

    it('stays incomplete when photos full but penerima still short', () => {
        // Edge: banyak foto terupload ke 3 penerima, target tetap volume
        const summary = computeOutputFotoProgressSummary(base, 50, 3)

        expect(summary.totalLabel).toBe('50')
        expect(summary.percentage).toBe(100)
        expect(summary.recipientsReady).toBe(false)
        expect(summary.isComplete).toBe(false)
    })

    it('keeps target at volume when penerima exceeds volume', () => {
        const summary = computeOutputFotoProgressSummary(base, 50, 12)

        expect(summary.totalLabel).toBe('50')
        expect(summary.isComplete).toBe(true)
        expect(summary.recipientCount).toBe(12)
        expect(summary.recipientTarget).toBe(10)
    })

    it('communal unit uses volume * 5 and ignores penerima list', () => {
        const summary = computeOutputFotoProgressSummary(
            {
                id: 2,
                komponen: 'Reservoir',
                satuan: 'unit',
                volume: 3,
                penerima_is_optional: true,
            },
            10,
            0,
        )

        expect(summary.isOptional).toBe(true)
        expect(summary.totalLabel).toBe('15')
        expect(summary.percentage).toBeCloseTo((10 / 15) * 100)
        expect(summary.isComplete).toBe(false)
    })

    it('communal non-unit targets 5 slots only', () => {
        const summary = computeOutputFotoProgressSummary(
            {
                id: 3,
                komponen: 'Pipa',
                satuan: 'm',
                volume: 100,
                penerima_is_optional: true,
            },
            5,
            0,
        )

        expect(summary.totalLabel).toBe('5')
        expect(summary.isComplete).toBe(true)
    })
})
