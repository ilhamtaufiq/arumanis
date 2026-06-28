import { Link } from '@tanstack/react-router'
import {
    Calculator,
    ExternalLink,
    FileDown,
    Loader2,
    RefreshCw,
    Save,
    Upload,
    Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProgressEditorToolbarProps = {
    pekerjaanId: number
    weekCount: number
    onWeekCountChange: (value: number) => void
    onRefresh: () => void
    onImportRab: () => void
    onAutoFill: () => void
    onExport: () => void
    hasChanges: boolean
    submitting: boolean
    onSave: () => void
}

export function ProgressEditorToolbar({
    pekerjaanId,
    weekCount,
    onWeekCountChange,
    onRefresh,
    onImportRab,
    onAutoFill,
    onExport,
    hasChanges,
    submitting,
    onSave,
}: ProgressEditorToolbarProps) {
    return (
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2">
            <div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
                    Laporan Progress Fisik
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    Kelola detail progress mingguan untuk setiap item pekerjaan.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-background/50 backdrop-blur-sm border rounded-full px-4 py-1.5 gap-3 shadow-sm">
                    <Label
                        htmlFor="weekCount"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Total Minggu
                    </Label>
                    <Input
                        id="weekCount"
                        type="number"
                        min={1}
                        max={52}
                        value={weekCount}
                        onChange={(e) => onWeekCountChange(parseInt(e.target.value, 10) || 1)}
                        className="w-14 h-8 bg-transparent border-none focus-visible:ring-0 text-center font-bold"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full shadow-sm"
                        onClick={onRefresh}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-full gap-2 shadow-sm border-primary/20 hover:border-primary/50 text-primary"
                        onClick={onImportRab}
                    >
                        <Upload className="h-4 w-4" />
                        Import RAB
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-full gap-2 shadow-sm border-purple-500/20 hover:border-purple-500/50 text-purple-600 bg-purple-50/50 hover:bg-purple-100/50"
                        onClick={onAutoFill}
                    >
                        <Wand2 className="h-4 w-4" />
                        Auto-Fill Rencana
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-full gap-2 shadow-sm border-primary/20 hover:border-primary/50"
                        onClick={onExport}
                    >
                        <FileDown className="h-4 w-4 text-primary" />
                        Export
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-full gap-2 shadow-sm"
                        asChild
                    >
                        <Link
                            to="/rab-analyzer"
                            search={{ pekerjaanId: String(pekerjaanId) }}
                        >
                            <Calculator className="h-4 w-4" />
                            Analisa RAB
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full shadow-sm"
                        onClick={() => window.open(`/pekerjaan/${pekerjaanId}/progress`, '_blank')}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>

                    {hasChanges ? (
                        <Button
                            onClick={onSave}
                            disabled={submitting}
                            className="rounded-full gap-2 shadow-lg bg-primary hover:bg-primary/90 transition-all"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Simpan Perubahan
                        </Button>
                    ) : null}
                </div>
            </div>
        </CardHeader>
    )
}