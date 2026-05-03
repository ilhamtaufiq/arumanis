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

const normalizeRoles = (roles: any[] | undefined | null): string[] => {
    if (!roles) return [];
    return roles.map((r: any) => (typeof r === 'string' ? r : r.name));
};

const normalizePermissions = (permissions: any[] | undefined | null): string[] => {
    if (!permissions) return [];
    return permissions.map((p: any) => (typeof p === 'string' ? p : p.name));
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
    const rawUser = userCookieState ? JSON.parse(userCookieState) : null
    const initUser = normalizeUser(rawUser)

    // Restore impersonator data from cookies if available
    const impersonatorCookieState = getCookie(IMPERSONATOR_DATA)
    const rawImpersonator = impersonatorCookieState ? JSON.parse(impersonatorCookieState) : null
    const initImpersonator = rawImpersonator ? {
        ...rawImpersonator,
        user: normalizeUser(rawImpersonator.user)
    } : null

    return {
        auth: {
            user: initUser,
            setUser: (user) => {
                const normalizedUser = normalizeUser(user)
                if (normalizedUser) {
                    setCookie(USER_DATA, JSON.stringify(normalizedUser))
                } else {
                    removeCookie(USER_DATA)
                }
                set((state) => ({ ...state, auth: { ...state.auth, user: normalizedUser } }))
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
                const normalizedTargetUser = normalizeUser(targetUser) as AuthUser;
                const impersonatorData = {
                    user: currentAuth.user,
                    token: currentAuth.accessToken
                };

                // Store admin data
                setCookie(IMPERSONATOR_DATA, JSON.stringify(impersonatorData));

                // Switch to target user
                setCookie(USER_DATA, JSON.stringify(normalizedTargetUser));
                setCookie(ACCESS_TOKEN, JSON.stringify(targetToken));

                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: normalizedTargetUser,
                        accessToken: targetToken,
                        isImpersonating: true,
                        impersonator: impersonatorData
                    }
                }));
            },
            stopImpersonating: () => {
                const impersonator = get().auth.impersonator;
                if (!impersonator) return;

                const normalizedImpersonatorUser = normalizeUser(impersonator.user);

                // Restore admin data
                setCookie(USER_DATA, JSON.stringify(normalizedImpersonatorUser));
                setCookie(ACCESS_TOKEN, JSON.stringify(impersonator.token));
                removeCookie(IMPERSONATOR_DATA);

                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: normalizedImpersonatorUser,
                        accessToken: impersonator.token,
                        isImpersonating: false,
                        impersonator: null
                    }
                }));

                // Reload page to refresh all data consistent with original admin
                window.location.href = '/';
            }
        },
    }
})