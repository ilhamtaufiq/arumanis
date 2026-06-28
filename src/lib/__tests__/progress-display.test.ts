import { describe, expect, it } from 'vitest'
import { formatProgressPercent, getProgressTone } from '../progress-display'

describe('progress display', () => {
    it('maps progress values to tone buckets', () => {
        expect(getProgressTone(100)).toBe('complete')
        expect(getProgressTone(80)).toBe('high')
        expect(getProgressTone(55)).toBe('medium')
        expect(getProgressTone(30)).toBe('low')
        expect(getProgressTone(10)).toBe('minimal')
    })

    it('formats progress percent with two decimals', () => {
        expect(formatProgressPercent(42.567)).toBe('42.57%')
    })
})