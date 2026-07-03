import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getEcho } from '@/lib/echo'
import { useAuthStore } from '@/stores/auth-stores'
import {
    closeLiveChatThread,
    getLiveChatInbox,
    getLiveChatMessages,
    getMyLiveChatThread,
    sendLiveChatMessage,
} from '../api/live-chat'
import type { LiveChatMessage, LiveChatThread } from '../types'

function isAdminRole(roles: string[]) {
    return roles.includes('admin')
}

function appendMessage(prev: LiveChatMessage[], incoming: LiveChatMessage) {
    if (prev.some((item) => item.id === incoming.id)) {
        return prev
    }

    return [...prev, incoming].sort((a, b) => a.id - b.id)
}

export function useLiveChat({ enabled = true }: { enabled?: boolean } = {}) {
    const queryClient = useQueryClient()
    const currentUserId = useAuthStore((state) => state.auth.user?.id)
    const roles = useAuthStore((state) => state.auth.user?.roles ?? [])
    const isAdmin = useMemo(() => isAdminRole(roles), [roles])

    const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
    const [messages, setMessages] = useState<LiveChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastMessageIdRef = useRef(0)

    const myThreadQuery = useQuery({
        queryKey: ['live-chat', 'thread'],
        queryFn: getMyLiveChatThread,
        enabled: enabled && !isAdmin,
        staleTime: 30_000,
    })

    const inboxQuery = useQuery({
        queryKey: ['live-chat', 'inbox'],
        queryFn: getLiveChatInbox,
        enabled: enabled && isAdmin,
        staleTime: 30_000,
    })

    const activeThread = useMemo(() => {
        if (isAdmin) {
            const inbox = inboxQuery.data?.data ?? []
            return inbox.find((thread) => thread.id === activeThreadId) ?? null
        }
        return myThreadQuery.data?.data ?? null
    }, [activeThreadId, inboxQuery.data?.data, isAdmin, myThreadQuery.data?.data])

    const resolvedThreadId = isAdmin ? activeThreadId : activeThread?.id ?? null

    const loadMessages = useCallback(
        async (threadId: number, reset = false) => {
            const afterId = reset ? 0 : lastMessageIdRef.current
            const response = await getLiveChatMessages(threadId, afterId > 0 ? afterId : undefined)

            if (reset) {
                setMessages(response.data)
            } else if (response.data.length > 0) {
                setMessages((prev) => {
                    let merged = prev
                    for (const item of response.data) {
                        merged = appendMessage(merged, item)
                    }
                    return merged
                })
            }

            if (response.data.length > 0) {
                lastMessageIdRef.current = Math.max(
                    lastMessageIdRef.current,
                    ...response.data.map((item) => item.id),
                )
            }

            return response.data
        },
        [],
    )

    useEffect(() => {
        if (!enabled || !resolvedThreadId) return

        lastMessageIdRef.current = 0
        void loadMessages(resolvedThreadId, true)
    }, [enabled, loadMessages, resolvedThreadId])

    useEffect(() => {
        if (!enabled) return

        const echo = getEcho()
        if (!echo) return

        const threadChannelName = resolvedThreadId ? `live-chat.thread.${resolvedThreadId}` : null
        const threadChannel = threadChannelName ? echo.private(threadChannelName) : null
        const inboxChannel = isAdmin ? echo.private('live-chat.inbox') : null

        const handleMessageSent = (payload: { message?: LiveChatMessage }) => {
            const message = payload.message
            if (!message?.id) return

            if (resolvedThreadId && message.thread_id === resolvedThreadId) {
                setMessages((prev) => appendMessage(prev, message))
                lastMessageIdRef.current = Math.max(lastMessageIdRef.current, message.id)
            }
        }

        const handleThreadStatus = (payload: { thread?: LiveChatThread }) => {
            if (!payload.thread?.id) return

            if (isAdmin) {
                void queryClient.invalidateQueries({ queryKey: ['live-chat', 'inbox'] })
            } else if (payload.thread.id === resolvedThreadId) {
                void queryClient.invalidateQueries({ queryKey: ['live-chat', 'thread'] })
            }
        }

        const handleInboxUpdated = () => {
            void queryClient.invalidateQueries({ queryKey: ['live-chat', 'inbox'] })
        }

        threadChannel?.listen('.message.sent', handleMessageSent)
        threadChannel?.listen('.thread.status', handleThreadStatus)
        inboxChannel?.listen('.inbox.updated', handleInboxUpdated)

        return () => {
            threadChannel?.stopListening('.message.sent')
            threadChannel?.stopListening('.thread.status')
            inboxChannel?.stopListening('.inbox.updated')

            if (threadChannelName) {
                echo.leave(threadChannelName)
            }
            if (isAdmin) {
                echo.leave('live-chat.inbox')
            }
        }
    }, [enabled, isAdmin, queryClient, resolvedThreadId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [messages, isSending])

    useEffect(() => {
        if (!isAdmin && myThreadQuery.data?.data?.id) {
            setActiveThreadId(myThreadQuery.data.data.id)
        }
    }, [isAdmin, myThreadQuery.data?.data?.id])

    const handleSend = useCallback(async () => {
        if (!input.trim() || !resolvedThreadId || isSending) return

        const outgoing = input.trim()
        setInput('')
        setIsSending(true)

        try {
            const response = await sendLiveChatMessage(resolvedThreadId, outgoing)
            setMessages((prev) => appendMessage(prev, response.data))
            lastMessageIdRef.current = Math.max(lastMessageIdRef.current, response.data.id)

            if (isAdmin) {
                await queryClient.invalidateQueries({ queryKey: ['live-chat', 'inbox'] })
            } else {
                await queryClient.invalidateQueries({ queryKey: ['live-chat', 'thread'] })
            }
        } catch (error: unknown) {
            setInput(outgoing)
            const message = error instanceof Error ? error.message : 'Gagal mengirim pesan.'
            toast.error(message)
        } finally {
            setIsSending(false)
        }
    }, [input, isAdmin, isSending, queryClient, resolvedThreadId])

    const handleCloseThread = useCallback(async () => {
        if (!resolvedThreadId) return

        try {
            await closeLiveChatThread(resolvedThreadId)
            if (isAdmin) {
                await queryClient.invalidateQueries({ queryKey: ['live-chat', 'inbox'] })
            } else {
                await queryClient.invalidateQueries({ queryKey: ['live-chat', 'thread'] })
            }
            toast.success('Percakapan ditutup')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menutup percakapan.'
            toast.error(message)
        }
    }, [isAdmin, queryClient, resolvedThreadId])

    const selectThread = useCallback((thread: LiveChatThread) => {
        setActiveThreadId(thread.id)
        setMessages([])
        lastMessageIdRef.current = 0
    }, [])

    const inbox = inboxQuery.data?.data ?? []
    const totalUnread = inbox.reduce((sum, thread) => sum + (thread.unread_count ?? 0), 0)
    const isClosed = activeThread?.status === 'closed'

    return {
        isAdmin,
        currentUserId,
        inbox,
        totalUnread,
        activeThread,
        activeThreadId: resolvedThreadId,
        messages,
        input,
        setInput,
        isSending,
        isClosed,
        isLoading: isAdmin ? inboxQuery.isLoading : myThreadQuery.isLoading,
        scrollRef,
        handleSend,
        handleCloseThread,
        selectThread,
    }
}