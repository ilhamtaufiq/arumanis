import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/lib/rab-analyzer';
import { formatCurrency } from '@/lib/rab-analyzer';
import { Loader2, Upload, FileText, Download, Copy, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import api from '@/lib/api-client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hotRef = useRef<any>(null);
    
    // Selection mode state
    const [mode, setMode] = useState<'upload' | 'select'>('upload');
    const [pekerjaanList, setPekerjaanList] = useState<any[]>([]);
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<string>("");
    const [berkasList, setBerkasList] = useState<any[]>([]);
    const [selectedBerkas, setSelectedBerkas] = useState<string>("");
    
    // Global Fiscal Year Filter
    const activeYear = useAppSettingsStore((state) => state.tahunAnggaran);

    // Initial fetch for Pekerjaan list when mode or year changes
    useEffect(() => {
        if (mode === 'select') {
            setSelectedPekerjaan(""); // Reset selection on change
            fetchPekerjaan("");
        }
    }, [mode, activeYear]);

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

    const processFile = async (file: File) => {
        setIsLoading(true);
        setFileName(file.name);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<{
                success: boolean;
                data: AnalysisResult;
            }>('/analyze-rab', formData);

            if (response.success) {
                setResult(response.data);
                toast.success(`Berhasil menganalisis file.`);
            } else {
                toast.error('Gagal menganalisis file dari server.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal menganalisis file. Pastikan koneksi backend tersedia.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleAnalyzeBerkas = async () => {
        if (!selectedBerkas) return;

        setIsLoading(true);
        const berkas = berkasList.find(b => b.id.toString() === selectedBerkas);
        setFileName(berkas?.jenis_dokumen || "Berkas Terpilih");
        
        try {
            const response = await api.post<{
                success: boolean;
                data: AnalysisResult;
            }>('/analyze-rab', { berkas_id: selectedBerkas });

            if (response.success) {
                setResult(response.data);
                toast.success(`Berhasil menganalisis berkas.`);
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
        
        let md = "| No | Item Pekerjaan | Satuan | Volume | Harga Satuan | Pajak (11%) | Total |\n";
        md += "|----|----------------|--------|--------|--------------|-------------|-------|\n";

        tableData.forEach((item: any) => {
            if (item.type === 'header') {
                md += `| **${item.no}** | **${item.item}** | | | | | |\n`;
            } else {
                md += `| ${item.no} | ${item.item} | ${item.satuan} | ${item.vol} | ${typeof item.harga === 'number' ? formatCurrency(item.harga) : item.harga} | ${item.pajak} | ${typeof item.total === 'number' ? formatCurrency(item.total) : item.total} |\n`;
            }
        });

        const extractedTotal = tableData.filter((i: any) => i.type === 'item').reduce((sum: number, i: any) => sum + (parseFloat(i.total) || 0), 0);
        md += `| | **TOTAL EKSTRAKSI** | | | | | **${formatCurrency(extractedTotal)}** |\n`;
        
        if (result && result.documentTotal > 0) {
            md += `| | **TOTAL DOKUMEN** | | | | | **${formatCurrency(result.documentTotal)}** |\n`;
            md += `| | **SELISIH** | | | | | **${formatCurrency(Math.abs(extractedTotal - result.documentTotal))}** |\n`;
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
                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto mb-8 h-12">
                            <TabsTrigger value="upload" className="flex gap-2">
                                <Upload className="h-4 w-4 font-bold" /> Unggah File
                            </TabsTrigger>
                            <TabsTrigger value="select" className="flex gap-2">
                                <FileText className="h-4 w-4" /> Pilih dari Berkas
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload">
                            <Card 
                                className={`border-dashed border-2 flex flex-col items-center justify-center p-12 text-center transition-colors duration-200 ${
                                    isDragging ? 'border-primary bg-primary/5' : 'bg-muted/20'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-primary/20' : 'bg-primary/10'}`}>
                                    <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-primary'}`} />
                                </div>
                                <CardHeader className="pt-0">
                                    <CardTitle className="text-xl">
                                        {isDragging ? 'Lepas Berkas Sekarang' : 'Unggah Berkas Baru'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        Pilih berkas PDF atau Excel dari komputer Anda atau seret file ke sini untuk mengekstrak data.
                                    </p>
                                    <Button 
                                        disabled={isLoading} 
                                        className="h-11 px-8"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Pilih Berkas
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept=".pdf,.xlsx,.xls" 
                                        onChange={handleFileUpload} 
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="select">
                            <Card className="max-w-2xl mx-auto border-dashed border-2 bg-muted/20">
                                <div className="p-8 flex flex-col items-center border-b border-dashed">
                                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                                        <FileText className="h-10 w-10 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Pilih dari Pekerjaan</h2>
                                    <p className="text-muted-foreground text-sm text-center mt-2 max-w-sm">
                                        Gunakan berkas yang sudah ada di dalam sistem untuk dianalisis kembali.
                                    </p>
                                </div>
                                <CardContent className="space-y-4 p-8 bg-background">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                            Pilih Paket Pekerjaan
                                            <Badge variant="secondary" className="font-normal">Tahun {activeYear}</Badge>
                                        </label>
                                        <AsyncSearchableSelect
                                            placeholder="Cari & pilih pekerjaan..."
                                            searchPlaceholder="Ketik nama paket/kode rekening..."
                                            onSearch={fetchPekerjaan}
                                            value={selectedPekerjaan}
                                            onValueChange={setSelectedPekerjaan}
                                            initialOptions={pekerjaanList.map(p => ({
                                                value: p.id.toString(),
                                                label: p.nama_paket
                                            }))}
                                        />
                                    </div>

                                    {selectedPekerjaan && (
                                        <div className="space-y-2 pt-2 border-t">
                                            <label className="text-sm font-medium text-muted-foreground">Pilih Dokumen PDF/Excel</label>
                                            <Select value={selectedBerkas} onValueChange={setSelectedBerkas}>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Pilih Berkas..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {berkasList.length > 0 ? (
                                                        berkasList.map((b) => (
                                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{b.jenis_dokumen}</span>
                                                                    <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                                                                        {b.berkas_url?.split('/').pop()}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-sm text-muted-foreground text-center">
                                                            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                            Pekerjaan ini tidak memiliki berkas PDF/Excel.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <Button 
                                        className="w-full h-11" 
                                        disabled={!selectedBerkas || isLoading}
                                        onClick={handleAnalyzeBerkas}
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis...</>
                                        ) : (
                                            <><FileText className="mr-2 h-4 w-4" /> Mulai Analisis</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
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
                                        colHeaders={['No', 'Item Pekerjaan', 'Satuan', 'Vol', 'Harga Satuan', 'Pajak', 'Total']}
                                        columns={[
                                            { data: 'no', width: 60, className: 'htCenter', readOnly: true },
                                            { data: 'item', width: 400 },
                                            { data: 'satuan', width: 80, className: 'htCenter' },
                                            { data: 'vol', width: 80, type: 'numeric', className: 'htCenter' },
                                            { data: 'harga', width: 140, type: 'numeric', numericFormat: { pattern: '0,0', culture: 'id-ID' }, className: 'htRight' },
                                            { data: 'pajak', width: 80, className: 'htCenter' },
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
