import type { SpmCoverageTier } from '@/lib/spm-rekap'

export function formatNumber(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '-'
    return Math.round(value).toLocaleString('id-ID')
}

export function formatPercent(value: number | null | undefined, digits = 1) {
    if (value == null || !Number.isFinite(value)) return '—'
    return `${value.toLocaleString('id-ID', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })}%`
}

export function formatSigned(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '—'
    const rounded = Math.round(value)
    if (rounded === 0) return '0'
    return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toLocaleString('id-ID')}`
}

export function formatSignedPercent(value: number | null | undefined, digits = 1) {
    if (value == null || !Number.isFinite(value)) return '—'
    const sign = value > 0 ? '+' : value < 0 ? '−' : ''
    return `${sign}${Math.abs(value).toLocaleString('id-ID', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })}%`
}

export const TIER_TEXT: Record<SpmCoverageTier, string> = {
    full: 'text-emerald-700 dark:text-emerald-400',
    high: 'text-emerald-600 dark:text-emerald-400',
    mid: 'text-amber-600 dark:text-amber-400',
    low: 'text-rose-600 dark:text-rose-400',
    none: 'text-muted-foreground',
}

export const TIER_BAR: Record<SpmCoverageTier, string> = {
    full: 'bg-emerald-600',
    high: 'bg-emerald-500',
    mid: 'bg-amber-500',
    low: 'bg-rose-500',
    none: 'bg-slate-300 dark:bg-slate-700',
}

export const TIER_DOT: Record<SpmCoverageTier, string> = TIER_BAR

export function downloadCsv(filename: string, csv: string) {
    // BOM agar Excel membaca UTF-8 dengan benar
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
