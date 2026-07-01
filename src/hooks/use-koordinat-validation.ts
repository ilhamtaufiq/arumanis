import { useEffect, useState } from 'react'
import { validateKoordinat } from '@/lib/koordinat-api'
import { parseKoordinatLoose } from '@/lib/koordinat-utils'

export type KoordinatValidationState = {
    isValid: boolean
    message: string
    loading: boolean
} | null

export function useKoordinatValidation(
    pekerjaanId: number | undefined,
    koordinat: string,
    debounceMs = 400,
): KoordinatValidationState {
    const [validation, setValidation] = useState<KoordinatValidationState>(null)

    useEffect(() => {
        if (!pekerjaanId || pekerjaanId <= 0 || !koordinat.trim()) {
            setValidation(null)
            return
        }

        if (!parseKoordinatLoose(koordinat)) {
            setValidation({
                isValid: false,
                message: 'Format koordinat tidak valid. Gunakan lat, lng.',
                loading: false,
            })
            return
        }

        let cancelled = false
        setValidation({ isValid: false, message: 'Memvalidasi koordinat...', loading: true })

        const timer = window.setTimeout(() => {
            validateKoordinat(pekerjaanId, koordinat)
                .then((result) => {
                    if (cancelled) return
                    setValidation({
                        isValid: Boolean(result.validasi_koordinat),
                        message: result.validasi_koordinat_message || 'Validasi selesai.',
                        loading: false,
                    })
                })
                .catch(() => {
                    if (cancelled) return
                    setValidation({
                        isValid: false,
                        message: 'Gagal memvalidasi koordinat.',
                        loading: false,
                    })
                })
        }, debounceMs)

        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }
    }, [pekerjaanId, koordinat, debounceMs])

    return validation
}