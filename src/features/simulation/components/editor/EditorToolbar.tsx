import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { HelpCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DrawingMode } from '../../hooks/useNetworkEditor'
import { EDITOR_TOOL_GROUPS } from '../../constants/editor-tools'

interface EditorToolbarProps {
    drawingMode: DrawingMode
    canEdit: boolean
    allowedModes?: DrawingMode[] | null
    onModeChange: (mode: DrawingMode) => void
    onShowShortcuts: () => void
    onStartWizard: () => void
    pipeStartNode: string | null
    onCancelLink: () => void
    onFinishLink?: () => void
    compact?: boolean
}

export function EditorToolbar({
    drawingMode,
    canEdit,
    allowedModes,
    onModeChange,
    onShowShortcuts,
    onStartWizard,
    pipeStartNode,
    onCancelLink,
    onFinishLink,
    compact = false,
}: EditorToolbarProps) {
    const isModeAllowed = (mode: DrawingMode) =>
        !allowedModes || allowedModes.includes(mode)

    const content = (
        <TooltipProvider delayDuration={300}>
            <div className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={onStartWizard}
                    disabled={!canEdit}
                >
                    <Sparkles className="h-4 w-4" />
                    Mulai Cepat
                </Button>

                {EDITOR_TOOL_GROUPS.map((group) => (
                    <div key={group.id} className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.label}
                        </p>
                        <div
                            className={cn(
                                'grid gap-2',
                                compact ? 'grid-cols-4' : 'grid-cols-2',
                            )}
                        >
                            {group.tools.map((tool) => {
                                const Icon = tool.icon
                                const allowed = isModeAllowed(tool.mode)
                                const disabled =
                                    (!canEdit && tool.mode !== 'select') || !allowed

                                return (
                                    <Tooltip key={tool.mode}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={
                                                    drawingMode === tool.mode
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className={cn(
                                                    'flex-col gap-1',
                                                    compact ? 'h-14' : 'h-16',
                                                    drawingMode !== tool.mode && tool.color,
                                                    !allowed && 'opacity-40',
                                                )}
                                                disabled={disabled}
                                                onClick={() => onModeChange(tool.mode)}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="text-[10px] leading-tight text-center">
                                                    {tool.label}
                                                </span>
                                                <span className="text-[9px] opacity-60">
                                                    {tool.shortcut}
                                                </span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[220px]">
                                            <p className="font-medium">{tool.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {tool.tooltip}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {pipeStartNode && (
                    <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50 p-2 dark:border-violet-900 dark:bg-violet-950/40">
                        <p className="text-xs text-violet-700 dark:text-violet-300">
                            Menggambar dari <span className="font-mono">{pipeStartNode}</span>
                        </p>
                        <div className="flex gap-2">
                            {onFinishLink && (
                                <Button size="sm" className="flex-1 h-7 text-xs" onClick={onFinishLink}>
                                    Selesai (Enter)
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-7 text-xs"
                                onClick={onCancelLink}
                            >
                                Batal (Esc)
                            </Button>
                        </div>
                    </div>
                )}

                <Separator />

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-muted-foreground"
                    onClick={onShowShortcuts}
                >
                    <HelpCircle className="h-4 w-4" />
                    Pintasan keyboard (?)
                </Button>
            </div>
        </TooltipProvider>
    )

    if (compact) {
        return content
    }

    return (
        <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Toolbar</CardTitle>
                <CardDescription>Pilih alat, lalu klik peta</CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    )
}