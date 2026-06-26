import { useCallback, useEffect, useRef, useState } from 'react'
import {
    fetchRemoteBuildInfo,
    getEmbeddedBuildInfo,
    hardReloadApp,
    hasNewBuildAvailable,
    markReloadPending,
    rememberBuildId,
    type AppBuildInfo,
} from '@/lib/app-cache'

type AppVersionState = {
    embedded: AppBuildInfo
    remote: AppBuildInfo | null
    isChecking: boolean
    isReloading: boolean
}

export function useAppVersionCheck() {
    const reloadStarted = useRef(false)
    const [state, setState] = useState<AppVersionState>(() => ({
        embedded: getEmbeddedBuildInfo(),
        remote: null,
        isChecking: false,
        isReloading: false,
    }))

    const triggerReload = useCallback(async () => {
        if (reloadStarted.current || import.meta.env.DEV) {
            return
        }

        reloadStarted.current = true
        markReloadPending()
        setState((current) => ({ ...current, isReloading: true }))
        await hardReloadApp()
    }, [])

    const checkForUpdate = useCallback(async () => {
        if (import.meta.env.DEV || reloadStarted.current) {
            return
        }

        setState((current) => ({ ...current, isChecking: true }))

        try {
            const embedded = getEmbeddedBuildInfo()

            const remote = await fetchRemoteBuildInfo()

            if (!remote) {
                setState((current) => ({
                    ...current,
                    embedded,
                    isChecking: false,
                }))
                return
            }

            rememberBuildId(remote.buildId)

            if (hasNewBuildAvailable(embedded, remote)) {
                setState({
                    embedded,
                    remote,
                    isChecking: false,
                    isReloading: true,
                })
                await triggerReload()
                return
            }

            setState({
                embedded,
                remote,
                isChecking: false,
                isReloading: false,
            })
        } catch {
            setState((current) => ({ ...current, isChecking: false }))
        }
    }, [triggerReload])

    useEffect(() => {
        const initialDelayId = window.setTimeout(() => {
            void checkForUpdate()
        }, 5000)

        const intervalId = window.setInterval(() => {
            void checkForUpdate()
        }, 3 * 60 * 1000)

        const handleFocus = () => {
            void checkForUpdate()
        }

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                void checkForUpdate()
            }
        }

        window.addEventListener('focus', handleFocus)
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            window.clearTimeout(initialDelayId)
            window.clearInterval(intervalId)
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [checkForUpdate])

    return {
        ...state,
        checkForUpdate,
    }
}