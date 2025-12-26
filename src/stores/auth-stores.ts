import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_DATA = 'auth_user_data'
const IMPERSONATOR_DATA = 'auth_impersonator_data'

interface AuthUser {
    id: number
    name: string
    email: string
    roles: string[]
    permissions: string[]
    avatar?: string | null
}

interface AuthState {
    auth: {
        user: AuthUser | null
        setUser: (user: AuthUser | null) => void
        accessToken: string
        setAccessToken: (accessToken: string) => void
        resetAccessToken: () => void
        reset: () => void
        // Impersonation
        isImpersonating: boolean
        impersonator: {
            user: AuthUser | null
            token: string
        } | null
        setImpersonating: (targetUser: AuthUser, targetToken: string) => void
        stopImpersonating: () => void
    }
}

export const useAuthStore = create<AuthState>()((set, get) => {
    const cookieState = getCookie(ACCESS_TOKEN)
    const initToken = cookieState ? JSON.parse(cookieState) : ''

    // Restore user data from cookies if available
    const userCookieState = getCookie(USER_DATA)
    const initUser = userCookieState ? JSON.parse(userCookieState) : null

    // Restore impersonator data from cookies if available
    const impersonatorCookieState = getCookie(IMPERSONATOR_DATA)
    const initImpersonator = impersonatorCookieState ? JSON.parse(impersonatorCookieState) : null

    return {
        auth: {
            user: initUser,
            setUser: (user) => {
                if (user) {
                    setCookie(USER_DATA, JSON.stringify(user))
                } else {
                    removeCookie(USER_DATA)
                }
                set((state) => ({ ...state, auth: { ...state.auth, user } }))
            },
            accessToken: initToken,
            setAccessToken: (accessToken) =>
                set((state) => {
                    setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
                    return { ...state, auth: { ...state.auth, accessToken } }
                }),
            resetAccessToken: () =>
                set((state) => {
                    removeCookie(ACCESS_TOKEN)
                    return { ...state, auth: { ...state.auth, accessToken: '' } }
                }),
            reset: () =>
                set((state) => {
                    removeCookie(ACCESS_TOKEN)
                    removeCookie(USER_DATA)
                    removeCookie(IMPERSONATOR_DATA)
                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            user: null,
                            accessToken: '',
                            isImpersonating: false,
                            impersonator: null
                        },
                    }
                }),

            // Impersonation
            isImpersonating: !!initImpersonator,
            impersonator: initImpersonator,
            setImpersonating: (targetUser, targetToken) => {
                const currentAuth = get().auth;
                const impersonatorData = {
                    user: currentAuth.user,
                    token: currentAuth.accessToken
                };

                // Store admin data
                setCookie(IMPERSONATOR_DATA, JSON.stringify(impersonatorData));

                // Switch to target user
                setCookie(USER_DATA, JSON.stringify(targetUser));
                setCookie(ACCESS_TOKEN, JSON.stringify(targetToken));

                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: targetUser,
                        accessToken: targetToken,
                        isImpersonating: true,
                        impersonator: impersonatorData
                    }
                }));
            },
            stopImpersonating: () => {
                const impersonator = get().auth.impersonator;
                if (!impersonator) return;

                // Restore admin data
                setCookie(USER_DATA, JSON.stringify(impersonator.user));
                setCookie(ACCESS_TOKEN, JSON.stringify(impersonator.token));
                removeCookie(IMPERSONATOR_DATA);

                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: impersonator.user,
                        accessToken: impersonator.token,
                        isImpersonating: false,
                        impersonator: null
                    }
                }));

                // Reload page to refresh all data consistent with original admin
                window.location.href = '/users';
            }
        },
    }
})