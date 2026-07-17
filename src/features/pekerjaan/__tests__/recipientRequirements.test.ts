import { describe, expect, it } from 'vitest'
import {
    formatPenerimaBreakdownLabel,
    getPenerimaTypeBreakdown,
    getRecipientRequirement,
} from '../utils/recipientRequirements'
import type { Output } from '@/features/output/types'

describe('getPenerimaTypeBreakdown', () => {
    it('counts individual and komunal as separate units that sum to total', () => {
        const breakdown = getPenerimaTypeBreakdown([
            { is_komunal: false },
            { is_komunal: false },
            { is_komunal: true },
            { is_komunal: false },
            { is_komunal: true },
        ])

        expect(breakdown).toEqual({
            total: 5,
            individual: 3,
            komunal: 2,
        })
    })

    it('treats missing is_komunal as individual', () => {
        const breakdown = getPenerimaTypeBreakdown([{}, { is_komunal: null }, { is_komunal: true }])

        expect(breakdown.individual).toBe(2)
        expect(breakdown.komunal).toBe(1)
        expect(breakdown.total).toBe(3)
    })

    it('supports SR volume scenario: 16 individual + 4 komunal = 20 units', () => {
        const list = [
            ...Array.from({ length: 16 }, () => ({ is_komunal: false })),
            ...Array.from({ length: 4 }, () => ({ is_komunal: true })),
        ]
        const breakdown = getPenerimaTypeBreakdown(list)

        expect(breakdown.total).toBe(20)
        expect(breakdown.individual).toBe(16)
        expect(breakdown.komunal).toBe(4)

        const requirement = getRecipientRequirement({
            id: 1,
            komponen: 'Sambungan Rumah',
            satuan: 'unit',
            volume: 20,
            penerima_is_optional: false,
        } as Output)

        expect(requirement?.targetRecipients).toBe(20)
        expect(breakdown.total >= (requirement?.targetRecipients ?? 0)).toBe(true)
    })
})

describe('formatPenerimaBreakdownLabel', () => {
    it('formats readable label', () => {
        expect(
            formatPenerimaBreakdownLabel({ total: 20, individual: 16, komunal: 4 }),
        ).toBe('20 total (16 Individual, 4 Komunal)')
    })
})
