import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppSettingsState {
    tahunAnggaran: string
    setTahunAnggaran: (year: string) => void
}

export const useAppSettingsStore = create<AppSettingsState>()(
    persist(
        (set) => ({
            tahunAnggaran: new Date().getFullYear().toString(),
            setTahunAnggaran: (year) => set({ tahunAnggaran: year }),
        }),
        {
            name: 'arumanis-app-settings',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
