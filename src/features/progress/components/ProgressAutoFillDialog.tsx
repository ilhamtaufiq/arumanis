import { Calendar, ChevronRight, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { ScheduledGroup } from '../utils/construction-scheduler'

type ProgressAutoFillDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    previewGroups: ScheduledGroup[]
    detectedProjectType: string
    weekCount: number
    applying: boolean
    onApply: () => void
}

export function ProgressAutoFillDialog({
    open,
    onOpenChange,
    previewGroups,
    detectedProjectType,
    weekCount,
    applying,
    onApply,
}: ProgressAutoFillDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <Wand2 className="h-6 w-6 text-purple-600" />
                        </div>
                        Konfirmasi Jadwal Auto-Fill
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Jenis proyek terdeteksi:{' '}
                        <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">
                            {detectedProjectType.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                    {previewGroups.map((group) => (
                        <div key={group.groupId} className="border rounded-xl p-4 bg-card shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-l-xl" />
                            <div className="flex justify-between items-start mb-2 pl-3">
                                <div>
                                    <h4 className="font-bold text-lg">{group.groupName}</h4>
                                    <Badge className="mt-1 bg-purple-100 text-purple-700 border-none">
                                        Fase: {group.fase ? group.fase.nama_fase : 'Tidak Terklasifikasi'}
                                    </Badge>
                                </div>
                                <div className="text-right font-mono text-sm bg-muted px-3 py-1.5 rounded-lg border">
                                    Mg {group.startWeek} <ChevronRight className="inline h-3 w-3 mx-1" /> Mg {group.endWeek}
                                </div>
                            </div>
                            <div className="mt-4 pl-3 flex w-full h-4 bg-muted rounded-full overflow-hidden border">
                                {Array.from({ length: weekCount }).map((_, index) => {
                                    const week = index + 1
                                    const isActive = week >= group.startWeek && week <= group.endWeek
                                    return (
                                        <div
                                            key={week}
                                            className={`flex-1 border-r border-background/20 last:border-0 ${isActive ? 'bg-purple-500' : 'bg-transparent'}`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2 pt-4 border-t">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
                        Batal
                    </Button>
                    <Button
                        onClick={onApply}
                        disabled={applying}
                        className="rounded-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Wand2 className="h-4 w-4" />
                        Terapkan Jadwal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}