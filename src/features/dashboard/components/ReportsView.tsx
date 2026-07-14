import { useState } from 'react'
import {
    FileSpreadsheet,
    FileText,
    ArrowRight,
    Loader2,
    type LucideIcon,
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { REPORT_CATEGORIES, type ReportFormat, type ReportId } from '../lib/report-catalog'
import { runReportExport } from '../lib/report-exports'

interface ReportCardProps {
    title: string
    description: string
    icon: LucideIcon
    formats: ReportFormat[]
    tags: string[]
    exportingFormat: ReportFormat | null
    onExport: (format: ReportFormat) => void
}

function ReportCard({
    title,
    description,
    icon: Icon,
    formats,
    tags,
    exportingFormat,
    onExport,
}: ReportCardProps) {
    const isBusy = exportingFormat != null

    return (
        <Card className="group overflow-hidden border-muted/50 transition-all hover:shadow-md">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/50 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold leading-none transition-colors group-hover:text-primary sm:text-xl">
                        {title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1 pt-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="h-4 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="min-h-[40px] text-sm leading-relaxed">
                    {description}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
                {formats.includes('pdf') ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 gap-2 border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                        disabled={isBusy}
                        onClick={() => onExport('pdf')}
                    >
                        {exportingFormat === 'pdf' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4 text-red-500" />
                        )}
                        PDF
                    </Button>
                ) : null}
                {formats.includes('excel') ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 gap-2 border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                        disabled={isBusy}
                        onClick={() => onExport('excel')}
                    >
                        {exportingFormat === 'excel' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                        )}
                        Excel
                    </Button>
                ) : null}
            </CardFooter>
        </Card>
    )
}

export function ReportsView({ year }: { year: string }) {
    const [exporting, setExporting] = useState<{ id: ReportId; format: ReportFormat } | null>(null)

    const handleExport = async (reportId: ReportId, format: ReportFormat, title: string) => {
        setExporting({ id: reportId, format })
        const toastId = toast.loading(`Menyiapkan ${title} (${format.toUpperCase()})…`)
        try {
            await runReportExport(reportId, format, year)
            toast.success(`${title} berhasil diunduh`, { id: toastId })
        } catch (error) {
            toast.error(getApiErrorMessage(error, `Gagal mengunduh ${title}`), { id: toastId })
        } finally {
            setExporting(null)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="border-primary/15 bg-primary/5">
                <CardContent className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold">Unduh laporan TA {year}</p>
                        <p className="text-xs text-muted-foreground">
                            Semua tombol di bawah terhubung ke data live. Export besar bisa memakan waktu beberapa detik.
                        </p>
                    </div>
                    <Badge variant="outline" className="w-fit border-primary/30 text-primary">
                        {REPORT_CATEGORIES.reduce((n, c) => n + c.items.length, 0)} jenis laporan
                    </Badge>
                </CardContent>
            </Card>

            {REPORT_CATEGORIES.map((cat) => (
                <div key={cat.category} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                            {cat.category}
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-muted to-transparent" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {cat.items.map((report) => (
                            <ReportCard
                                key={report.id}
                                title={report.title}
                                description={report.description(year)}
                                icon={report.icon}
                                formats={report.formats}
                                tags={report.tags}
                                exportingFormat={
                                    exporting?.id === report.id ? exporting.format : null
                                }
                                onExport={(format) =>
                                    handleExport(report.id, format, report.title)
                                }
                            />
                        ))}
                    </div>
                </div>
            ))}

            <Card className="border-2 border-dashed bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="rounded-full border bg-background p-3 shadow-sm">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-base">Butuh laporan kustom?</CardTitle>
                        <CardDescription>
                            Ajukan format baru lewat tiket, atau unduh dari modul sumber (Pekerjaan, Kontrak, SPM).
                        </CardDescription>
                    </div>
                    <Button variant="link" className="mt-1 text-primary" asChild>
                        <a href="/tiket">Buat tiket permintaan laporan</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
