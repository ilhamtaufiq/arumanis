import { useEffect } from 'react'
import { getPublicMessages } from './messages'
import { usePublicLocaleStore } from './public-locale-store'
import type { PublicLocale } from './types'

export function usePublicLocale() {
    const locale = usePublicLocaleStore((state) => state.locale)
    const setLocale = usePublicLocaleStore((state) => state.setLocale)
    const messages = getPublicMessages(locale)

    useEffect(() => {
        document.documentElement.lang = locale
    }, [locale])

    return {
        locale,
        setLocale,
        messages,
    }
}

export function isPublicLocale(value: string): value is PublicLocale {
    return value === 'id' || value === 'en'
}