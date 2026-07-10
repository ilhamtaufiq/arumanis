import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const USER_DATA = 'auth_user_data'

interface AuthUser {
    id: number
    name: string
    email: string
    roles: string[]
    permissions: string[]
    avatar?: string | null
    gender?: string | null
}

const normalizeRoles = (roles: any[] | undefined | null): string[] => {
    if (!roles) return [];
    return roles
        .map((role: any) => {
            if (typeof role === 'string') return role
            if (role && typeof role === 'object' && typeof role.name === 'string') {
                return role.name
            }
            return ''
        })
        .filter((role): role is string => Boolean(role));
};

const normalizePermissions = (permissions: any[] | undefined | null): string[] => {
    if (!permissions) return [];
    return permissions
        .map((permission: any) => {
            if (typeof permission === 'string') return permission
            if (permission && typeof permission === 'object' && typeof permission.name === 'string') {
                return permission.name
            }
            return ''
        })
        .filter((permission): permission is string => Boolean(permission));
};

const normalizeUser = (user: any): AuthUser | null => {
    if (!user) return null;
    return {
        ...user,
        roles: normalizeRoles(user.roles),
        permissions: normalizePermissions(user.permissions),
    };
};

interface AuthState {
    auth: {
        user: AuthUser | null
        isSessionActive: boolean
        setUser: (user: AuthUser | null) => void
        setSessionActive: (active: boolean) => void
        /** @deprecated Token disimpan di httpOnly cookie via BFF. */
        accessToken: string
        /** @deprecated Gunakan setSessionActive(true) setelah login BFF. */
        setAccessToken: (_token?: string) => void
        resetAccessToken: () => void
        reset: () => void
        isImpersonating: boolean
        impersonator: {
            user: AuthUser | null
        } | null
        setImpersonating: (targetUser: AuthUser) => void
        stopImpersonating: () => void
        hydrateFromSession: (payload: {
            user: AuthUser | null
            isImpersonating?: boolean
            impersonator?: { user: AuthUser | null } | null
        }) => void
    }
}

export const useAuthStore = create<AuthState>()((set, get) => {
    const userCookieState = getCookie(USER_DATA)
    const rawUser = userCookieState ? JSON.parse(userCookieState) : null
    const initUser = normalizeUser(rawUser)

    return {
        auth: {
            user: initUser,
            isSessionActive: Boolean(initUser),
            accessToken: initUser ? 'session' : '',
            setUser: (user) => {
                const normalizedUser = normalizeUser(user)
                if (normalizedUser) {
                    setCookie(USER_DATA, JSON.stringify(normalizedUser))
                } else {
                    removeCookie(USER_DATA)
                }
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: normalizedUser,
                        isSessionActive: Boolean(normalizedUser),
                        accessToken: normalizedUser ? 'session' : '',
                    },
                }))
            },
            setSessionActive: (active) =>
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        isSessionActive: active,
                        accessToken: active ? 'session' : '',
                    },
                })),
            setAccessToken: () => {
                get().auth.setSessionActive(true)
            },
            resetAccessToken: () => {
                get().auth.setSessionActive(false)
            },
            reset: () =>
                set((state) => {
                    if (!state.auth.user && !state.auth.isSessionActive && !state.auth.isImpersonating) {
                        return state
                    }
                    removeCookie(USER_DATA)
                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            user: null,
                            isSessionActive: false,
                            accessToken: '',
                            isImpersonating: false,
                            impersonator: null,
                        },
                    }
                }),
            isImpersonating: false,
            impersonator: null,
            hydrateFromSession: ({ user, isImpersonating, impersonator }) => {
                const normalizedUser = normalizeUser(user)
                const nextIsImpersonating = Boolean(isImpersonating)
                const nextImpersonator = impersonator
                    ? { user: normalizeUser(impersonator.user) }
                    : null

                const current = get().auth
                const sameUser =
                    (current.user?.id ?? null) === (normalizedUser?.id ?? null) &&
                    current.isSessionActive === Boolean(normalizedUser) &&
                    current.isImpersonating === nextIsImpersonating &&
                    (current.impersonator?.user?.id ?? null) === (nextImpersonator?.user?.id ?? null)

                if (sameUser) {
                    return
                }

                if (normalizedUser) {
                    setCookie(USER_DATA, JSON.stringify(normalizedUser))
                }

                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: normalizedUser,
                        isSessionActive: Boolean(normalizedUser),
                        accessToken: normalizedUser ? 'session' : '',
                        isImpersonating: nextIsImpersonating,
                        impersonator: nextImpersonator,
                    },
                }))
            },
            setImpersonating: (targetUser) => {
                const normalizedTargetUser = normalizeUser(targetUser) as AuthUser
                const currentAuth = get().auth

                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: normalizedTargetUser,
                        isSessionActive: true,
                        accessToken: 'session',
                        isImpersonating: true,
                        impersonator: currentAuth.user
                            ? { user: currentAuth.user }
                            : state.auth.impersonator,
                    },
                }))

                setCookie(USER_DATA, JSON.stringify(normalizedTargetUser))
            },
            stopImpersonating: async () => {
                await fetch('/bff/auth/stop-impersonate', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                })
                window.location.replace('/dashboard')
            },
        },
    }
})