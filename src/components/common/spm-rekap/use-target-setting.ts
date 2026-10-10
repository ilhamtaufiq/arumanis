import { useEffect, useState } from 'react'

export type SpmTargetSetting = { targetPercent: number; targetYear: number }

/** Default: 100% pada akhir periode RPJMD 2025–2029 */
export const DEFAULT_TARGET_SETTING: SpmTargetSetting = { targetPercent: 100, targetYear: 2029 }

/** Pengaturan target disimpan per modul di browser (preferensi tampilan pengguna). */
export function useTargetSetting(storageKey: string) {
    const [setting, setSetting] = useState<SpmTargetSetting>(() => {
        try {
            const raw = localStorage.getItem(storageKey)
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<SpmTargetSetting>
                const pct = Number(parsed.targetPercent)
                const year = Number(parsed.targetYear)
                if (pct > 0 && pct <= 100 && year >= 2000) return { targetPercent: pct, targetYear: year }
            }
        } catch {
            // abaikan: storage tidak tersedia / rusak
        }
        return DEFAULT_TARGET_SETTING
    })

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(setting))
        } catch {
            // abaikan
        }
    }, [storageKey, setting])

    return [setting, setSetting] as const
}
