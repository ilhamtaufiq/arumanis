import {
    FileDown,
    FileSpreadsheet,
    FileText,
    Users,
    Wallet,
    Activity,
    Calendar,
    ArrowRight,
    type LucideIcon
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

interface ReportCardProps {
    title: string
    description: string
    icon: LucideIcon
    type: 'pdf' | 'excel' | 'both'
    tags: string[]
    onExport: (format: 'pdf' | 'excel') => void
}

function ReportCard({ title, description, icon: Icon, type, tags, onExport }: ReportCardProps) {
    return (
        <Card className="group transition-all hover:shadow-md border-muted/50 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/50 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold leading-none group-hover:text-primary transition-colors">
                        {title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1 pt-2">
                        {tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-sm leading-relaxed min-h-[40px]">
                    {description}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
                {(type === 'pdf' || type === 'both') && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 h-9 border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => onExport('pdf')}
                    >
                        <FileText className="h-4 w-4 text-red-500" />
                        PDF
                    </Button>
                )}
                {(type === 'excel' || type === 'both') && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 h-9 border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => onExport('excel')}
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                        Excel
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export function ReportsView({ year }: { year: string }) {
    const handleExport = (reportName: string, format: 'pdf' | 'excel') => {
        // TODO: Integrate with backend export endpoints
        console.log(`Exporting ${reportName} in ${format} format for year ${year}`)
    }

    const reportCategories = [
        {
            category: "Pekerjaan & Progres",
            items: [
                {
                    title: "Rekap Progres Mingguan",
                    description: "Laporan kemajuan fisik dan keuangan seluruh pekerjaan aktif di tahun " + year,
                    icon: Activity,
                    type: "both" as const,
                    tags: ["OPERASIONAL", "PIMPINAN"]
                },
                {
                    title: "Daftar Pekerjaan per Desa",
                    description: "Distribusi lokasi pekerjaan lengkap dengan koordinat dan nama pengawas.",
                    icon: FileDown,
                    type: "excel" as const,
                    tags: ["DATA-TEKNIS"]
                }
            ]
        },
        {
            category: "Keuangan & Pagu",
            items: [
                {
                    title: "Realisasi Pagu vs Kontrak",
                    description: "Analisis sisa anggaran lelang dan efisiensi pagu kegiatan.",
                    icon: Wallet,
                    type: "excel" as const,
                    tags: ["KEUANGAN", "EVALUASI"]
                },
                {
                    title: "Rekapitulasi Nilai Kontrak",
                    description: "Daftar seluruh kontrak aktif beserta nama penyedia dan nilai borongan.",
                    icon: FileText,
                    type: "pdf" as const,
                    tags: ["ADMINISTRASI"]
                }
            ]
        },
        {
            category: "Penerima Manfaat",
            items: [
                {
                    title: "Daftar Penerima Manfaat",
                    description: "Data BNBA (By Name By Address) penerima manfaat sarana air minum dan sanitasi.",
                    icon: Users,
                    type: "both" as const,
                    tags: ["SOSIAL", "VERIFIKASI"]
                }
            ]
        },
        {
            category: "Lainnya",
            items: [
                {
                    title: "Kalender Kegiatan",
                    description: "Export jadwal pelaksanaan dan deadline dokumen administrasi.",
                    icon: Calendar,
                    type: "pdf" as const,
                    tags: ["PERENCANAAN"]
                }
            ]
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold tracking-tight">Export Center</h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Pusat unduhan laporan terintegrasi. Semua laporan akan disesuaikan dengan **Tahun Anggaran {year}** yang sedang aktif.
                </p>
            </div>

            {reportCategories.map((cat) => (
                <div key={cat.category} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                            {cat.category}
                        </h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-muted to-transparent" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {cat.items.map((report) => (
                            <ReportCard
                                key={report.title}
                                {...report}
                                onExport={(format) => handleExport(report.title, format)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            <Card className="bg-muted/30 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <div className="p-3 rounded-full bg-background border shadow-sm">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-base">Butuh Laporan Kustom?</CardTitle>
                        <CardDescription>
                            Jika Anda membutuhkan format laporan khusus yang belum tersedia, silakan hubungi tim IT.
                        </CardDescription>
                    </div>
                    <Button variant="link" className="mt-2 text-primary">
                        Ajukan Format Laporan Baru
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
