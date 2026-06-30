export type PresenceApp = 'portal' | 'pengawasan'

export type OnlineUser = {
    id: number
    name: string
    email: string
    avatar: string | null
    gender: string | null
    app?: PresenceApp
    last_seen_at: string
}

export type OnlineUsersResponse = {
    data: OnlineUser[]
    meta: {
        online_window_minutes: number
    }
}