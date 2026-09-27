import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, FileQuestion, Lock, ServerCrash, ShieldAlert, Wrench } from 'lucide-react'

type HttpCatImageProps = {
    status: number
    className?: string
    fallback?: ReactNode
    showAttribution?: boolean
}

function getStatusInfo(status: number): { label: string; icon: LucideIcon; color: string; bgGlow: string } {
    if (status === 404) return { label: 'Halaman Tidak Ditemukan', icon: FileQuestion, color: 'text-indigo-400', bgGlow: 'from-indigo-500/25 to-purple-500/25' }
    if (status === 403) return { label: 'Akses Ditolak', icon: ShieldAlert, color: 'text-amber-400', bgGlow: 'from-amber-500/25 to-orange-500/25' }
    if (status === 401) return { label: 'Otentikasi Diperlukan', icon: Lock, color: 'text-rose-400', bgGlow: 'from-rose-500/25 to-red-500/25' }
    if (status === 503) return { label: 'Layanan Dalam Pemeliharaan', icon: Wrench, color: 'text-sky-400', bgGlow: 'from-sky-500/25 to-blue-500/25' }
    if (status >= 500) return { label: 'Gangguan Server', icon: ServerCrash, color: 'text-rose-500', bgGlow: 'from-red-500/25 to-rose-600/25' }
    return { label: `HTTP ${status}`, icon: AlertTriangle, color: 'text-slate-400', bgGlow: 'from-slate-500/25 to-zinc-500/25' }
}

export function HttpCatImage({
    status,
    className = '',
}: HttpCatImageProps) {
    const info = getStatusInfo(status)
    const Icon = info.icon

    return (
        <div className={`relative mx-auto flex flex-col items-center justify-center ${className}`}>
            {/* Ambient Background Glow */}
            <div className={`absolute -inset-4 rounded-full bg-gradient-to-r ${info.bgGlow} blur-2xl opacity-60 animate-pulse`} />

            {/* Glassmorphic Container */}
            <div className="relative flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-8 py-6 backdrop-blur-xl shadow-2xl shadow-black/50">
                <div className="flex items-center gap-3.5 mb-2">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${info.color}`}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <span className="text-6xl font-black tracking-tighter text-white drop-shadow-md">
                        {status}
                    </span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {info.label}
                </span>
            </div>
        </div>
    )
}