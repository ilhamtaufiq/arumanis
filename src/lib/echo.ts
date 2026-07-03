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
                    'X-Requested-With': 'XMLHttpRequest',
                },
            },
            authorizer: (channel) => ({
                authorize: (socketId, callback) => {
                    const body = new URLSearchParams({
                        socket_id: socketId,
                        channel_name: channel.name,
                    })

                    fetch('/bff/broadcasting/auth', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: body.toString(),
                    })
                        .then(async (response) => {
                            if (!response.ok) {
                                const text = await response.text()
                                callback(new Error(text || `Auth failed (${response.status})`), null)
                                return
                            }

                            const data = await response.json()
                            callback(null, data)
                        })
                        .catch((error: unknown) => {
                            const message = error instanceof Error ? error.message : 'Auth request failed'
                            callback(new Error(message), null)
                        })
                },
            }),
        })
    }

    return echoInstance
}

export function disconnectEcho(): void {
    echoInstance?.disconnect()
    echoInstance = null
}