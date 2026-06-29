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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { SimulationSettings } from '../types'

interface SimulationSettingsPanelProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    settings: SimulationSettings
    onChange: (settings: SimulationSettings) => void
    readOnly?: boolean
}

export function SimulationSettingsPanel({
    open,
    onOpenChange,
    settings,
    onChange,
    readOnly = false,
}: SimulationSettingsPanelProps) {
    const update = (patch: Partial<SimulationSettings>) => {
        if (readOnly) return
        onChange({ ...settings, ...patch })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md z-[9999]">
                <DialogHeader>
                    <DialogTitle>Pengaturan Simulasi</DialogTitle>
                    <DialogDescription>
                        Parameter EPANET untuk durasi, timestep, satuan, dan headloss.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="sim-duration">Durasi (jam)</Label>
                            <Input
                                id="sim-duration"
                                type="number"
                                min={1}
                                max={168}
                                value={settings.duration}
                                disabled={readOnly}
                                onChange={(e) =>
                                    update({ duration: Math.max(1, Number(e.target.value) || 1) })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sim-hydraulic">Hydraulic timestep (jam)</Label>
                            <Input
                                id="sim-hydraulic"
                                type="number"
                                min={0.25}
                                step={0.25}
                                value={settings.hydraulic_timestep}
                                disabled={readOnly}
                                onChange={(e) =>
                                    update({
                                        hydraulic_timestep: Math.max(
                                            0.25,
                                            Number(e.target.value) || 1,
                                        ),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sim-pattern">Pattern timestep (jam)</Label>
                            <Input
                                id="sim-pattern"
                                type="number"
                                min={0.25}
                                step={0.25}
                                value={settings.pattern_timestep}
                                disabled={readOnly}
                                onChange={(e) =>
                                    update({
                                        pattern_timestep: Math.max(
                                            0.25,
                                            Number(e.target.value) || 1,
                                        ),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sim-report">Report timestep (jam)</Label>
                            <Input
                                id="sim-report"
                                type="number"
                                min={0.25}
                                step={0.25}
                                value={settings.report_timestep}
                                disabled={readOnly}
                                onChange={(e) =>
                                    update({
                                        report_timestep: Math.max(
                                            0.25,
                                            Number(e.target.value) || 1,
                                        ),
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Satuan</Label>
                            <Select
                                value={settings.units}
                                disabled={readOnly}
                                onValueChange={(value) =>
                                    update({ units: value as SimulationSettings['units'] })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LPS">LPS</SelectItem>
                                    <SelectItem value="GPM">GPM</SelectItem>
                                    <SelectItem value="MGD">MGD</SelectItem>
                                    <SelectItem value="CMH">CMH</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Headloss</Label>
                            <Select
                                value={settings.headloss}
                                disabled={readOnly}
                                onValueChange={(value) =>
                                    update({ headloss: value as SimulationSettings['headloss'] })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="H-W">Hazen-Williams</SelectItem>
                                    <SelectItem value="D-W">Darcy-Weisbach</SelectItem>
                                    <SelectItem value="C-M">Chezy-Manning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}