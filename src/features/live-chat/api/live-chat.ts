import api from '@/lib/api-client'
import type { LiveChatMessage, LiveChatThread } from '../types'

export async function getMyLiveChatThread() {
    return api.get<{ success: boolean; data: LiveChatThread }>('/live-chat/thread')
}

export async function getLiveChatInbox() {
    return api.get<{ success: boolean; data: LiveChatThread[] }>('/live-chat/inbox')
}

export async function getLiveChatMessages(threadId: number, afterId?: number) {
    return api.get<{ success: boolean; data: LiveChatMessage[] }>(
        `/live-chat/threads/${threadId}/messages`,
        { params: afterId ? { after_id: afterId } : undefined },
    )
}

export async function sendLiveChatMessage(threadId: number, message: string) {
    return api.post<{ success: boolean; data: LiveChatMessage }>(
        `/live-chat/threads/${threadId}/messages`,
        { message },
    )
}

export async function closeLiveChatThread(threadId: number) {
    return api.patch<{ success: boolean; data: LiveChatThread }>(
        `/live-chat/threads/${threadId}/close`,
    )
}