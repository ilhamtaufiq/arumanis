import { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { getProgressReport, saveProgressReport } from '@/features/progress/api/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Loader2, 
    Plus, 
    Save, 
    RefreshCw, 
    FileDown, 
    FileSpreadsheet, 
    ExternalLink,
    Trash2,
    Calendar,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    Info,
    Upload,
    ClipboardPaste
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    Table, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Extracted utilities and components
import {
    calculateWeeksFromDates,
    formatWeekRange,
    getWeekDateRange,
    generateExcel,
    generatePdf
} from '@/features/progress/utils';
import { ProgressChart } from '@/features/progress/components';
import { defaultSignatureData, defaultDpaData } from '@/features/progress/types/signature';
import type { SignatureData, DpaData } from '@/features/progress/types/signature';

interface ProgressTabContentProps {
    pekerjaanId: number;
}

export default function ProgressTabContent({ pekerjaanId }: ProgressTabContentProps) {
    const queryClient = useQueryClient();
    const [weekCount, setWeekCount] = useState(1);
    const [hasChanges, setHasChanges] = useState(false);
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [signatureData, setSignatureData] = useState<SignatureData>(defaultSignatureData);
    const [dpaData, setDpaData] = useState<DpaData>(defaultDpaData);
    
    // New UI States
    const [editableItems, setEditableItems] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'all' | 'single'>('single');
    const [focusWeek, setFocusWeek] = useState(1);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importText, setImportText] = useState('');

    const { data: report, isLoading: loading } = useQuery({
        queryKey: ['progress-report', pekerjaanId],
        queryFn: async () => {
            const response = await getProgressReport(pekerjaanId);
            const data = response.data;

            // Auto-calculate weeks from contract dates
            if (data.kontrak?.tgl_spmk && data.kontrak?.tgl_selesai) {
                const calculatedWeeks = calculateWeeksFromDates(
                    data.kontrak.tgl_spmk,
                    data.kontrak.tgl_selesai
                );
                const maxW = Math.max(calculatedWeeks, data.max_minggu, 1);
                setWeekCount(maxW);
                // Set focus week to current week if possible
                setFocusWeek(Math.min(data.max_minggu || 1, maxW));
            } else if (data.max_minggu > 0) {
                setWeekCount(Math.max(data.max_minggu, 1));
                setFocusWeek(data.max_minggu);
            }

            return data;
        },
    });

    // Sync editableItems when report data is fetched
    useEffect(() => {
        if (report?.items) {
            // Deep copy to avoid mutating original query data
            setEditableItems(JSON.parse(JSON.stringify(report.items)));
            setHasChanges(false);
        } else if (report && report.items.length === 0) {
            // Initialize with 5 empty rows if no items exist
            const emptyItems = Array.from({ length: 5 }).map((_, i) => ({
                id: `new-${Date.now()}-${i}`,
                nama_item: '',
                rincian_item: '',
                satuan: '',
                harga_satuan: 0,
                target_volume: 0,
                bobot: 0,
                weekly_data: {}
            }));
            setEditableItems(emptyItems);
        }
    }, [report]);

    const saveMutation = useMutation({
        mutationKey: ['progress', 'save', pekerjaanId],
        mutationFn: (data: any) => saveProgressReport(pekerjaanId, data),
        onSuccess: () => {
            toast.success('Progress berhasil disimpan');
            // Invalidate query progress-report agar header ikut terupdate
            queryClient.invalidateQueries({ queryKey: ['progress-report', pekerjaanId] });
            setHasChanges(false);
        },
        onError: (error) => {
            console.error('Failed to save progress:', error);
            toast.error('Gagal menyimpan perubahan');
        }
    });

    const submitting = saveMutation.isPending;

    // Real-time Calculations
    const calculatedData = useMemo(() => {
        // 1. Calculate Total RAB (Base)
        const totalRABBase = editableItems.reduce((sum: number, item: any) => {
            return sum + ((item.harga_satuan || 0) * (item.target_volume || 0) * 1.11);
        }, 0);

        // 2. Process Items with bobot and progress
        const items = editableItems.map(item => {
            const itemRAB = (item.harga_satuan || 0) * (item.target_volume || 0) * 1.11;
            const bobot = totalRABBase > 0 ? (itemRAB / totalRABBase) * 100 : 0;
            
            let totalReal = 0;
            Object.values(item.weekly_data || {}).forEach((w: any) => {
                totalReal += parseFloat(w?.realisasi) || 0;
            });

            const progressPercent = item.target_volume > 0 ? (totalReal / item.target_volume) * 100 : 0;
            const weightedProgress = (progressPercent * bobot) / 100;

            return {
                ...item,
                bobot: Math.round(bobot * 100) / 100,
                totalReal,
                progressPercent: Math.round(progressPercent * 100) / 100,
                weightedProgress: Math.round(weightedProgress * 100) / 100
            };
        });

        // 3. Calculate Totals
        const totals = {
            totalRAB: totalRABBase,
            totalWeightedProgress: items.reduce((sum: number, item: any) => sum + item.weightedProgress, 0),
            weekly: {} as Record<number, { rencana: number, realisasi: number }>
        };

        for (let w = 1; w <= weekCount; w++) {
            let totalRenc = 0;
            let totalReal = 0;
            items.forEach(item => {
                const weekly = item.weekly_data[w];
                totalRenc += parseFloat(weekly?.rencana) || 0;
                totalReal += parseFloat(weekly?.realisasi) || 0;
            });
            totals.weekly[w] = { rencana: totalRenc, realisasi: totalReal };
        }
        return { items, totals };
    }, [editableItems, weekCount]);

    // Grouping items for the UI
    const groupedItems = useMemo(() => {
        const result: { groupName: string, items: any[] }[] = [];
        const seenGroups = new Set<string>();

        if (!calculatedData.items) return result;

        calculatedData.items.forEach((item: any, index: number) => {
            const key = item.nama_item || 'Tanpa Kategori';
            const itemWithIndex = { ...item, originalIndex: index };

            if (!seenGroups.has(key)) {
                seenGroups.add(key);
                result.push({ groupName: key, items: [itemWithIndex] });
            } else {
                const group = result.find(g => g.groupName === key);
                if (group) group.items.push(itemWithIndex);
            }
        });

        return result;
    }, [calculatedData.items]);

    // Handlers
    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...editableItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditableItems(newItems);
        setHasChanges(true);
    };

    const handleUpdateGroupName = (oldName: string, newName: string) => {
        const newItems = editableItems.map(item => {
            const currentItemGroupName = item.nama_item || 'Tanpa Kategori';
            if (currentItemGroupName === oldName) {
                return { ...item, nama_item: newName };
            }
            return item;
        });
        setEditableItems(newItems);
        setHasChanges(true);
    };

    const handleUpdateWeekly = (itemIndex: number, week: number, type: 'rencana' | 'realisasi', value: string) => {
        const newItems = [...editableItems];
        // Find by actual index in editableItems
        const item = { ...newItems[itemIndex] };
        const weeklyData = { ...(item.weekly_data || {}) };
        
        weeklyData[week] = { 
            ...(weeklyData[week] || { rencana: 0, realisasi: 0 }), 
            [type]: value === '' ? null : parseFloat(value) 
        };
        
        item.weekly_data = weeklyData;
        newItems[itemIndex] = item;
        setEditableItems(newItems);
        setHasChanges(true);
    };

    const handleAddNewRow = (groupName?: string) => {
        setEditableItems(prev => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                nama_item: groupName || '',
                rincian_item: '',
                satuan: '',
                harga_satuan: 0,
                target_volume: 0,
                bobot: 0,
                weekly_data: {}
            }
        ]);
        setHasChanges(true);
    };

    const handleRemoveRow = (index: number) => {
        setEditableItems(prev => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const handleRemoveGroup = (groupName: string) => {
        setEditableItems(prev => prev.filter(item => item.nama_item !== groupName));
        setHasChanges(true);
    };

    const handleSaveAll = () => {
        // Filter out empty items
        const itemsToSave = editableItems
            .filter(item => item.nama_item.trim() !== '')
            .map((item, idx) => ({
                nama_item: item.nama_item,
                rincian_item: item.rincian_item,
                satuan: item.satuan?.trim() || '-',
                harga_satuan: parseFloat(item.harga_satuan) || 0,
                target_volume: parseFloat(item.target_volume) || 0,
                bobot: calculatedData.items[idx]?.bobot || 0, // Kirim bobot yang sudah dihitung
                weekly_data: item.weekly_data
            }));

        saveMutation.mutate({
            items: itemsToSave,
            week_count: weekCount
        });
    };

    const handleGeneratePdf = () => {
        generatePdf({
            report: {
                ...report,
                items: calculatedData.items,
                totals: {
                    total_bobot: 100,
                    total_accumulated_real: calculatedData.items.reduce((sum: number, item: any) => sum + item.totalReal, 0),
                    total_weighted_progress: calculatedData.totals.totalWeightedProgress
                }
            },
            weekCount,
            signatureData,
            dpaData
        });
        setSignatureDialogOpen(false);
    };

    const handleExportExcel = () => {
        if (!report) return;
        generateExcel({ 
            report: {
                ...report,
                items: calculatedData.items,
                totals: {
                    total_bobot: 100,
                    total_accumulated_real: calculatedData.items.reduce((sum: number, item: any) => sum + item.totalReal, 0),
                    total_weighted_progress: calculatedData.totals.totalWeightedProgress
                }
            }, 
            weekCount, 
            dpaData 
        });
        toast.success('Excel berhasil diunduh');
    };

    const processImportData = (rows: any[]) => {
        let currentGroup = 'Tanpa Kategori';
        let currentLocation = '';
        const newItems: any[] = [];

        rows.forEach((row, index) => {
            const cells = Array.isArray(row) ? row : [];
            if (cells.length === 0) return;

            // Logika sesuai contoh user: kolom terakhir adalah flag grup (true/false)
            const isGroup = cells[cells.length - 1] === true || cells[cells.length - 1] === 'true';
            
            const desc = cells[0]?.toString().trim();
            const vol = parseFloat(cells[2]) || 0;
            const price = parseFloat(cells[3]) || 0;

            if (isGroup) {
                // Ini adalah kategori pekerjaan (misal: Pekerjaan Persiapan)
                const categoryName = desc || 'Tanpa Kategori';
                // Gabungkan lokasi dengan kategori (jika lokasi sama dengan kategori, jangan diduplikasi)
                if (currentLocation && currentLocation !== categoryName) {
                    currentGroup = `${currentLocation} - ${categoryName}`;
                } else {
                    currentGroup = categoryName;
                }
            } else {
                // Ini adalah Item Pekerjaan ATAU Judul Lokasi
                if (!desc || desc === '0') return;

                // Jika harga 0, hampir pasti ini adalah judul lokasi atau header dekoratif
                if (price === 0) {
                    currentLocation = desc;
                    currentGroup = desc; // Langsung gunakan nama lokasi sebagai grup
                    return; // Jangan masukkan sebagai item
                } else {
                    // Ini adalah Item Pekerjaan Asli
                    newItems.push({
                        id: `import-${Date.now()}-${index}`,
                        nama_item: currentGroup,
                        rincian_item: desc,
                        satuan: cells[1]?.toString()?.trim() || '-',
                        target_volume: vol,
                        harga_satuan: price,
                        bobot: 0,
                        weekly_data: {}
                    });
                }
            }
        });

        if (newItems.length > 0) {
            setEditableItems(newItems);
            setHasChanges(true);
            toast.success(`Berhasil mengimpor ${newItems.length} item pekerjaan`);
            setImportDialogOpen(false);
            setImportText('');
        } else {
            toast.error('Tidak ada data pekerjaan yang valid ditemukan. Pastikan format kolom sesuai.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            processImportData(data);
        };
        reader.readAsBinaryString(file);
    };

    const handlePasteImport = () => {
        if (!importText.trim()) return;

        const rows = importText.split('\n').filter(line => line.trim()).map(line => {
            return line.split('\t').map(cell => {
                const trimmed = cell.trim();
                if (trimmed.toLowerCase() === 'true') return true;
                if (trimmed.toLowerCase() === 'false') return false;
                return trimmed;
            });
        });

        processImportData(rows);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
                <Card className="border-none shadow-xl bg-linear-to-br from-card to-muted/30">
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
                                <Label htmlFor="weekCount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Minggu
                                </Label>
                                <Input
                                    id="weekCount"
                                    type="number"
                                    min={1}
                                    max={52}
                                    value={weekCount}
                                    onChange={(e) => setWeekCount(parseInt(e.target.value) || 1)}
                                    className="w-14 h-8 bg-transparent border-none focus-visible:ring-0 text-center font-bold"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="rounded-full shadow-sm"
                                    onClick={() => queryClient.invalidateQueries({ queryKey: ['progress', pekerjaanId] })}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="rounded-full gap-2 shadow-sm border-primary/20 hover:border-primary/50 text-primary"
                                    onClick={() => setImportDialogOpen(true)}
                                >
                                    <Upload className="h-4 w-4" />
                                    Import RAB
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="rounded-full gap-2 shadow-sm border-primary/20 hover:border-primary/50"
                                    onClick={() => setSignatureDialogOpen(true)}
                                >
                                    <FileDown className="h-4 w-4 text-primary" />
                                    Export
                                </Button>

                                <Button 
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full shadow-sm"
                                    onClick={() => window.open(`/pekerjaan/${pekerjaanId}/progress`, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>

                                {hasChanges && (
                                    <Button 
                                        onClick={handleSaveAll} 
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
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-muted/20 p-4 rounded-2xl border border-muted-foreground/5">
                            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto">
                                <TabsList className="bg-background shadow-inner rounded-full p-1 h-10">
                                    <TabsTrigger value="single" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Fokus Minggu
                                    </TabsTrigger>
                                    <TabsTrigger value="all" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4">
                                        <LayoutGrid className="h-3.5 w-3.5" />
                                        Semua Minggu
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {viewMode === 'single' && (
                                <div className="flex items-center gap-4 animate-in slide-in-from-right-4">
                                    <Label className="text-sm font-medium">Lihat Minggu:</Label>
                                    <div className="flex items-center bg-background rounded-full p-1 border shadow-sm">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full"
                                            disabled={focusWeek <= 1}
                                            onClick={() => setFocusWeek(prev => prev - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="w-16 text-center font-bold text-primary">
                                            M{focusWeek}
                                        </span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full"
                                            disabled={focusWeek >= weekCount}
                                            onClick={() => setFocusWeek(prev => prev + 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                                        {report?.kontrak?.tgl_spmk ? (
                                            formatWeekRange(
                                                getWeekDateRange(report.kontrak.tgl_spmk, focusWeek).start,
                                                getWeekDateRange(report.kontrak.tgl_spmk, focusWeek).end
                                            )
                                        ) : 'Tanggal tidak tersedia'}
                                    </span>
                                </div>
                            )}

                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => handleAddNewRow()}
                                className="rounded-full gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Baris Pekerjaan
                            </Button>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-muted-foreground/10 bg-background/50 shadow-inner">
                            <div className="overflow-x-auto">
                                <Table className="min-w-max border-separate border-spacing-0">
                                    <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
                                        <TableRow>
                                            <TableHead className="w-10 border-b border-r bg-muted/80"></TableHead>
                                            <TableHead className="w-12 text-center font-bold bg-muted/80 border-b border-r">No</TableHead>
                                            <TableHead className="font-bold bg-muted/80 border-b border-r sticky left-0 z-20">Uraian / Rincian Pekerjaan</TableHead>
                                            <TableHead className="w-24 text-center font-bold border-b border-r">Satuan</TableHead>
                                            <TableHead className="w-32 text-right font-bold border-b border-r">Harga Satuan</TableHead>
                                            <TableHead className="w-24 text-center font-bold border-b border-r">Bobot %</TableHead>
                                            <TableHead className="w-24 text-center font-bold border-b border-r">Target Vol</TableHead>
                                            
                                            {/* Weekly Columns */}
                                            {viewMode === 'all' ? (
                                                Array.from({ length: weekCount }).map((_, i) => (
                                                    <TableHead key={i} className="p-0 border-b border-r text-center bg-blue-50/30 dark:bg-blue-950/20" colSpan={2}>
                                                        <div className="px-4 py-2 border-b font-bold text-blue-600 dark:text-blue-400">Minggu {i + 1}</div>
                                                        <div className="grid grid-cols-2 text-[10px] uppercase font-bold tracking-tighter">
                                                            <div className="py-1 border-r bg-muted/20">Renc</div>
                                                            <div className="py-1">Real</div>
                                                        </div>
                                                    </TableHead>
                                                ))
                                            ) : (
                                                <TableHead className="p-0 border-b border-r text-center bg-blue-50/50 dark:bg-blue-950/40" colSpan={2}>
                                                    <div className="px-6 py-2 border-b font-bold text-blue-700 dark:text-blue-300">Minggu {focusWeek}</div>
                                                    <div className="grid grid-cols-2 text-xs uppercase font-bold tracking-tight">
                                                        <div className="py-2 border-r bg-muted/30">Rencana</div>
                                                        <div className="py-2">Realisasi</div>
                                                    </div>
                                                </TableHead>
                                            )}

                                            <TableHead className="w-28 text-center font-bold border-b border-r bg-green-50/30 dark:bg-green-950/20">Total Akum</TableHead>
                                            <TableHead className="w-24 text-center font-bold border-b border-r">% Prog</TableHead>
                                            <TableHead className="w-24 text-center font-bold border-b text-primary">Bobot %</TableHead>
                                            <TableHead className="w-12 border-b"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                        {groupedItems.map((group, gIdx) => (
                                            <tbody key={`group-block-${gIdx}`} className="border-b">
                                                {/* Group Header Row */}
                                                <TableRow key={`group-header-${gIdx}`} className="bg-muted/40 hover:bg-muted/50 border-y-2 border-primary/10">
                                                    <TableCell className="p-0 border-r" colSpan={3}>
                                                        <div className="flex items-center sticky left-0 z-20 bg-muted/80 backdrop-blur-sm h-12 px-4 gap-3">
                                                            <div className="flex items-center justify-center h-8 w-8">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => handleRemoveGroup(group.groupName)}
                                                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold ml-2">
                                                                {gIdx + 1}
                                                            </div>
                                                            <Input
                                                                value={group.groupName === 'Tanpa Kategori' ? '' : group.groupName}
                                                                onChange={(e) => handleUpdateGroupName(group.groupName, e.target.value)}
                                                                placeholder="Nama Kategori Pekerjaan (Grup)..."
                                                                className="flex-1 border-b border-muted-foreground/20 focus-visible:ring-0 focus-visible:border-primary shadow-none bg-transparent font-bold text-base placeholder:text-muted-foreground/50 h-9 rounded-none px-0"
                                                            />
                                                            <div className="flex items-center gap-2 pr-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => handleAddNewRow(group.groupName)}
                                                                    className="h-8 rounded-full gap-2 text-xs font-semibold hover:bg-primary/10 hover:text-primary"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                    Tambah Rincian
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell colSpan={viewMode === 'all' ? 5 + (weekCount * 2) + 3 : 5 + 2 + 3} className="bg-muted/20"></TableCell>
                                                </TableRow>

                                                {/* Group Items */}
                                                {group.items.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-muted/20 transition-colors group">
                                                        <TableCell className="p-0 text-center border-r">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleRemoveRow(item.originalIndex)}
                                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium border-r bg-muted/5 opacity-40"></TableCell>
                                                        <TableCell className="p-1 border-r sticky left-0 z-10 bg-background/95 group-hover:bg-muted/40 backdrop-blur-sm pl-8">
                                                            <Input
                                                                value={item.rincian_item}
                                                                onChange={(e) => handleUpdateItem(item.originalIndex, 'rincian_item', e.target.value)}
                                                                placeholder="Uraian rincian pekerjaan..."
                                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-sm font-medium"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1 border-r">
                                                            <Input
                                                                value={item.satuan}
                                                                onChange={(e) => handleUpdateItem(item.originalIndex, 'satuan', e.target.value)}
                                                                placeholder="Unit"
                                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-center"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1 border-r">
                                                            <Input
                                                                type="number"
                                                                value={item.harga_satuan || ''}
                                                                onChange={(e) => handleUpdateItem(item.originalIndex, 'harga_satuan', e.target.value)}
                                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-right font-mono"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center border-r font-bold text-amber-600 bg-amber-50/20">
                                                            {item.bobot.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="p-1 border-r">
                                                            <Input
                                                                type="number"
                                                                value={item.target_volume || ''}
                                                                onChange={(e) => handleUpdateItem(item.originalIndex, 'target_volume', e.target.value)}
                                                                className="border-none focus-visible:ring-1 shadow-none h-9 text-center font-mono"
                                                            />
                                                        </TableCell>

                                                        {/* Weekly Inputs */}
                                                        {viewMode === 'all' ? (
                                                            Array.from({ length: weekCount }).map((_, wIdx) => {
                                                                const w = wIdx + 1;
                                                                return (
                                                                    <TableCell key={wIdx} className="p-0 border-r" colSpan={2}>
                                                                        <div className="grid grid-cols-2 h-9 items-center">
                                                                            <Input
                                                                                type="number"
                                                                                value={item.weekly_data[w]?.rencana ?? ''}
                                                                                onChange={(e) => handleUpdateWeekly(item.originalIndex, w, 'rencana', e.target.value)}
                                                                                className="h-full border-y-0 border-l-0 border-r rounded-none focus-visible:ring-1 text-center px-1 text-[11px] bg-muted/10"
                                                                            />
                                                                            <Input
                                                                                type="number"
                                                                                value={item.weekly_data[w]?.realisasi ?? ''}
                                                                                onChange={(e) => handleUpdateWeekly(item.originalIndex, w, 'realisasi', e.target.value)}
                                                                                className="h-full border-none rounded-none focus-visible:ring-1 text-center px-1 text-[11px]"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                );
                                                            })
                                                        ) : (
                                                            <TableCell className="p-0 border-r" colSpan={2}>
                                                                <div className="grid grid-cols-2 h-10 items-center">
                                                                    <Input
                                                                        type="number"
                                                                        value={item.weekly_data[focusWeek]?.rencana ?? ''}
                                                                        onChange={(e) => handleUpdateWeekly(item.originalIndex, focusWeek, 'rencana', e.target.value)}
                                                                        className="h-full border-y-0 border-l-0 border-r rounded-none focus-visible:ring-1 text-center font-bold bg-blue-50/20"
                                                                    />
                                                                    <Input
                                                                        type="number"
                                                                        value={item.weekly_data[focusWeek]?.realisasi ?? ''}
                                                                        onChange={(e) => handleUpdateWeekly(item.originalIndex, focusWeek, 'realisasi', e.target.value)}
                                                                        className="h-full border-none rounded-none focus-visible:ring-1 text-center font-bold"
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                        )}

                                                        <TableCell className="text-center border-r font-bold bg-green-50/20 text-green-700">
                                                            {item.totalReal.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-center border-r text-xs font-medium">
                                                            {item.progressPercent.toFixed(2)}%
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-primary bg-primary/5">
                                                            {item.weightedProgress.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="p-0 border-l"></TableCell>
                                                    </TableRow>
                                                ))}
                                            </tbody>
                                        ))}

                                        {/* Totals Row */}
                                        <tbody key="totals-summary-body" className="bg-muted/50 font-bold border-t-2">
                                            <TableRow>
                                                <TableCell className="border-r" colSpan={2}></TableCell>
                                                <TableCell className="text-right border-r px-4 py-3">
                                                    TOTAL RAB
                                                </TableCell>
                                                <TableCell className="text-right border-r px-4 py-3 font-mono text-primary" colSpan={2}>
                                                    Rp{new Intl.NumberFormat('id-ID').format(calculatedData.totals.totalRAB)}
                                                </TableCell>
                                                <TableCell className="bg-muted/20 border-r"></TableCell>
                                                
                                                {viewMode === 'all' ? (
                                                    Array.from({ length: weekCount }).map((_, wIdx) => {
                                                        const w = wIdx + 1;
                                                        return (
                                                            <TableCell key={wIdx} className="p-0 border-r text-[10px]" colSpan={2}>
                                                                <div className="grid grid-cols-2 text-center h-full items-center">
                                                                    <div className="py-2 border-r bg-muted/20 opacity-60">{calculatedData.totals.weekly[w].rencana.toFixed(1)}</div>
                                                                    <div className="py-2 text-blue-600">{calculatedData.totals.weekly[w].realisasi.toFixed(1)}</div>
                                                                </div>
                                                            </TableCell>
                                                        );
                                                    })
                                                ) : (
                                                    <TableCell className="p-0 border-r" colSpan={2}>
                                                        <div className="grid grid-cols-2 text-center h-full items-center">
                                                            <div className="py-3 border-r bg-muted/20 text-muted-foreground">{calculatedData.totals.weekly[focusWeek].rencana.toFixed(2)}</div>
                                                            <div className="py-3 text-blue-700">{calculatedData.totals.weekly[focusWeek].realisasi.toFixed(2)}</div>
                                                        </div>
                                                    </TableCell>
                                                )}

                                                <TableCell className="text-center border-r bg-muted/30">SUM</TableCell>
                                                <TableCell className="text-center border-r bg-primary/5 text-primary font-bold">
                                                    {calculatedData.totals.totalWeightedProgress.toFixed(2)}%
                                                </TableCell>
                                                <TableCell className="text-center bg-muted/30 font-bold">
                                                    100%
                                                </TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </tbody>
                                </Table>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/10 px-4 py-2 rounded-lg border border-dashed">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Bobot dihitung otomatis berdasarkan Harga Satuan × Target Volume + PPN 11%</span>
                                <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Gunakan mode "Fokus Minggu" untuk input yang lebih cepat</span>
                            </div>
                            <div className="flex items-center gap-3 font-medium">
                                <Badge variant="outline" className="text-[10px] bg-background">ESC untuk batalkan</Badge>
                                <Badge variant="outline" className="text-[10px] bg-background">ENTER untuk baris baru</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* S-Curve Chart */}
                <ProgressChart report={report ?? null} weekCount={weekCount} />

                {/* Export/Signature Dialog */}
                <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Pengaturan Export Laporan</DialogTitle>
                            <DialogDescription>
                                Lengkapi data administrasi dan tanda tangan untuk dokumen PDF/Excel.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-6 py-4">
                            {/* DPA Section */}
                            <div className="space-y-4 p-4 rounded-xl border bg-purple-50/30 dark:bg-purple-950/10">
                                <h4 className="font-bold text-purple-700 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                                    Data DPA (Daftar Pelaksanaan Anggaran)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nomorDpa">Nomor DPA</Label>
                                        <Input
                                            id="nomorDpa"
                                            placeholder="Contoh: 1.03.08.2.01.03.5.2"
                                            value={dpaData.nomorDpa}
                                            onChange={(e) => setDpaData({ ...dpaData, nomorDpa: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggalDpa">Tanggal DPA</Label>
                                        <Input
                                            id="tanggalDpa"
                                            type="date"
                                            value={dpaData.tanggalDpa}
                                            onChange={(e) => setDpaData({ ...dpaData, tanggalDpa: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 p-4 rounded-xl border bg-blue-50/30 dark:bg-blue-950/10">
                                    <h4 className="font-bold text-blue-700 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        Pihak Mengetahui
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Nama Lengkap & Gelar</Label>
                                            <Input
                                                value={signatureData.namaMengetahui}
                                                onChange={(e) => setSignatureData({ ...signatureData, namaMengetahui: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">NIP</Label>
                                            <Input
                                                value={signatureData.nipMengetahui}
                                                onChange={(e) => setSignatureData({ ...signatureData, nipMengetahui: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Jabatan</Label>
                                            <Input
                                                value={signatureData.jabatanMengetahui}
                                                onChange={(e) => setSignatureData({ ...signatureData, jabatanMengetahui: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 rounded-xl border bg-green-50/30 dark:bg-green-950/10">
                                    <h4 className="font-bold text-green-700 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        Pihak Diperiksa
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Nama Lengkap & Gelar</Label>
                                            <Input
                                                value={signatureData.namaDiperiksa}
                                                onChange={(e) => setSignatureData({ ...signatureData, namaDiperiksa: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">NIP</Label>
                                            <Input
                                                value={signatureData.nipDiperiksa}
                                                onChange={(e) => setSignatureData({ ...signatureData, nipDiperiksa: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Jabatan</Label>
                                            <Input
                                                value={signatureData.jabatanDiperiksa}
                                                onChange={(e) => setSignatureData({ ...signatureData, jabatanDiperiksa: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-4 rounded-xl border bg-red-50/30 dark:bg-red-950/10">
                                <h4 className="font-bold text-red-700 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    Pihak Penyedia / Kontraktor
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nama Perusahaan</Label>
                                        <Input
                                            value={signatureData.namaPerusahaan}
                                            onChange={(e) => setSignatureData({ ...signatureData, namaPerusahaan: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nama Direktur</Label>
                                        <Input
                                            value={signatureData.namaDirektur}
                                            onChange={(e) => setSignatureData({ ...signatureData, namaDirektur: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lokasi Tanda Tangan</Label>
                                        <Input
                                            value={signatureData.lokasi}
                                            onChange={(e) => setSignatureData({ ...signatureData, lokasi: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tanggal Laporan</Label>
                                        <Input
                                            value={signatureData.tanggal}
                                            onChange={(e) => setSignatureData({ ...signatureData, tanggal: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-3">
                            <Button variant="outline" onClick={handleExportExcel} className="rounded-full gap-2">
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                Export Excel
                            </Button>
                            <Button onClick={handleGeneratePdf} className="rounded-full gap-2 bg-red-600 hover:bg-red-700 text-white">
                                <FileDown className="h-4 w-4" />
                                Export PDF
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Import RAB Dialog */}
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-primary" />
                                Import Item Pekerjaan dari RAB
                            </DialogTitle>
                            <DialogDescription>
                                Anda bisa mengunggah file Excel atau menempelkan (Paste) data dari Excel langsung ke kotak di bawah ini.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Option 1: File Upload */}
                            <div className="p-6 border-2 border-dashed rounded-2xl bg-muted/30 flex flex-col items-center justify-center gap-3 transition-all hover:border-primary/50 group">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold">Pilih File Excel (.xlsx / .xls)</p>
                                    <p className="text-xs text-muted-foreground mt-1">Sistem akan mendeteksi baris grup (true) dan item (false)</p>
                                </div>
                                <Input 
                                    type="file" 
                                    accept=".xlsx, .xls" 
                                    onChange={handleFileUpload}
                                    className="max-w-xs cursor-pointer"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-dashed" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground font-bold">Atau Tempel (Paste) Data</span>
                                </div>
                            </div>

                            {/* Option 2: Paste Area */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    <ClipboardPaste className="h-3.5 w-3.5" />
                                    Paste dari Excel di sini:
                                </Label>
                                <textarea
                                    className="w-full h-48 p-4 rounded-2xl border bg-muted/10 text-[11px] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Tempel baris dari Excel yang mengandung kolom Uraian, Satuan, Vol, Harga, dan flag true/false..."
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => {
                                setImportDialogOpen(false);
                                setImportText('');
                            }} className="rounded-full">Batal</Button>
                            <Button 
                                onClick={handlePasteImport} 
                                disabled={!importText.trim()}
                                className="rounded-full gap-2 px-6"
                            >
                                <ClipboardPaste className="h-4 w-4" />
                                Proses Data Tempel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
}
