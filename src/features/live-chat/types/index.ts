import type { User } from '@/features/users/types'

export type LiveChatThreadStatus = 'open' | 'closed'

export interface LiveChatMessage {
    id: number
    thread_id: number
    user_id: number
    user?: User
    message: string
    read_at: string | null
    created_at: string
    updated_at: string
}

export interface LiveChatThread {
    id: number
    user_id: number
    user?: User
    status: LiveChatThreadStatus
    last_message_at: string | null
    latest_message?: LiveChatMessage | null
    unread_count?: number
    created_at: string
    updated_at: string
}