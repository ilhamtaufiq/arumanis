import { useCallback, useEffect, useState } from 'react'
import {
    dismissBuildUpdate,
    fetchRemoteBuildInfo,
    getEmbeddedBuildInfo,
    getServedBuildInfoFromDOM,
    hasNewBuildAvailable,
    isBuildUpdateDismissed,
    rememberBuildId,
    type AppBuildInfo,
} from '@/lib/app-cache'

type AppVersionState = {
    embedded: AppBuildInfo
    remote: AppBuildInfo | null
    updateAvailable: boolean
    isChecking: boolean
}

export function useAppVersionCheck() {
    const [state, setState] = useState<AppVersionState>(() => ({
        embedded: getEmbeddedBuildInfo(),
        remote: null,
        updateAvailable: false,
        isChecking: false,
    }))

    const checkForUpdate = useCallback(async () => {
        if (import.meta.env.DEV) {
            return
        }

        setState((current) => ({ ...current, isChecking: true }))

        try {
            const embedded = getEmbeddedBuildInfo()
            const servedFromHtml = getServedBuildInfoFromDOM()

            // If the HTML we received has a different build ID than the JS bundle,
            // we are already running stale code → force update.
            if (servedFromHtml && servedFromHtml.buildId !== embedded.buildId) {
                rememberBuildId(servedFromHtml.buildId)
                const updateAvailable = !isBuildUpdateDismissed(servedFromHtml.buildId)
                setState({
                    embedded,
                    remote: servedFromHtml,
                    updateAvailable,
                    isChecking: false,
                })
                return
            }

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

            const updateAvailable = hasNewBuildAvailable(embedded, remote)
                && !isBuildUpdateDismissed(remote.buildId)

            setState({
                embedded,
                remote,
                updateAvailable,
                isChecking: false,
            })
        } catch {
            setState((current) => ({ ...current, isChecking: false }))
        }
    }, [])

    const dismissUpdate = useCallback(() => {
        if (!state.remote?.buildId) {
            return
        }

        dismissBuildUpdate(state.remote.buildId)
        setState((current) => ({ ...current, updateAvailable: false }))
    }, [state.remote?.buildId])

    useEffect(() => {
        void checkForUpdate()

        const intervalId = window.setInterval(() => {
            void checkForUpdate()
        }, 5 * 60 * 1000)

        const handleFocus = () => {
            void checkForUpdate()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.clearInterval(intervalId)
            window.removeEventListener('focus', handleFocus)
        }
    }, [checkForUpdate])

    return {
        ...state,
        checkForUpdate,
        dismissUpdate,
    }
}