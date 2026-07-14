import { describe, expect, it } from 'vitest'
import { REPORT_CATEGORIES } from '../report-catalog'

describe('report catalog', () => {
    it('has only real export formats', () => {
        const ids = REPORT_CATEGORIES.flatMap((c) => c.items.map((i) => i.id))
        expect(ids.length).toBeGreaterThanOrEqual(8)
        expect(new Set(ids).size).toBe(ids.length)

        for (const cat of REPORT_CATEGORIES) {
            for (const item of cat.items) {
                expect(item.formats.length).toBeGreaterThan(0)
                expect(item.formats.every((f) => f === 'pdf' || f === 'excel')).toBe(true)
                expect(item.description('2026')).toBeTruthy()
            }
        }
    })
})
