import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DrawingMode } from '../../hooks/useNetworkEditor'
import type { NetworkState } from '../../hooks/useNetworkEditor'

interface ReadinessIssue {
    id: string
    message: string
    actionLabel?: string
    actionMode?: DrawingMode
}

function getReadinessIssues(network: NetworkState): ReadinessIssue[] {
    const issues: ReadinessIssue[] = []
    const hasNodes =
        network.junctions.length > 0 ||
        network.reservoirs.length > 0 ||
        network.tanks.length > 0
    const hasSource = network.reservoirs.length > 0 || network.tanks.length > 0
    const hasLinks = network.pipes.length > 0 || network.pumps.length > 0

    if (!hasNodes) {
        issues.push({
            id: 'no-nodes',
            message: 'Belum ada node di jaringan',
            actionLabel: 'Tambah Reservoir',
            actionMode: 'reservoir',
        })
    }
    if (!hasSource) {
        issues.push({
            id: 'no-source',
            message: 'Perlu minimal 1 reservoir atau tangki sebagai sumber air',
            actionLabel: 'Tambah Reservoir',
            actionMode: 'reservoir',
        })
    }
    if (!hasLinks) {
        issues.push({
            id: 'no-links',
            message: 'Node belum dihubungkan dengan pipa atau pompa',
            actionLabel: 'Gambar Pipa',
            actionMode: 'pipe',
        })
    }

    return issues
}

interface SimulationReadinessPanelProps {
    network: NetworkState
    onFixAction?: (mode: DrawingMode) => void
}

export function SimulationReadinessPanel({
    network,
    onFixAction,
}: SimulationReadinessPanelProps) {
    const issues = getReadinessIssues(network)
    const ready = issues.length === 0

    if (ready) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Jaringan siap disimulasikan
            </div>
        )
    }

    return (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                Lengkapi jaringan sebelum simulasi
            </div>
            <ul className="space-y-2">
                {issues.map((issue) => (
                    <li
                        key={issue.id}
                        className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
                    >
                        <span>{issue.message}</span>
                        {issue.actionMode && issue.actionLabel && onFixAction && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] shrink-0"
                                onClick={() => onFixAction(issue.actionMode!)}
                            >
                                {issue.actionLabel}
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function isNetworkReadyForSimulation(network: NetworkState): boolean {
    return getReadinessIssues(network).length === 0
}