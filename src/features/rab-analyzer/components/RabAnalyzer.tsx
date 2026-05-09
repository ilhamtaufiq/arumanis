import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/lib/rab-analyzer';
import { formatCurrency } from '@/lib/rab-analyzer';
import { Loader2, FileText, Download, Copy, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import api from '@/lib/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { AsyncSearchableSelect } from '@/components/ui/async-searchable-select';
import { useAppSettingsStore } from '@/stores/app-settings-store';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// Register Handsontable modules
registerAllModules();

export function RabAnalyzer() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const hotRef = useRef<any>(null);
    
    // Selection state
    const [pekerjaanList, setPekerjaanList] = useState<any[]>([]);
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<string>("");
    const [berkasList, setBerkasList] = useState<any[]>([]);
    const [selectedBerkas, setSelectedBerkas] = useState<string>("");
    const [analysisMode, setAnalysisMode] = useState<string>("default");
    
    // Global Fiscal Year Filter
    const activeYear = useAppSettingsStore((state) => state.tahunAnggaran);

    // Initial fetch for Pekerjaan list when year changes
    useEffect(() => {
        setSelectedPekerjaan(""); // Reset selection on change
        fetchPekerjaan("");
    }, [activeYear]);

    const fetchPekerjaan = async (search: string) => {
        const res = await api.get<any>('/pekerjaan', {
            params: {
                per_page: search ? 10 : -1,
                tahun: activeYear,
                search: search
            }
        });
        const list = res.data || [];
        if (!search) setPekerjaanList(list);
        return list.map((p: any) => ({
            value: p.id.toString(),
            label: p.nama_paket
        }));
    };

    // Fetch Berkas list when Pekerjaan is selected
    useEffect(() => {
        if (selectedPekerjaan) {
            api.get<any>(`/pekerjaan/${selectedPekerjaan}`).then((res) => {
                // Filter only PDF/Excel files in berkas
                const docs = (res.data?.berkas || []).filter((b: any) => {
                    const url = b.berkas_url?.toLowerCase() || "";
                    return url.endsWith('.pdf') || url.endsWith('.xlsx') || url.endsWith('.xls');
                });
                setBerkasList(docs);
            });
        } else {
            setBerkasList([]);
        }
    }, [selectedPekerjaan]);


    const handleAnalyzeBerkas = async () => {
        if (!selectedBerkas) return;

        setIsLoading(true);
        const berkas = berkasList.find(b => b.id.toString() === selectedBerkas);
        setFileName(berkas?.jenis_dokumen || "Berkas Terpilih");
        
        try {
            const response = await api.post<{
                success: boolean;
                data: AnalysisResult;
            }>('/analyze-rab', { 
                berkas_id: selectedBerkas,
                type: analysisMode
            });

            if (response.success) {
                setResult(response.data);
                toast.success(`Berhasil menganalisis berkas menggunakan mode ${analysisMode === 'mck' ? 'MCK' : 'Standar'}.`);
            } else {
                toast.error('Gagal menganalisis berkas dari server.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal menganalisis berkas. Pastikan koneksi backend tersedia.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateMarkdown = () => {
        const tableData = hotRef.current?.hotInstance?.getSourceData() || result?.items || [];
        if (tableData.length === 0) return '';
        
        let md = "| Item Pekerjaan | Satuan | Volume | Harga Satuan | Pajak | Keterangan | Kunci | Total |\n";
        md += "|----------------|--------|--------|--------------|-------|------------|-------|-------|\n";

        tableData.forEach((item: any) => {
            if (item.type === 'header') {
                md += `| **${item.item}** | | | | | | ${item.kunci || 'TRUE'} | |\n`;
            } else {
                md += `| ${item.item} | ${item.satuan} | ${item.vol} | ${typeof item.harga === 'number' ? formatCurrency(item.harga) : item.harga} | ${item.pajak} | ${item.keterangan || ''} | ${item.kunci || 'FALSE'} | ${typeof item.total === 'number' ? formatCurrency(item.total) : item.total} |\n`;
            }
        });

        const extractedTotal = tableData.filter((i: any) => i.type === 'item').reduce((sum: number, i: any) => sum + (parseFloat(i.total) || 0), 0);
        md += `| **TOTAL EKSTRAKSI** | | | | | | | **${formatCurrency(extractedTotal)}** |\n`;
        
        if (result && result.documentTotal > 0) {
            md += `| **TOTAL DOKUMEN** | | | | | | | **${formatCurrency(result.documentTotal)}** |\n`;
            md += `| **SELISIH** | | | | | | | **${formatCurrency(Math.abs(extractedTotal - result.documentTotal))}** |\n`;
        }

        return md;
    };

    const copyToClipboard = () => {
        const md = generateMarkdown();
        navigator.clipboard.writeText(md);
        toast.success('Markdown disalin ke clipboard');
    };

    const downloadMarkdown = () => {
        const md = generateMarkdown();
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RAB_Analysis_${fileName?.replace(/\.[^/.]+$/, "")}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const clearData = () => {
        setResult(null);
        setFileName(null);
    };

    const items = result?.items || [];

    return (
        <>
            <Header />

            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">RAB Analyzer</h1>
                        <p className="text-muted-foreground text-sm">
                            Analisis dan ekstraksi data dari dokumen RAB (PDF/Excel)
                        </p>
                    </div>
                    {result && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                <Copy className="mr-2 h-4 w-4" /> Salin Markdown
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                                <Download className="mr-2 h-4 w-4" /> Unduh .md
                            </Button>
                            <Button variant="destructive" size="sm" onClick={clearData}>
                                <Trash2 className="mr-2 h-4 w-4" /> Bersihkan
                            </Button>
                        </div>
                    )}
                </div>

                {!result ? (
                    <div className="max-w-3xl mx-auto space-y-8 py-8">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
                                <FileText className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Analisis Dokumen RAB</h2>
                            <p className="text-muted-foreground">Pilih dokumen dari sistem untuk diekstrak datanya secara otomatis</p>
                        </div>

                        <Card className="border-2 shadow-xl shadow-primary/5 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/80 flex items-center justify-between">
                                                1. Pilih Paket Pekerjaan
                                                <Badge variant="outline" className="font-medium bg-muted/50 border-primary/20 text-primary">Tahun Anggaran {activeYear}</Badge>
                                            </label>
                                            <div className="relative">
                                                <AsyncSearchableSelect
                                                    placeholder="Cari & pilih pekerjaan..."
                                                    searchPlaceholder="Ketik nama paket..."
                                                    onSearch={fetchPekerjaan}
                                                    value={selectedPekerjaan}
                                                    onValueChange={(v) => {
                                                        setSelectedPekerjaan(v);
                                                        setSelectedBerkas(""); // Reset berkas when pekerjaan changes
                                                    }}
                                                    initialOptions={pekerjaanList.map(p => ({
                                                        value: p.id.toString(),
                                                        label: p.nama_paket
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/80">
                                                2. Mode Analisis
                                            </label>
                                            <Select value={analysisMode} onValueChange={setAnalysisMode}>
                                                <SelectTrigger className="h-10 bg-muted/10 border-2">
                                                    <SelectValue placeholder="Pilih Mode..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">Standar (SPAM / Sumur)</SelectItem>
                                                    <SelectItem value="mck">Khusus MCK (Baris 77)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {selectedPekerjaan && (
                                        <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                                                    3. Pilih Dokumen Sumber
                                                </label>
                                                <Select value={selectedBerkas} onValueChange={setSelectedBerkas}>
                                                    <SelectTrigger className="h-12 bg-muted/20 border-2 transition-all hover:bg-muted/30 focus:ring-primary/20">
                                                        <SelectValue placeholder="Pilih file PDF atau Excel..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[300px]">
                                                        {berkasList.length > 0 ? (
                                                            berkasList.map((b) => (
                                                                <SelectItem key={b.id} value={b.id.toString()} className="py-3">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="p-1.5 bg-primary/10 rounded-md text-primary mt-0.5">
                                                                            <FileText className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-semibold text-sm">{b.jenis_dokumen}</span>
                                                                            <span className="text-xs text-muted-foreground max-w-[400px] truncate">
                                                                                {b.berkas_url?.split('/').pop()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 text-sm text-muted-foreground text-center">
                                                                <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-500 opacity-60" />
                                                                <p className="font-medium">Tidak ada berkas yang valid</p>
                                                                <p className="text-xs mt-1">Pekerjaan ini tidak memiliki lampiran PDF/Excel.</p>
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="pt-2">
                                                <Button 
                                                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]" 
                                                    disabled={!selectedBerkas || isLoading}
                                                    onClick={handleAnalyzeBerkas}
                                                >
                                                    {isLoading ? (
                                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sedang Menganalisis...</>
                                                    ) : (
                                                        <><CheckCircle2 className="mr-2 h-5 w-5" /> Mulai Analisis Dokumen</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {!selectedPekerjaan && (
                                <div className="px-8 py-6 bg-muted/30 border-t flex items-center gap-3 text-sm text-muted-foreground italic justify-center">
                                    <Info className="h-4 w-4" />
                                    <span>Pilih paket pekerjaan terlebih dahulu untuk melihat daftar berkas yang tersedia</span>
                                </div>
                            )}
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {result.documentTotal > 0 && (
                            <Alert variant={result.difference < 100 ? "default" : "destructive"}>
                                {result.difference < 100 ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4" />
                                )}
                                <AlertTitle>
                                    {result.difference < 100 ? "Validasi Berhasil" : "Validasi Gagal"}
                                </AlertTitle>
                                <AlertDescription className="flex justify-between items-center pr-4">
                                    <span>
                                        {result.difference < 100
                                            ? "Jumlah ekstraksi sesuai dengan total yang tertera di dokumen."
                                            : `Terdapat selisih sebesar Rp ${formatCurrency(result.difference)} antara ekstraksi dan dokumen.`}
                                    </span>
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Ekstraksi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">Rp {formatCurrency(result.extractedTotal)}</div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total di Dokumen</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {result.documentTotal > 0 ? `Rp ${formatCurrency(result.documentTotal)}` : "Tidak ditemukan"}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Validasi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {result.documentTotal > 0 ? (
                                        <Badge className="text-base py-0.5 px-3 font-semibold" variant={result.difference < 100 ? "secondary" : "destructive"}>
                                            {result.difference < 100 ? "MATCH" : "MISMATCH"}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-base py-0.5 px-3">UNKNOWN</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-sm overflow-hidden">
                            <CardHeader className="border-b py-4">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-primary" />
                                        Hasil Analisis: {fileName}
                                    </div>
                                    <div className="text-sm font-normal text-muted-foreground flex items-center">
                                        <Info className="mr-1 h-3 w-3" />
                                        {items.length} item ditemukan
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="w-full overflow-hidden">
                                    <HotTable
                                        ref={hotRef}
                                        data={items}
                                        colHeaders={['Item Pekerjaan', 'Satuan', 'Volume', 'Harga Satuan', 'Pajak', 'Keterangan', 'Kunci', 'Total']}
                                        columns={[
                                            { data: 'item', width: 400 },
                                            { data: 'satuan', width: 80, className: 'htCenter' },
                                            { data: 'vol', width: 80, type: 'numeric', className: 'htCenter' },
                                            { data: 'harga', width: 140, type: 'numeric', numericFormat: { pattern: '0,0', culture: 'id-ID' }, className: 'htRight' },
                                            { data: 'pajak', width: 80, className: 'htCenter' },
                                            { data: 'keterangan', width: 120 },
                                            { data: 'kunci', width: 80, className: 'htCenter' },
                                            { data: 'total', width: 160, type: 'numeric', numericFormat: { pattern: '0,0', culture: 'id-ID' }, className: 'htRight font-bold' },
                                        ]}
                                        rowHeaders={true}
                                        height="600px"
                                        width="100%"
                                        stretchH="all"
                                        manualColumnResize={true}
                                        dropdownMenu={true}
                                        filters={true}
                                        columnSorting={true}
                                        contextMenu={true}
                                        licenseKey="non-commercial-and-evaluation"
                                        cells={(row) => {
                                            const cellProperties: any = {};
                                            const item = items[row];
                                            if (item) {
                                                if (item.type === 'header') {
                                                    cellProperties.className = 'bg-primary/5 font-bold text-primary';
                                                } else if (item.type === 'summary') {
                                                    cellProperties.className = 'bg-muted/50 font-bold italic';
                                                }
                                            }
                                            return cellProperties;
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>
        </>
    );
}
