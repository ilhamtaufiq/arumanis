import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type PlacementKind = 'junction' | 'reservoir' | 'tank' | 'pipe'

export interface PlacementTarget {
    kind: PlacementKind
    id: string
    name: string
}

interface PlacementDialogProps {
    target: PlacementTarget | null
    onClose: () => void
    values: {
        demand?: number
        head?: number
        diameter?: number
    }
    onChange: (values: PlacementDialogProps['values']) => void
    onApply: () => void
}

export function PlacementDialog({
    target,
    onClose,
    values,
    onChange,
    onApply,
}: PlacementDialogProps) {
    if (!target) return null

    const titles: Record<PlacementKind, string> = {
        junction: 'Titik Layanan baru',
        reservoir: 'Reservoir baru',
        tank: 'Tangki baru',
        pipe: 'Pipa baru',
    }

    return (
        <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm z-[9999]">
                <DialogHeader>
                    <DialogTitle>{titles[target.kind]}</DialogTitle>
                    <DialogDescription>
                        Atur nilai awal untuk <span className="font-mono">{target.id}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    {target.kind === 'junction' && (
                        <div className="space-y-2">
                            <Label htmlFor="place-demand">Demand (LPS)</Label>
                            <Input
                                id="place-demand"
                                type="number"
                                min={0}
                                step={0.1}
                                value={values.demand ?? 0}
                                onChange={(e) =>
                                    onChange({ ...values, demand: Number(e.target.value) })
                                }
                            />
                        </div>
                    )}
                    {target.kind === 'reservoir' && (
                        <div className="space-y-2">
                            <Label htmlFor="place-head">Head (m)</Label>
                            <Input
                                id="place-head"
                                type="number"
                                min={0}
                                value={values.head ?? 100}
                                onChange={(e) =>
                                    onChange({ ...values, head: Number(e.target.value) })
                                }
                            />
                        </div>
                    )}
                    {target.kind === 'pipe' && (
                        <div className="space-y-2">
                            <Label htmlFor="place-diameter">Diameter (mm)</Label>
                            <Input
                                id="place-diameter"
                                type="number"
                                min={50}
                                value={values.diameter ?? 200}
                                onChange={(e) =>
                                    onChange({ ...values, diameter: Number(e.target.value) })
                                }
                            />
                        </div>
                    )}
                    {target.kind === 'tank' && (
                        <p className="text-sm text-muted-foreground">
                            Properti tangki dapat diubah di panel Properties.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Lewati
                    </Button>
                    <Button onClick={onApply}>Terapkan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}