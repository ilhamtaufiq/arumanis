import { useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { RefreshCw } from 'lucide-react'
import { jarakTarik, perluSegarkan } from '../lib/tarik-segarkan'

type Props = {
    onSegarkan: () => Promise<unknown> | void
    children: ReactNode
    /** Kelas pembungkus; di layout dipakai flex agar tinggi halaman penuh tetap berjalan. */
    className?: string
}

/**
 * Tarik ke bawah dari posisi paling atas untuk menyegarkan. Hanya aktif saat halaman di atas, supaya
 * tidak bentrok dengan gulir biasa.
 */
export function TarikSegarkan({ onSegarkan, children, className }: Props) {
    const mulai = useRef<number | null>(null)
    const [dy, setDy] = useState(0)
    const [segarkan, setSegarkan] = useState(false)

    const onStart = (e: TouchEvent) => {
        // Sentuhan di dalam dialog, menu, atau area geser horizontal tidak memicu segarkan.
        const target = e.target as HTMLElement
        const dilarang = !!target.closest?.('[role="dialog"],[role="listbox"],[role="menu"],[data-radix-popper-content-wrapper],.overflow-x-auto')
        mulai.current = window.scrollY <= 0 && !segarkan && !dilarang ? e.touches[0].clientY : null
    }
    const onMove = (e: TouchEvent) => {
        if (mulai.current === null) return
        setDy(e.touches[0].clientY - mulai.current)
    }
    const onEnd = async () => {
        const tarikan = dy
        mulai.current = null
        setDy(0)
        if (!perluSegarkan(tarikan)) return
        setSegarkan(true)
        try {
            await onSegarkan()
        } finally {
            setSegarkan(false)
        }
    }

    const tinggi = segarkan ? 48 : jarakTarik(dy)

    return (
        <div className={className} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}>
            <div
                aria-hidden
                className="flex items-center justify-center overflow-hidden text-muted-foreground transition-[height] duration-150"
                style={{ height: tinggi }}
            >
                <RefreshCw className={`h-5 w-5 ${segarkan ? 'animate-spin' : ''}`} />
            </div>
            {children}
        </div>
    )
}
