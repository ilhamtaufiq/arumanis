import { Button } from '@/components/ui/button'
import { Circle, Droplet, ArrowRight } from 'lucide-react'

export interface MapContextState {
    lat: number
    lng: number
    x: number
    y: number
}

interface MapContextMenuProps {
    menu: MapContextState | null
    containerRef: React.RefObject<HTMLElement | null>
    onClose: () => void
    onAddJunction: (lat: number, lng: number) => void
    onAddReservoir: (lat: number, lng: number) => void
    onStartPipeFromNearest: (lat: number, lng: number) => void
    canEdit: boolean
}

export function MapContextMenu({
    menu,
    containerRef,
    onClose,
    onAddJunction,
    onAddReservoir,
    onStartPipeFromNearest,
    canEdit,
}: MapContextMenuProps) {
    if (!menu || !canEdit) return null

    const container = containerRef.current
    if (!container) return null

    const rect = container.getBoundingClientRect()
    const left = menu.x - rect.left
    const top = menu.y - rect.top

    return (
        <>
            <div className="absolute inset-0 z-[900]" onClick={onClose} />
            <div
                className="absolute z-[950] min-w-[180px] rounded-md border bg-popover p-1 shadow-md"
                style={{ left, top }}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 text-xs"
                    onClick={() => {
                        onAddJunction(menu.lat, menu.lng)
                        onClose()
                    }}
                >
                    <Circle className="h-3.5 w-3.5 text-blue-500" />
                    Tambah Titik Layanan
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 text-xs"
                    onClick={() => {
                        onAddReservoir(menu.lat, menu.lng)
                        onClose()
                    }}
                >
                    <Droplet className="h-3.5 w-3.5 text-emerald-500" />
                    Tambah Reservoir
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 text-xs"
                    onClick={() => {
                        onStartPipeFromNearest(menu.lat, menu.lng)
                        onClose()
                    }}
                >
                    <ArrowRight className="h-3.5 w-3.5 text-violet-500" />
                    Mulai Pipa dari Node Terdekat
                </Button>
            </div>
        </>
    )
}