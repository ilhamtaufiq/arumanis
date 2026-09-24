import { ApiError } from '@/lib/api-client'
import type { Kontrak, KontrakImportResult } from '../types'

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

/** Total pagu semua pekerjaan yang tergabung dalam satu kontrak (bisa konsolidasi). */
export function getKontrakTotalPagu(kontrak: Kontrak): number {
    return kontrak.pekerjaans?.reduce((sum, pekerjaan) => sum + (pekerjaan.pagu || 0), 0) || 0
}

/** Durasi masa pelaksanaan (hari) dari SPMK → selesai, atau null bila datanya belum lengkap. */
export function getKontrakMasaHari(
    tglSpmk: string | null | undefined,
    tglSelesai: string | null | undefined,
): number | null {
    if (!tglSpmk || !tglSelesai) return null
    const start = new Date(tglSpmk)
    const end = new Date(tglSelesai)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/** Nama file aman untuk unduhan dokumen (spasi → underscore, fallback "Kontrak"). */
export function sanitizeKontrakFileName(value?: string | null): string {
    return (value || 'Kontrak').replace(/\s+/g, '_')
}

/** Simpan blob hasil export sebagai file unduhan (satu jalur untuk semua tombol export). */
export function downloadKontrakBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
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
