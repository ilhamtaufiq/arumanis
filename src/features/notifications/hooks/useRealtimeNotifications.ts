import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getEcho, isEchoEnabled } from '@/lib/echo'
import { useAuthStore } from '@/stores/auth-stores'
import { notificationKeys } from './useNotifications'

type RealtimeNotificationPayload = {
    id?: string
    title?: string
    message?: string
    url?: string | null
    type?: string
    is_banner?: boolean
}

const FALLBACK_EVENT = '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated'

function resolveToast(
    kind: string | undefined,
    title: string,
    options: {
        description?: string
        action?: { label: string; onClick: () => void }
    },
) {
    switch (kind) {
        case 'success':
            return toast.success(title, options)
        case 'warning':
            return toast.warning(title, options)
        case 'error':
            return toast.error(title, options)
        default:
            return toast.info(title, options)
    }
}

/**
 * Subscribe to Laravel private user channel for broadcast notifications.
 * Backend: AppNotification via database + broadcast → channel App.Models.User.{id}
 * Requires VITE_REVERB_APP_KEY (and Reverb running on APIAMIS).
 */
export function useRealtimeNotifications(enabled = true) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const userId = useAuthStore((state) => state.auth.user?.id)
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)
    const channelNameRef = useRef<string | null>(null)
    /** Dedupe if both .notification() and class event fire for the same payload. */
    const lastHandledRef = useRef<{ key: string; at: number } | null>(null)

    useEffect(() => {
        if (!enabled || !isSessionActive || !userId || !isEchoEnabled()) {
            return
        }

        const echo = getEcho()
        if (!echo) return

        const channelName = `App.Models.User.${userId}`
        channelNameRef.current = channelName
        const channel = echo.private(channelName)

        const handleIncoming = (raw: unknown) => {
            const payload = (raw ?? {}) as RealtimeNotificationPayload
            const key =
                payload.id ||
                `${payload.title ?? ''}|${payload.message ?? ''}|${payload.url ?? ''}`

            const now = Date.now()
            const last = lastHandledRef.current
            if (last && last.key === key && now - last.at < 2_000) {
                return
            }
            lastHandledRef.current = { key, at: now }

            void queryClient.invalidateQueries({ queryKey: notificationKeys.all })

            // Banner dialog is driven by unread query; skip toast to avoid double UI.
            if (payload.is_banner) {
                return
            }

            const title = payload.title?.trim() || 'Notifikasi baru'
            const description = payload.message?.trim() || undefined
            const url = payload.url?.trim()

            resolveToast(payload.type, title, {
                description,
                action: url
                    ? {
                          label: 'Lihat',
                          onClick: () => {
                              try {
                                  navigate({ to: url as '/' })
                              } catch {
                                  window.location.assign(url)
                              }
                          },
                      }
                    : undefined,
            })
        }

        // Laravel Echo helper for Illuminate database+broadcast notifications
        channel.notification((notification: RealtimeNotificationPayload) => {
            handleIncoming(notification)
        })

        // Fallback if notification() helper is unavailable on some Echo builds
        channel.listen(FALLBACK_EVENT, (notification: RealtimeNotificationPayload) => {
            handleIncoming(notification)
        })

        return () => {
            try {
                channel.stopListening(FALLBACK_EVENT)
            } catch {
                // ignore cleanup races on disconnect
            }
            echo.leave(channelName)
            if (channelNameRef.current === channelName) {
                channelNameRef.current = null
            }
        }
    }, [enabled, isSessionActive, navigate, queryClient, userId])
}

/** True when client is configured for Reverb/Echo WebSocket. */
export function useNotificationsRealtimeAvailable(): boolean {
    return isEchoEnabled()
}
