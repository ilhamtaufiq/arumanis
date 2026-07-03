import { useAuthStore } from '@/stores/auth-stores'
import { LiveChatWidget } from './live-chat-widget'

export function LiveChatWidgetGate() {
    const isSessionActive = useAuthStore((state) => state.auth.isSessionActive)

    if (!isSessionActive) {
        return null
    }

    return <LiveChatWidget />
}