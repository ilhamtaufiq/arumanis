import { AlertTriangle, Info } from 'lucide-react'
import type { DrawingMode } from '../../hooks/useNetworkEditor'
import { getModeMessage, TOOL_BY_MODE } from '../../constants/editor-tools'

interface MapModeBannerProps {
    drawingMode: DrawingMode
    pipeStartNode: string | null
    snapNodeId: string | null
    canEdit: boolean
}

export function MapModeBanner({
    drawingMode,
    pipeStartNode,
    snapNodeId,
    canEdit,
}: MapModeBannerProps) {
    if (!canEdit) {
        return (
            <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/95 px-4 py-2 text-sm text-amber-900 shadow-lg backdrop-blur dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-100">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Mode baca saja
            </div>
        )
    }

    const tool = TOOL_BY_MODE[drawingMode]
    const message = getModeMessage(drawingMode, pipeStartNode)

    return (
        <div
            className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 flex max-w-[90%] flex-col items-center gap-1 rounded-lg border bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur"
            style={{ cursor: tool?.cursor }}
        >
            <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{tool?.label ?? drawingMode}</span>
            </div>
            <span className="text-xs text-muted-foreground text-center">{message}</span>
            {snapNodeId && (
                <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
                    Snap ke {snapNodeId}
                </span>
            )}
        </div>
    )
}