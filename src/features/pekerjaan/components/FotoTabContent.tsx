import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFotoList } from '@/features/foto/api';
import { getOutput } from '@/features/output/api/output';
import type { Foto } from '@/features/foto/types';
import type { Output } from '@/features/output/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Plus, ImageIcon, MapPin, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface FotoTabContentProps {
    pekerjaanId: number;
}

interface FotoWithKoordinat {
    foto?: Foto;
    koordinat?: string;
}

interface PenerimaFotoGroup {
    penerima_id: number;
    penerima_nama: string;
    penerima_nik: string;
    komponen_id: number;
    komponen_nama: string;
    fotos: {
        '0%'?: FotoWithKoordinat;
        '25%'?: FotoWithKoordinat;
        '50%'?: FotoWithKoordinat;
        '75%'?: FotoWithKoordinat;
        '100%'?: FotoWithKoordinat;
    };
}

const PROGRESS_LEVELS = ['0%', '25%', '50%', '75%', '100%'] as const;
const ITEMS_PER_PAGE = 10;

export default function FotoTabContent({ pekerjaanId }: FotoTabContentProps) {
    const [fotoList, setFotoList] = useState<Foto[]>([]);
    const [outputList, setOutputList] = useState<Output[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKomponen, setSelectedKomponen] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [fotoResponse, outputResponse] = await Promise.all([
                getFotoList({ pekerjaan_id: pekerjaanId }),
                getOutput({ pekerjaan_id: pekerjaanId })
            ]);
            setFotoList(fotoResponse.data);
            setOutputList(outputResponse.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Gagal memuat data foto');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pekerjaanId]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedKomponen]);

    // Group photos by penerima and komponen
    const groupedFotos = useMemo(() => {
        const groups: PenerimaFotoGroup[] = [];
        const groupMap = new Map<string, PenerimaFotoGroup>();

        fotoList.forEach((foto) => {
            // Use 0 as default for missing penerima_id or komponen_id
            const penerimaId = foto.penerima_id || 0;
            const komponenId = foto.komponen_id || 0;

            const key = `${penerimaId}-${komponenId}`;

            if (!groupMap.has(key)) {
                const penerimaData = foto.penerima as { id: number; nama: string; nik?: string | null } | undefined;
                const komponenData = foto.komponen as { id: number; komponen: string } | undefined;

                groupMap.set(key, {
                    penerima_id: penerimaId,
                    penerima_nama: penerimaData?.nama || (penerimaId === 0 ? 'Tanpa Penerima' : 'Tidak ada nama'),
                    penerima_nik: penerimaData?.nik || '-',
                    komponen_id: komponenId,
                    komponen_nama: komponenData?.komponen || (komponenId === 0 ? 'Tanpa Komponen' : 'Tidak ada komponen'),
                    fotos: {}
                });
            }

            const group = groupMap.get(key)!;
            group.fotos[foto.keterangan] = {
                foto: foto,
                koordinat: foto.koordinat
            };
        });

        groupMap.forEach((group) => groups.push(group));
        return groups;
    }, [fotoList]);

    // Filter by selected komponen
    const filteredGroups = useMemo(() => {
        if (selectedKomponen === 'all') return groupedFotos;
        return groupedFotos.filter(
            (group) => group.komponen_id.toString() === selectedKomponen
        );
    }, [groupedFotos, selectedKomponen]);

    // Pagination
    const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
    const paginatedGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredGroups.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredGroups, currentPage]);

    // Get selected komponen name for PDF title
    const selectedKomponenName = useMemo(() => {
        if (selectedKomponen === 'all') return 'Semua Komponen';
        const output = outputList.find(o => o.id.toString() === selectedKomponen);
        return output?.komponen || 'Komponen';
    }, [selectedKomponen, outputList]);

    const handlePrintPDF = () => {
        if (filteredGroups.length === 0) {
            toast.error('Tidak ada data untuk dicetak');
            return;
        }

        // Get current date
        const today = new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Build table rows
        let tableRows = '';
        filteredGroups.forEach((group, index) => {
            let photoCells = '';
            PROGRESS_LEVELS.forEach((level) => {
                const foto = group.fotos[level]?.foto;
                const koordinat = group.fotos[level]?.koordinat || '';

                if (foto?.foto_url) {
                    photoCells += `
                        <td style="border: 1px solid #000; padding: 4px; text-align: center; vertical-align: top;">
                            <img src="${foto.foto_url}" style="width: 70px; height: 70px; object-fit: cover;" onerror="this.style.display='none'" />
                            <div style="font-size: 7px; color: #666; margin-top: 2px; word-break: break-all; max-width: 80px;">${koordinat}</div>
                        </td>
                    `;
                } else {
                    photoCells += `<td style="border: 1px solid #000; padding: 4px; text-align: center; color: #999;">-</td>`;
                }
            });

            tableRows += `
                <tr>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #000; padding: 6px;">${group.penerima_nama}</td>
                    <td style="border: 1px solid #000; padding: 6px; font-family: monospace; font-size: 9px;">${group.penerima_nik}</td>
                    <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">${group.komponen_nama}</td>
                    ${photoCells}
                </tr>
            `;
        });

        // Create print window HTML
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Dokumentasi Foto - ${selectedKomponenName}</title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                        color: #000;
                        margin: 0;
                        padding: 10px;
                    }
                    h2 {
                        font-size: 14px;
                        margin-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th {
                        background-color: #f0f0f0;
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: center;
                        font-size: 10px;
                    }
                    .footer {
                        margin-top: 15px;
                        font-size: 9px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <h2>Dokumentasi Foto - ${selectedKomponenName}</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30px;">No</th>
                            <th style="min-width: 100px;">Nama Penerima</th>
                            <th style="min-width: 100px;">NIK</th>
                            <th style="min-width: 80px;">Komponen</th>
                            <th style="width: 90px;">0%</th>
                            <th style="width: 90px;">25%</th>
                            <th style="width: 90px;">50%</th>
                            <th style="width: 90px;">75%</th>
                            <th style="width: 90px;">100%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="footer">
                    Dicetak pada: ${today}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
            toast.success('Halaman print terbuka. Gunakan Ctrl+P atau pilih "Save as PDF" untuk menyimpan.');
        } else {
            toast.error('Popup diblokir. Mohon izinkan popup untuk mencetak.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filter Komponen:</span>
                    <Select value={selectedKomponen} onValueChange={setSelectedKomponen}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Pilih Komponen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Komponen</SelectItem>
                            {outputList.map((output) => (
                                <SelectItem key={output.id} value={output.id.toString()}>
                                    {output.komponen}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handlePrintPDF}
                        disabled={filteredGroups.length === 0}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak PDF
                    </Button>
                    <Button asChild>
                        <Link to={`/foto/new?pekerjaan_id=${pekerjaanId}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Foto
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">No</TableHead>
                                <TableHead className="min-w-[120px]">Nama Penerima</TableHead>
                                <TableHead className="min-w-[120px]">NIK</TableHead>
                                <TableHead className="min-w-[100px]">Komponen</TableHead>
                                {PROGRESS_LEVELS.map((level) => (
                                    <TableHead key={level} className="text-center min-w-[100px]">
                                        <div>{level}</div>
                                        <div className="text-xs text-muted-foreground font-normal">Foto & Koordinat</div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">Tidak ada foto</p>
                                            <Button asChild size="sm" className="mt-2">
                                                <Link to={`/foto/new?pekerjaan_id=${pekerjaanId}`}>
                                                    Tambah Foto
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedGroups.map((group, index) => (
                                    <TableRow key={`${group.penerima_id}-${group.komponen_id}`}>
                                        <TableCell className="text-center font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {group.penerima_nama}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            {group.penerima_nik}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {group.komponen_nama}
                                        </TableCell>
                                        {PROGRESS_LEVELS.map((level) => (
                                            <TableCell key={level} className="text-center p-1">
                                                {group.fotos[level]?.foto ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <a
                                                            href={group.fotos[level]!.foto!.foto_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block"
                                                        >
                                                            <img
                                                                src={group.fotos[level]!.foto!.foto_url}
                                                                alt={`Foto ${level}`}
                                                                className="h-14 w-14 object-cover rounded-md hover:scale-105 transition-transform mx-auto"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-size="10"%3ENo Img%3C/text%3E%3C/svg%3E';
                                                                }}
                                                            />
                                                        </a>
                                                        {group.fotos[level]?.koordinat && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-help max-w-[80px] truncate">
                                                                        <MapPin className="h-2 w-2 flex-shrink-0" />
                                                                        <span className="truncate">{group.fotos[level]?.koordinat}</span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{group.fotos[level]?.koordinat}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-14 w-14 mx-auto flex items-center justify-center rounded-md bg-muted">
                                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TooltipProvider>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredGroups.length)} dari {filteredGroups.length} data
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
