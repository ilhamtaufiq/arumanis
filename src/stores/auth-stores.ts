import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_DATA = 'auth_user_data'

interface AuthUser {
    id: number
    name: string
    email: string
    roles: string[]
    permissions: string[]
}

interface AuthState {
    auth: {
        user: AuthUser | null
        setUser: (user: AuthUser | null) => void
        accessToken: string
        setAccessToken: (accessToken: string) => void
        resetAccessToken: () => void
        reset: () => void
    }
}

export const useAuthStore = create<AuthState>()((set) => {
    const cookieState = getCookie(ACCESS_TOKEN)
    const initToken = cookieState ? JSON.parse(cookieState) : ''
    
    // Restore user data from cookies if available
    const userCookieState = getCookie(USER_DATA)
    const initUser = userCookieState ? JSON.parse(userCookieState) : null
    
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
                    return {
                        ...state,
                        auth: { ...state.auth, user: null, accessToken: '' },
                    }
                }),
        },
    }
})