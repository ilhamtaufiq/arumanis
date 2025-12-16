import { useEffect, useState, useMemo } from 'react';
import { getFotoList, deleteFoto } from '@/features/foto/api';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, ImageIcon, MapPin, Printer, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedFotoForm from './EmbeddedFotoForm';

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

    // Edit state
    const [editingFoto, setEditingFoto] = useState<Foto | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<number | null>(null);

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

    // Check if penerima columns should be shown
    const showPenerimaColumns = useMemo(() => {
        if (selectedKomponen === 'all') return true;
        const output = outputList.find(o => o.id.toString() === selectedKomponen);
        return output ? !output.penerima_is_optional : true;
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

        // Count total photos
        const totalPhotos = filteredGroups.reduce((count, group) => {
            return count + PROGRESS_LEVELS.filter(level => group.fotos[level]?.foto).length;
        }, 0);

        let printHTML = '';

        // If 10 or fewer photos, use large 2-photos-per-page layout
        if (totalPhotos <= 10) {
            // Collect all photos with their info
            const allPhotos: { foto: Foto; koordinat: string; penerima: string; komponen: string; level: string }[] = [];
            filteredGroups.forEach((group) => {
                PROGRESS_LEVELS.forEach((level) => {
                    const fotoData = group.fotos[level];
                    if (fotoData?.foto) {
                        allPhotos.push({
                            foto: fotoData.foto,
                            koordinat: fotoData.koordinat || '',
                            penerima: showPenerimaColumns ? group.penerima_nama : '',
                            komponen: group.komponen_nama,
                            level: level
                        });
                    }
                });
            });

            // Build photo pages (2 photos per page)
            let photoPages = '';
            for (let i = 0; i < allPhotos.length; i += 2) {
                const photo1 = allPhotos[i];
                const photo2 = allPhotos[i + 1];

                let pageContent = '';

                // First photo
                pageContent += `
                    <div class="photo-card">
                        <img src="${photo1.foto.foto_url}" alt="Foto" onerror="this.style.display='none'" />
                        <div class="photo-info">
                            <span><strong>Komponen:</strong> ${photo1.komponen}</span>
                            ${photo1.penerima ? `<span><strong>Penerima:</strong> ${photo1.penerima}</span>` : ''}
                            <span><strong>Progress:</strong> ${photo1.level}</span>
                            ${photo1.koordinat ? `<span class="koordinat"><strong>Koordinat:</strong> ${photo1.koordinat}</span>` : ''}
                        </div>
                    </div>
                `;

                // Second photo (if exists)
                if (photo2) {
                    pageContent += `
                        <div class="photo-card">
                            <img src="${photo2.foto.foto_url}" alt="Foto" onerror="this.style.display='none'" />
                            <div class="photo-info">
                                <span><strong>Komponen:</strong> ${photo2.komponen}</span>
                                ${photo2.penerima ? `<span><strong>Penerima:</strong> ${photo2.penerima}</span>` : ''}
                                <span><strong>Progress:</strong> ${photo2.level}</span>
                                ${photo2.koordinat ? `<span class="koordinat"><strong>Koordinat:</strong> ${photo2.koordinat}</span>` : ''}
                            </div>
                        </div>
                    `;
                }

                photoPages += `<div class="page">${pageContent}</div>`;
            }

            printHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Dokumentasi Foto - ${selectedKomponenName}</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm;
                        }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            .page { page-break-after: always; }
                            .page:last-child { page-break-after: avoid; }
                        }
                        * {
                            box-sizing: border-box;
                        }
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 11px;
                            color: #000;
                            margin: 0;
                            padding: 0;
                        }
                        .header {
                            text-align: center;
                            padding: 8px;
                            border-bottom: 2px solid #333;
                            margin-bottom: 10px;
                        }
                        .header h2 {
                            margin: 0;
                            font-size: 14px;
                        }
                        .page {
                            width: 194mm;
                            padding: 3mm;
                        }
                        .photo-card {
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            padding: 8px;
                            margin-bottom: 8px;
                            background: #fafafa;
                        }
                        .photo-card img {
                            width: 100%;
                            height: 115mm;
                            object-fit: cover;
                            border-radius: 4px;
                            border: 1px solid #ddd;
                            display: block;
                        }
                        .photo-info {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px 20px;
                            margin-top: 6px;
                            padding-top: 6px;
                            border-top: 1px solid #eee;
                            font-size: 10px;
                        }
                        .koordinat {
                            font-size: 9px;
                            color: #666;
                        }
                        .footer {
                            text-align: center;
                            font-size: 8px;
                            color: #666;
                            margin-top: 5px;
                            padding-top: 5px;
                            border-top: 1px solid #ddd;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Dokumentasi Foto - ${selectedKomponenName}</h2>
                    </div>
                    ${photoPages}
                    <div class="footer">
                        Dicetak pada: ${today} | Total: ${totalPhotos} foto
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
        } else {
            // More than 10 photos: use table layout
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

                const penerimaCells = showPenerimaColumns ? `
                        <td style="border: 1px solid #000; padding: 6px;">${group.penerima_nama}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-family: monospace; font-size: 9px;">${group.penerima_nik}</td>
                ` : '';

                tableRows += `
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${index + 1}</td>
                        ${penerimaCells}
                        <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">${group.komponen_nama}</td>
                        ${photoCells}
                    </tr>
                `;
            });

            printHTML = `
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
                                ${showPenerimaColumns ? `<th style="min-width: 100px;">Nama Penerima</th>
                                <th style="min-width: 100px;">NIK</th>` : ''}
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
        }

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

    const handleEdit = (foto: Foto) => {
        setEditingFoto(foto);
        setIsEditDialogOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditDialogOpen(false);
        setEditingFoto(null);
        fetchData();
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteFoto(deleteId);
                toast.success('Foto berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete foto:', error);
                toast.error('Gagal menghapus foto');
            } finally {
                setDeleteId(null);
            }
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
            {/* Form Upload Foto */}
            <EmbeddedFotoForm pekerjaanId={pekerjaanId} onSuccess={fetchData} />

            {/* Filter dan Cetak */}
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
                <Button
                    variant="outline"
                    onClick={handlePrintPDF}
                    disabled={filteredGroups.length === 0}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Foto
                </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">No</TableHead>
                                {showPenerimaColumns && (
                                    <>
                                        <TableHead className="min-w-[120px]">Nama Penerima</TableHead>
                                        <TableHead className="min-w-[120px]">NIK</TableHead>
                                    </>
                                )}
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
                                    <TableCell colSpan={showPenerimaColumns ? 9 : 7} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">Tidak ada foto. Gunakan form di atas untuk upload foto.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedGroups.map((group, index) => (
                                    <TableRow key={`${group.penerima_id}-${group.komponen_id}`}>
                                        <TableCell className="text-center font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        {showPenerimaColumns && (
                                            <>
                                                <TableCell className="font-medium text-sm">
                                                    {group.penerima_nama}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {group.penerima_nik}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell className="text-muted-foreground text-sm">
                                            {group.komponen_nama}
                                        </TableCell>
                                        {PROGRESS_LEVELS.map((level) => (
                                            <TableCell key={level} className="text-center p-1">
                                                {group.fotos[level]?.foto ? (
                                                    <div className="flex flex-col items-center gap-1 group relative">
                                                        <div className="relative">
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
                                                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-full shadow-md"
                                                                    onClick={() => handleEdit(group.fotos[level]!.foto!)}
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-full shadow-md"
                                                                    onClick={() => setDeleteId(group.fotos[level]!.foto!.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Foto</DialogTitle>
                    </DialogHeader>
                    {editingFoto && (
                        <EmbeddedFotoForm
                            pekerjaanId={pekerjaanId}
                            foto={editingFoto}
                            onSuccess={handleEditSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Foto akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
