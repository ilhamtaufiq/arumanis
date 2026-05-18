import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getOutputSummary } from '../api/output';
import type { OutputRekapItem, OutputSummaryResponse } from '../api/output';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    FileText,
    ChevronDown,
    ChevronRight,
    CircleDot,
    Droplet,
    Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

// Stat card for top-level metrics with premium visuals
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    category,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    category?: string;
}) {
    return (
        <Card 
            className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 group border-l-4"
            style={{ borderLeftColor: color }}
        >
            <div
                className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
            />
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                {title}
                            </span>
                            {category && (
                                <Badge 
                                    variant="outline" 
                                    className="text-[9px] px-1 py-0 font-semibold"
                                    style={{ 
                                        borderColor: `${color}30`, 
                                        color: color,
                                        backgroundColor: `${color}06`
                                    }}
                                >
                                    {category}
                                </Badge>
                            )}
                        </div>
                        <p className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground truncate">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="truncate">{subtitle}</span>
                            </p>
                        )}
                    </div>
                    <div
                        className="rounded-xl p-2.5 transition-all duration-300 group-hover:scale-105 shrink-0"
                        style={{ backgroundColor: `${color}12`, border: `1px solid ${color}18` }}
                    >
                        <Icon
                            className="h-5 w-5"
                            style={{ color }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Expandable row for each komponen group
function RekapRow({ item, index }: { item: OutputRekapItem; index: number }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <TableCell className="w-[40px]">
                    <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {expanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-semibold">{item.komponen}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                        {item.satuan}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <span className="text-lg font-bold tabular-nums">
                        {Number(item.total_volume).toLocaleString('id-ID')}
                    </span>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                        {item.jumlah_pekerjaan} paket
                    </Badge>
                </TableCell>
            </TableRow>

            {/* Expanded detail rows */}
            {expanded && item.pekerjaan.map((p) => (
                <TableRow
                    key={p.id}
                    className="bg-muted/30 border-l-2 border-l-primary/20"
                >
                    <TableCell />
                    <TableCell colSpan={1} className="pl-12">
                        <div className="flex items-center gap-2 text-sm">
                            <CircleDot className="h-3 w-3 text-muted-foreground shrink-0" />
                            <Link
                                to="/output/$id/edit"
                                params={{ id: p.id.toString() }}
                                className="text-primary hover:underline truncate max-w-xs"
                            >
                                {p.nama_paket}
                            </Link>
                        </div>
                    </TableCell>
                    <TableCell />
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {Number(p.volume).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">
                        {p.penerima_is_optional ? (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                Opsional
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                Wajib
                            </Badge>
                        )}
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default function OutputList() {
    const [summary, setSummary] = useState<OutputSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchSummary = async (year?: string) => {
        try {
            setLoading(true);
            const response = await getOutputSummary({ tahun: year });
            setSummary(response);
        } catch (error) {
            console.error('Failed to fetch output summary:', error);
            toast.error('Gagal memuat rekap output');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary(tahunAnggaran);
    }, [tahunAnggaran]);

    if (loading && !summary) {
        return (
            <>
                <Header />
                <Main>
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            <p className="text-muted-foreground text-sm">Memuat rekap output...</p>
                        </div>
                    </div>
                </Main>
            </>
        );
    }

    const rekap = summary?.rekap || [];

    // Calculate dynamic aggregated KPI card metrics
    let totalSRWaterMeter = 0;
    let totalSRSanitasi = 0;
    
    // Sets are used to compute unique package counts
    const airMinumPekIds = new Set<number>();
    const sanitasiPekIds = new Set<number>();

    rekap.forEach((item) => {
        const lowerKomponen = item.komponen.toLowerCase();
        
        // Accumulate Water Meter SR
        if (lowerKomponen.includes('water meter') || 
            (lowerKomponen.includes('sambungan rumah') && item.pekerjaan.some(p => p.sub_bidang === 'Air Minum'))
        ) {
            totalSRWaterMeter += item.total_volume;
        }

        // Accumulate Sanitasi SR
        if (lowerKomponen.includes('sanitasi') || 
            (lowerKomponen.includes('sambungan rumah') && item.pekerjaan.some(p => p.sub_bidang === 'Sanitasi'))
        ) {
            totalSRSanitasi += item.total_volume;
        }

        // Collect unique package/job IDs
        item.pekerjaan.forEach((p) => {
            if (p.sub_bidang === 'Air Minum') {
                airMinumPekIds.add(p.pekerjaan_id || p.id);
            } else if (p.sub_bidang === 'Sanitasi') {
                sanitasiPekIds.add(p.pekerjaan_id || p.id);
            }
        });
    });

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header />

            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Rekap Output</h1>
                        <p className="text-muted-foreground">
                            Ringkasan seluruh output pekerjaan {tahunAnggaran ? `tahun ${tahunAnggaran}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/output/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Output
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Clean, Aggregated 4-Card Stats Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <StatCard
                        title="Sambungan Rumah (SR)"
                        value={`${Number(totalSRWaterMeter).toLocaleString('id-ID')} Unit`}
                        subtitle="Total SR Water Meter Terpasang"
                        icon={Droplet}
                        color="#0284c7"
                        category="Air Minum"
                    />
                    <StatCard
                        title="Sambungan Rumah (SR)"
                        value={`${Number(totalSRSanitasi).toLocaleString('id-ID')} Unit`}
                        subtitle="Total SR Sanitasi Terpasang"
                        icon={Sparkles}
                        color="#16a34a"
                        category="Sanitasi"
                    />
                    <StatCard
                        title="Paket Pekerjaan"
                        value={`${airMinumPekIds.size} Paket`}
                        subtitle="Pekerjaan Air Minum Aktif"
                        icon={FileText}
                        color="#06b6d4"
                        category="Air Minum"
                    />
                    <StatCard
                        title="Paket Pekerjaan"
                        value={`${sanitasiPekIds.size} Paket`}
                        subtitle="Pekerjaan Sanitasi Aktif"
                        icon={FileText}
                        color="#84cc16"
                        category="Sanitasi"
                    />
                </div>

                {/* Rekap Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Rekap per Komponen Output
                        </CardTitle>
                        <CardDescription>
                            Klik baris untuk melihat detail pekerjaan di setiap komponen
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">No</TableHead>
                                        <TableHead className="min-w-[250px]">Komponen</TableHead>
                                        <TableHead className="min-w-[100px]">Satuan</TableHead>
                                        <TableHead className="text-right min-w-[120px]">Total Volume</TableHead>
                                        <TableHead className="text-center min-w-[120px]">Jumlah Paket</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!summary?.rekap || summary.rekap.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
                                                <p className="font-medium">Tidak ada data output</p>
                                                <p className="text-xs mt-1">Tambahkan output baru untuk melihat rekap</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        summary.rekap.map((item, index) => (
                                            <RekapRow key={`${item.komponen}-${item.satuan}`} item={item} index={index} />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </Main>
        </>
    );
}
