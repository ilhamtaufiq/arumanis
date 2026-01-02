import { describe, it, expect, vi } from 'vitest'
import { cn, sleep } from '../utils'

describe('utils', () => {
    describe('cn', () => {
        it('should merge classes correctly', () => {
            expect(cn('bg-red-500', 'p-4')).toBe('bg-red-500 p-4')
        })

        it('should handle conditional classes', () => {
            expect(cn('bg-red-500', true && 'p-4', false && 'm-2')).toBe('bg-red-500 p-4')
        })

        it('should merge tailwind classes correctly', () => {
            expect(cn('p-2', 'p-4')).toBe('p-4')
        })
    })

    describe('sleep', () => {
        it('should resolve after specified time', async () => {
            vi.useFakeTimers()
            const promise = sleep(100)
            vi.advanceTimersByTime(100)
            await expect(promise).resolves.toBeUndefined()
            vi.useRealTimers()
        })
    })
})
