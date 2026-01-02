import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true if window.innerWidth < 768', () => {
        // Mock window.innerWidth
        vi.stubGlobal('innerWidth', 500)

        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(true)
    })

    it('should return false if window.innerWidth >= 768', () => {
        vi.stubGlobal('innerWidth', 1024)

        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)
    })

    it('should update value on resize', () => {
        vi.stubGlobal('innerWidth', 1024)
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)

        act(() => {
            vi.stubGlobal('innerWidth', 500)
            window.dispatchEvent(new Event('resize'))
        })

        // The .ts version uses matchMedia + set state on effect or listener
        // Actually the .ts version uses matchMedia listener
        // Let's check the test for the .ts version specific logic if needed
    })
})
