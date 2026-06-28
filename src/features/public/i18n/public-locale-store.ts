import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PublicLocale } from './types'

type PublicLocaleState = {
    locale: PublicLocale
    setLocale: (locale: PublicLocale) => void
}

export const usePublicLocaleStore = create<PublicLocaleState>()(
    persist(
        (set) => ({
            locale: 'id',
            setLocale: (locale) => set({ locale }),
        }),
        {
            name: 'arumanis_public_locale',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)