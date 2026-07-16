import { ApiError } from '@/lib/api-client'
import type { Kontrak } from '@/features/kontrak/types'
import type { DocumentRegister, Pekerjaan } from '../types'

export function formatRegisterCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export function formatRegisterDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function getRegisterApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const payload = error.data as { message?: string; error?: string } | undefined
        return payload?.message || payload?.error || error.message || fallback
    }
    if (error instanceof Error && error.message) {
        return error.message
    }
    return fallback
}

export function getOrderedKontraks(item: Pekerjaan): Kontrak[] {
    return [...(item.kontrak ?? [])].sort((a, b) => a.id - b.id)
}

export function getPrimaryKontrak(item: Pekerjaan): Kontrak | undefined {
    return getOrderedKontraks(item)[0]
}

export function findRegisterByType(
    item: Pekerjaan,
    typeId: number,
): DocumentRegister | undefined {
    for (const kontrak of getOrderedKontraks(item)) {
        const register = kontrak.registers?.find((entry) => entry.type_id === typeId)
        if (register) return register
    }
    return undefined
}

export type RegisterPendingConfirmAction =
    | { type: 'delete-register'; id: number }
    | { type: 'delete-type'; id: number }
    | null
