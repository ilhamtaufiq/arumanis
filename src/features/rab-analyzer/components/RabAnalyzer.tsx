import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AnalysisResult } from '@/lib/rab-analyzer';
import { analyzeExcel, analyzePdf, formatCurrency } from '@/lib/rab-analyzer';
import { Loader2, Upload, FileText, Download, Copy, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function RabAnalyzer() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setFileName(file.name);
        try {
            let analysisResult: AnalysisResult;
            if (file.name.endsWith('.pdf')) {
                analysisResult = await analyzePdf(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                analysisResult = await analyzeExcel(file);
            } else {
                toast.error('Format file tidak didukung. Gunakan PDF atau Excel.');
                setIsLoading(false);
                return;
            }

            if (analysisResult.items.length === 0) {
                toast.warning('Tidak ada data yang berhasil diekstrak.');
            } else {
                setResult(analysisResult);
                toast.success(`Berhasil mengekstrak ${analysisResult.items.length} item.`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal menganalisis file.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateMarkdown = () => {
        if (!result) return '';
        let md = "| No | Item Pekerjaan | Satuan | Volume | Harga Satuan | Pajak (11%) | Total |\n";
        md += "|----|----------------|--------|--------|--------------|-------------|-------|\n";

        result.items.forEach(item => {
            if (item.type === 'header') {
                md += `| **${item.no}** | **${item.item}** | | | | | |\n`;
            } else {
                md += `| ${item.no} | ${item.item} | ${item.satuan} | ${item.vol} | ${typeof item.harga === 'number' ? formatCurrency(item.harga) : item.harga} | ${item.pajak} | ${typeof item.total === 'number' ? formatCurrency(item.total) : item.total} |\n`;
            }
        });

        md += `| | **TOTAL EKSTRAKSI** | | | | | **${formatCurrency(result.extractedTotal)}** |\n`;
        if (result.documentTotal > 0) {
            md += `| | **TOTAL DOKUMEN** | | | | | **${formatCurrency(result.documentTotal)}** |\n`;
            md += `| | **SELISIH** | | | | | **${formatCurrency(result.difference)}** |\n`;
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
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">RAB Analyzer</h1>
                {result && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={copyToClipboard}>
                            <Copy className="mr-2 h-4 w-4" /> Salin Markdown
                        </Button>
                        <Button variant="outline" onClick={downloadMarkdown}>
                            <Download className="mr-2 h-4 w-4" /> Unduh .md
                        </Button>
                        <Button variant="destructive" onClick={clearData}>
                            <Trash2 className="mr-2 h-4 w-4" /> Bersihkan
                        </Button>
                    </div>
                )}
            </div>

            {!result ? (
                <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardHeader>
                        <CardTitle>Unggah File RAB</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Seret dan lepaskan file PDF atau Excel RAB Anda di sini, atau klik untuk memilih file.
                        </p>
                        <label className="cursor-pointer">
                            <Button disabled={isLoading} asChild>
                                <span>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                    Pilih File
                                </span>
                            </Button>
                            <input type="file" className="hidden" accept=".pdf,.xlsx,.xls" onChange={handleFileUpload} />
                        </label>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
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
                            <AlertDescription className="flex justify-between items-center">
                                <span>
                                    {result.difference < 100
                                        ? "Jumlah ekstraksi sesuai dengan total yang tertera di dokumen."
                                        : `Terdapat selisih sebesar Rp ${formatCurrency(result.difference)} antara ekstraksi dan dokumen.`}
                                </span>
                                <Badge variant={result.difference < 100 ? "secondary" : "destructive"}>
                                    Diff: Rp {formatCurrency(result.difference)}
                                </Badge>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Ekstraksi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {formatCurrency(result.extractedTotal)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total di Dokumen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {result.documentTotal > 0 ? `Rp ${formatCurrency(result.documentTotal)}` : "Tidak ditemukan"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {result.documentTotal > 0 ? (
                                    <Badge className="text-lg py-1 px-4" variant={result.difference < 100 ? "secondary" : "destructive"}>
                                        {result.difference < 100 ? "MATCH" : "MISMATCH"}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-lg py-1 px-4">UNKNOWN</Badge>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Hasil Analisis: {fileName}
                                </div>
                                <div className="text-sm font-normal text-muted-foreground flex items-center">
                                    <Info className="mr-1 h-3 w-3" />
                                    {items.length} item ditemukan
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">No</TableHead>
                                            <TableHead>Item Pekerjaan</TableHead>
                                            <TableHead>Satuan</TableHead>
                                            <TableHead className="text-right">Volume</TableHead>
                                            <TableHead className="text-right">Harga Satuan</TableHead>
                                            <TableHead className="text-right">Pajak</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={idx} className={item.type === 'header' ? 'bg-muted/50 font-semibold' : ''}>
                                                <TableCell>{item.no}</TableCell>
                                                <TableCell>{item.item}</TableCell>
                                                <TableCell>{item.satuan}</TableCell>
                                                <TableCell className="text-right">{item.vol}</TableCell>
                                                <TableCell className="text-right">
                                                    {typeof item.harga === 'number' ? formatCurrency(item.harga) : item.harga}
                                                </TableCell>
                                                <TableCell className="text-right">{item.pajak}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {typeof item.total === 'number' ? formatCurrency(item.total) : item.total}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
