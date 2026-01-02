import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import useDialogState from '../use-dialog-state'

describe('useDialogState', () => {
    it('should initialize with null', () => {
        const { result } = renderHook(() => useDialogState())
        expect(result.current[0]).toBeNull()
    })

    it('should initialize with provided state', () => {
        const { result } = renderHook(() => useDialogState('test'))
        expect(result.current[0]).toBe('test')
    })

    it('should toggle state correctly', () => {
        const { result } = renderHook(() => useDialogState<string>())

        act(() => {
            result.current[1]('open')
        })
        expect(result.current[0]).toBe('open')

        act(() => {
            result.current[1]('open')
        })
        expect(result.current[0]).toBeNull()
    })

    it('should switch states correctly', () => {
        const { result } = renderHook(() => useDialogState<string>())

        act(() => {
            result.current[1]('first')
        })
        expect(result.current[0]).toBe('first')

        act(() => {
            result.current[1]('second')
        })
        expect(result.current[0]).toBe('second')
    })
})
