import { useEffect } from 'react'

/**
 * Puspen uses a fixed light palette. Strip global dark mode while the route is mounted.
 */
export function usePuspenLightTheme() {
    useEffect(() => {
        const root = document.documentElement
        const hadDark = root.classList.contains('dark')

        root.classList.remove('dark')
        root.classList.add('light')

        return () => {
            root.classList.remove('light')
            if (hadDark) {
                root.classList.add('dark')
            }
        }
    }, [])
}