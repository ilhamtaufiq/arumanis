import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react'
import { useAuthStore } from '../auth-stores'

const originalLocation = window.location
delete (window as any).location
window.location = { ...originalLocation, href: '', replace: vi.fn() } as any

describe('auth-stores', () => {
    beforeEach(() => {
        act(() => {
            useAuthStore.getState().auth.reset()
        })

        vi.clearAllMocks()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ user: { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'], permissions: [] } }),
        }) as any
    })

    it('should have initial empty state', () => {
        const state = useAuthStore.getState().auth
        expect(state.user).toBeNull()
        expect(state.isSessionActive).toBe(false)
        expect(state.isImpersonating).toBe(false)
    })

    it('should set user and session state', () => {
        const mockUser = { id: 1, name: 'John', email: 'john@example.com', roles: [], permissions: [] }

        act(() => {
            useAuthStore.getState().auth.setUser(mockUser)
            useAuthStore.getState().auth.setSessionActive(true)
        })

        const state = useAuthStore.getState().auth
        expect(state.user).toEqual(mockUser)
        expect(state.isSessionActive).toBe(true)
        expect(state.accessToken).toBe('session')
    })

    it('should reset state', () => {
        act(() => {
            useAuthStore.getState().auth.setUser({ id: 1 } as any)
            useAuthStore.getState().auth.reset()
        })

        const state = useAuthStore.getState().auth
        expect(state.user).toBeNull()
        expect(state.isSessionActive).toBe(false)
    })

    describe('impersonation', () => {
        it('should handle impersonation flow', () => {
            const adminUser = { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'], permissions: [] }
            const targetUser = { id: 2, name: 'User', email: 'user@test.com', roles: ['user'], permissions: [] }

            act(() => {
                useAuthStore.getState().auth.setUser(adminUser)
                useAuthStore.getState().auth.setSessionActive(true)
            })

            act(() => {
                useAuthStore.getState().auth.setImpersonating(targetUser)
            })

            const state = useAuthStore.getState().auth
            expect(state.user).toEqual(targetUser)
            expect(state.isSessionActive).toBe(true)
            expect(state.isImpersonating).toBe(true)
            expect(state.impersonator?.user).toEqual(adminUser)
        })

        it('should stop impersonating and redirect', async () => {
            const adminUser = { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'], permissions: [] }
            const targetUser = { id: 2, name: 'User', email: 'user@test.com', roles: ['user'], permissions: [] }

            act(() => {
                useAuthStore.getState().auth.setUser(adminUser)
                useAuthStore.getState().auth.setSessionActive(true)
                useAuthStore.getState().auth.setImpersonating(targetUser)
            })

            await act(async () => {
                await useAuthStore.getState().auth.stopImpersonating()
            })

            expect(window.location.replace).toHaveBeenCalledWith('/dashboard')
        })
    })
})