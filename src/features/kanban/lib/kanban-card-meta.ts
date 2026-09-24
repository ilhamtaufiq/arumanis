import type { KanbanCard } from '../types'

/**
 * Dashboard-v2 pilot (kanban): "migrasi" field yang belum ada di API.
 * `priority` / `progress` / `due_date` disimpan di kolom JSON `metadata`
 * (sudah diterima `KanbanController` Laravel: `metadata => nullable|array`),
 * sehingga tanpa perubahan backend.
 */

export type CardPriority = 'high' | 'medium' | 'low'

export const CARD_PRIORITIES: CardPriority[] = ['high', 'medium', 'low']

export const CARD_PRIORITY_LABELS: Record<CardPriority, string> = {
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah',
}

export type CardMeta = {
    priority: CardPriority
    /** null = otomatis (pakai progress pekerjaan bila ada). */
    progress: number | null
    /** ISO date (yyyy-mm-dd) atau null. */
    dueDate: string | null
}

function asRecord(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value as Record<string, unknown>
    }
    return {}
}

function isPriority(value: unknown): value is CardPriority {
    return value === 'high' || value === 'medium' || value === 'low'
}

function clampProgress(value: number): number {
    if (!Number.isFinite(value)) return 0
    return Math.min(100, Math.max(0, Math.round(value)))
}

function parseProgress(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null
    return clampProgress(value)
}

function parseDueDate(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) return null
    const time = Date.parse(value)
    if (Number.isNaN(time)) return null
    return value.slice(0, 10)
}

type MetaSource = Pick<KanbanCard, 'metadata' | 'tiket' | 'pekerjaan'>

export function getCardMeta(card: MetaSource): CardMeta {
    const raw = asRecord(card.metadata)

    const priority: CardPriority = isPriority(raw['priority'])
        ? raw['priority']
        : (isPriority(card.tiket?.prioritas) ? card.tiket?.prioritas : 'medium')

    const explicitProgress = parseProgress(raw['progress'])
    const pekerjaanProgress =
        typeof card.pekerjaan?.progress_total === 'number'
            ? clampProgress(card.pekerjaan.progress_total)
            : null

    return {
        priority,
        progress: explicitProgress ?? pekerjaanProgress,
        dueDate: parseDueDate(raw['due_date']),
    }
}

/** Gabungkan meta form ke metadata existing untuk payload create/update. */
export function buildCardMetadata(
    meta: CardMeta,
    existing?: Record<string, unknown> | null,
): Record<string, unknown> {
    const next: Record<string, unknown> = { ...asRecord(existing) }
    next['priority'] = meta.priority
    if (meta.progress === null) {
        delete next['progress']
    } else {
        next['progress'] = clampProgress(meta.progress)
    }
    if (meta.dueDate === null) {
        delete next['due_date']
    } else {
        next['due_date'] = meta.dueDate
    }
    return next
}

/** Tone avatar generik (gaya v2) dari hash nama — deterministik per nama. */
const AVATAR_TONES = [
    '[&_[data-slot=avatar-fallback]]:bg-zinc-100 [&_[data-slot=avatar-fallback]]:text-zinc-700 dark:[&_[data-slot=avatar-fallback]]:bg-zinc-500/15 dark:[&_[data-slot=avatar-fallback]]:text-zinc-300',
    '[&_[data-slot=avatar-fallback]]:bg-lime-100 [&_[data-slot=avatar-fallback]]:text-lime-700 dark:[&_[data-slot=avatar-fallback]]:bg-lime-500/15 dark:[&_[data-slot=avatar-fallback]]:text-lime-300',
    '[&_[data-slot=avatar-fallback]]:bg-indigo-100 [&_[data-slot=avatar-fallback]]:text-indigo-700 dark:[&_[data-slot=avatar-fallback]]:bg-indigo-500/15 dark:[&_[data-slot=avatar-fallback]]:text-indigo-300',
    '[&_[data-slot=avatar-fallback]]:bg-fuchsia-100 [&_[data-slot=avatar-fallback]]:text-fuchsia-700 dark:[&_[data-slot=avatar-fallback]]:bg-fuchsia-500/15 dark:[&_[data-slot=avatar-fallback]]:text-fuchsia-300',
    '[&_[data-slot=avatar-fallback]]:bg-violet-100 [&_[data-slot=avatar-fallback]]:text-violet-700 dark:[&_[data-slot=avatar-fallback]]:bg-violet-500/15 dark:[&_[data-slot=avatar-fallback]]:text-violet-300',
    '[&_[data-slot=avatar-fallback]]:bg-sky-100 [&_[data-slot=avatar-fallback]]:text-sky-700 dark:[&_[data-slot=avatar-fallback]]:bg-sky-500/15 dark:[&_[data-slot=avatar-fallback]]:text-sky-300',
]

export function avatarToneForName(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i += 1) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0
    }
    return AVATAR_TONES[hash % AVATAR_TONES.length]
}

export function initialsForName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '?').toUpperCase()
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase()
}
