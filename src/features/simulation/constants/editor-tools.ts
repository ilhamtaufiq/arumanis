import {
    MousePointer,
    Circle,
    Droplet,
    Database,
    ArrowRight,
    Cog,
    SlidersHorizontal,
    Trash2,
    type LucideIcon,
} from 'lucide-react'
import type { DrawingMode } from '../hooks/useNetworkEditor'

export interface EditorToolDef {
    mode: DrawingMode
    label: string
    tooltip: string
    shortcut: string
    icon: LucideIcon
    color: string
    cursor: string
}

export const EDITOR_TOOL_GROUPS: { id: string; label: string; tools: EditorToolDef[] }[] = [
    {
        id: 'source',
        label: 'Sumber Air',
        tools: [
            {
                mode: 'reservoir',
                label: 'Reservoir',
                tooltip: 'Sumber air dengan head tetap — tempatkan di titik sumber',
                shortcut: 'R',
                icon: Droplet,
                color: 'text-emerald-500',
                cursor: 'crosshair',
            },
            {
                mode: 'tank',
                label: 'Tangki',
                tooltip: 'Penampung air dengan level variabel',
                shortcut: 'T',
                icon: Database,
                color: 'text-amber-500',
                cursor: 'crosshair',
            },
        ],
    },
    {
        id: 'nodes',
        label: 'Titik Layanan',
        tools: [
            {
                mode: 'junction',
                label: 'Titik Layanan',
                tooltip: 'Titik konsumsi atau percabangan jaringan',
                shortcut: 'J',
                icon: Circle,
                color: 'text-blue-500',
                cursor: 'crosshair',
            },
        ],
    },
    {
        id: 'links',
        label: 'Saluran',
        tools: [
            {
                mode: 'pipe',
                label: 'Pipa',
                tooltip: 'Hubungkan dua titik — klik node awal, lalu node tujuan',
                shortcut: 'P',
                icon: ArrowRight,
                color: 'text-violet-500',
                cursor: 'cell',
            },
        ],
    },
    {
        id: 'equipment',
        label: 'Alat',
        tools: [
            {
                mode: 'pump',
                label: 'Pompa',
                tooltip: 'Dorong aliran antara dua titik',
                shortcut: 'U',
                icon: Cog,
                color: 'text-cyan-500',
                cursor: 'pointer',
            },
            {
                mode: 'valve',
                label: 'Valve',
                tooltip: 'Kendali tekanan atau aliran',
                shortcut: 'W',
                icon: SlidersHorizontal,
                color: 'text-orange-500',
                cursor: 'pointer',
            },
        ],
    },
    {
        id: 'general',
        label: 'Umum',
        tools: [
            {
                mode: 'select',
                label: 'Pilih',
                tooltip: 'Pilih node atau pipa untuk melihat properti',
                shortcut: 'V',
                icon: MousePointer,
                color: 'text-slate-500',
                cursor: 'default',
            },
            {
                mode: 'delete',
                label: 'Hapus',
                tooltip: 'Klik node atau pipa untuk menghapus',
                shortcut: 'D',
                icon: Trash2,
                color: 'text-red-500',
                cursor: 'not-allowed',
            },
        ],
    },
]

export const ALL_EDITOR_TOOLS = EDITOR_TOOL_GROUPS.flatMap((g) => g.tools)

export const TOOL_BY_MODE = Object.fromEntries(
    ALL_EDITOR_TOOLS.map((t) => [t.mode, t]),
) as Record<DrawingMode, EditorToolDef>

export const SHORTCUT_TO_MODE: Record<string, DrawingMode> = Object.fromEntries(
    ALL_EDITOR_TOOLS.map((t) => [t.shortcut.toLowerCase(), t.mode]),
)

export function getModeMessage(
    mode: DrawingMode,
    pipeStartNode: string | null,
): string {
    if (mode === 'pipe' && pipeStartNode) {
        return `Pipa dari ${pipeStartNode}: klik node tujuan, peta untuk belokan, Enter/double-click untuk selesai`
    }
    if (mode === 'pump' && pipeStartNode) {
        return `Pompa dari ${pipeStartNode}: klik node tujuan`
    }
    if (mode === 'valve' && pipeStartNode) {
        return `Valve dari ${pipeStartNode}: klik node tujuan`
    }
    if (mode === 'pipe' || mode === 'pump' || mode === 'valve') {
        return 'Klik node pertama untuk memulai'
    }
    return TOOL_BY_MODE[mode]?.tooltip ?? 'Pilih alat di toolbar'
}

export const WIZARD_STORAGE_KEY = 'arumanis_simulation_wizard_done'