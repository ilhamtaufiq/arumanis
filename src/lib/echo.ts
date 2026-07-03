import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

type EchoInstance = Echo<'reverb'>

declare global {
    interface Window {
        Pusher: typeof Pusher
    }
}

let echoInstance: EchoInstance | null = null

export function isEchoEnabled(): boolean {
    return Boolean(import.meta.env.VITE_REVERB_APP_KEY?.trim())
}

export function getEcho(): EchoInstance | null {
    if (!isEchoEnabled()) {
        return null
    }

    if (!echoInstance) {
        window.Pusher = Pusher

        const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http'
        const forceTLS = scheme === 'https'
        const host = import.meta.env.VITE_REVERB_HOST ?? window.location.hostname
        const port = Number(import.meta.env.VITE_REVERB_PORT ?? (forceTLS ? 443 : 8080))

        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/bff/broadcasting/auth',
            auth: {
                headers: {
                    Accept: 'application/json',
                },
            },
        })
    }

    return echoInstance
}

export function disconnectEcho(): void {
    echoInstance?.disconnect()
    echoInstance = null
}