import { ApiError } from '@/lib/api-client'
import type { KontrakImportResult } from '../types'

export function formatKontrakRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
    }).format(value)
}

export function formatKontrakDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function getKontrakApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const data = error.data as { message?: string } | undefined
        return data?.message || error.message || fallback
    }
    if (error instanceof Error) return error.message
    return fallback
}

export function getKontrakImportErrorPayload(error: unknown): KontrakImportResult | undefined {
    if (error instanceof ApiError) {
        return error.data as KontrakImportResult | undefined
    }
    return undefined
}
