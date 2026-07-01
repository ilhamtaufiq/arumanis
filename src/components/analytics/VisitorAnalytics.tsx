import { useEffect } from 'react'
import { useLocation, useRouterState } from '@tanstack/react-router'
import {
    getUmamiConfig,
    isUmamiEnabled,
    loadUmamiScript,
    trackUmamiPageview,
} from '@/lib/analytics/umami'

function useIsAuthenticatedArea(): boolean {
    return useRouterState({
        select: (state) =>
            state.matches.some((match) =>
                String(match.routeId ?? '').includes('_authenticated'),
            ),
    })
}

export function VisitorAnalytics() {
    const location = useLocation()
    const isAuthenticatedArea = useIsAuthenticatedArea()
    const umamiEnabled = isUmamiEnabled()
    const config = umamiEnabled ? getUmamiConfig() : null
    const pageUrl = location.href

    useEffect(() => {
        if (!config || isAuthenticatedArea) {
            return
        }

        const scriptOrigin = new URL(config.scriptUrl).origin
        const existing = document.querySelector(`link[data-umami-preconnect="${scriptOrigin}"]`)

        if (!existing) {
            const link = document.createElement('link')
            link.rel = 'preconnect'
            link.href = scriptOrigin
            link.crossOrigin = 'anonymous'
            link.dataset.umamiPreconnect = scriptOrigin
            document.head.appendChild(link)
        }

        void loadUmamiScript(config).catch(() => {
            // Ignore — analytics is optional
        })
    }, [config, isAuthenticatedArea])

    useEffect(() => {
        if (!config || isAuthenticatedArea) {
            return
        }

        void loadUmamiScript(config)
            .then(() => {
                trackUmamiPageview(pageUrl)
            })
            .catch(() => {
                // Ignore — analytics is optional
            })
    }, [config, isAuthenticatedArea, pageUrl])

    return null
}