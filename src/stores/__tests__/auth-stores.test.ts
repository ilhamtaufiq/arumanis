import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react'
import { useAuthStore } from '../auth-stores'

// Mock window.location
const originalLocation = window.location
delete (window as any).location
window.location = { ...originalLocation, href: '' } as any

describe('auth-stores', () => {
    beforeEach(() => {
        // Reset store state before each test
        act(() => {
            useAuthStore.getState().auth.reset()
        })

        // Clear cookies manually if needed, though reset() does it
        vi.clearAllMocks()
    })

    it('should have initial empty state', () => {
        const state = useAuthStore.getState().auth
        expect(state.user).toBeNull()
        expect(state.accessToken).toBe('')
        expect(state.isImpersonating).toBe(false)
    })

    it('should set user and token', () => {
        const mockUser = { id: 1, name: 'John', email: 'john@example.com', roles: [], permissions: [] }
        const mockToken = 'test-token'

        act(() => {
            useAuthStore.getState().auth.setUser(mockUser)
            useAuthStore.getState().auth.setAccessToken(mockToken)
        })

        const state = useAuthStore.getState().auth
        expect(state.user).toEqual(mockUser)
        expect(state.accessToken).toBe(mockToken)
    })

    it('should reset state', () => {
        act(() => {
            useAuthStore.getState().auth.setUser({ id: 1 } as any)
            useAuthStore.getState().auth.reset()
        })

        const state = useAuthStore.getState().auth
        expect(state.user).toBeNull()
        expect(state.accessToken).toBe('')
    })

    describe('impersonation', () => {
        it('should handle impersonation flow', () => {
            const adminUser = { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'], permissions: [] }
            const targetUser = { id: 2, name: 'User', email: 'user@test.com', roles: ['user'], permissions: [] }

            act(() => {
                useAuthStore.getState().auth.setUser(adminUser)
                useAuthStore.getState().auth.setAccessToken('admin-token')
            })

            act(() => {
                useAuthStore.getState().auth.setImpersonating(targetUser, 'target-token')
            })

            const state = useAuthStore.getState().auth
            expect(state.user).toEqual(targetUser)
            expect(state.accessToken).toBe('target-token')
            expect(state.isImpersonating).toBe(true)
            expect(state.impersonator?.user).toEqual(adminUser)
        })

        it('should stop impersonating and redirect', () => {
            const adminUser = { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'], permissions: [] }
            const targetUser = { id: 2, name: 'User', email: 'user@test.com', roles: ['user'], permissions: [] }

            act(() => {
                useAuthStore.getState().auth.setUser(adminUser)
                useAuthStore.getState().auth.setAccessToken('admin-token')
                useAuthStore.getState().auth.setImpersonating(targetUser, 'target-token')
            })

            act(() => {
                useAuthStore.getState().auth.stopImpersonating()
            })

            const state = useAuthStore.getState().auth
            expect(state.user).toEqual(adminUser)
            expect(state.isImpersonating).toBe(false)
            expect(window.location.href).toBe('/')
        })
    })
})
