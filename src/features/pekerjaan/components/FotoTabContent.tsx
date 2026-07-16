import { useState, useEffect, useMemo } from 'react';
import { getFotoList, deleteFoto, updateFoto } from '@/features/foto/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOutput } from '@/features/output/api/output';
import { getPenerimaList } from '@/features/penerima/api';
import type { Foto } from '@/features/foto/types';
import { getFotoFullUrl, getFotoThumbUrl } from '@/features/foto/lib/foto-url';
import {
    isFotoKoordinatInvalid,
    summarizeFotoKoordinatStatus,
} from '@/features/foto/lib/koordinat-status';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { Loader2, ImageIcon, MapPin, Printer, ChevronLeft, ChevronRight, Edit, Trash2, Check, Upload, X, AlertTriangle, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import EmbeddedFotoForm from './EmbeddedFotoForm';
import { getRecipientRequirements } from '../utils/recipientRequirements';
import {
    computeOutputFotoProgressSummary,
    type OutputFotoProgressSummary,
} from '../utils/output-foto-progress';

import type { Pekerjaan } from '@/features/pekerjaan/types';
import {
    FOTO_PROGRESS_LEVELS as PROGRESS_LEVELS,
    FOTO_TAB_ITEMS_PER_PAGE as ITEMS_PER_PAGE,
    normalizeFotoProgress,
    type FotoKoordinatFilter as KoordinatFilter,
    type PenerimaFotoGroup,
} from '../lib/foto-tab';

interface FotoTabContentProps {
    pekerjaanId: number;
    pekerjaan?: Pekerjaan;
}

type OutputProgressSummaryItem = OutputFotoProgressSummary;

export default function FotoTabContent({ pekerjaanId, pekerjaan }: FotoTabContentProps) {
    const queryClient = useQueryClient();
    const [selectedKomponen, setSelectedKomponen] = useState<string>('all');
    const [koordinatFilter, setKoordinatFilter] = useState<KoordinatFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Edit state
    const [editingFoto, setEditingFoto] = useState<Foto | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedFotoIds, setSelectedFotoIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    // Carousel state
    const [isCarouselOpen, setIsCarouselOpen] = useState(false);
    const [carouselPhotos, setCarouselPhotos] = useState<Foto[]>([]);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    // Upload Dialog state
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [uploadPreFill, setUploadPreFill] = useState<{
        komponenId?: string;
        penerimaId?: string;
        keterangan?: string;
        unit_index?: string;
    }>({});

    // Attach orphan foto ke komponen tersedia
    const [attachGroup, setAttachGroup] = useState<PenerimaFotoGroup | null>(null);
    const [attachFotos, setAttachFotos] = useState<Foto[]>([]);
    const [attachKomponenId, setAttachKomponenId] = useState('');
    const [attachPenerimaId, setAttachPenerimaId] = useState('');

    const tabQueryOpts = {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    } as const

    const { data: fotoList = [], isLoading: loadingFotos } = useQuery({
        queryKey: ['fotos', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getFotoList({ pekerjaan_id: pekerjaanId });
            return response.data;
        },
        ...tabQueryOpts,
    });

    const { data: outputList = [], isLoading: loadingOutputs } = useQuery({
        queryKey: ['output', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getOutput({ pekerjaan_id: pekerjaanId, per_page: -1 });
            return response.data;
        },
        ...tabQueryOpts,
    });

    const { data: penerimaList = [], isLoading: loadingPenerima } = useQuery({
        queryKey: ['penerima', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getPenerimaList({ pekerjaan_id: pekerjaanId, per_page: -1 });
            return response.data;
        },
        ...tabQueryOpts,
    });

    const loading = loadingFotos || loadingOutputs || loadingPenerima;

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedKomponen, koordinatFilter]);

    const koordinatSummary = useMemo(
        () => summarizeFotoKoordinatStatus(fotoList),
        [fotoList],
    );

    const invalidFotos = useMemo(
        () => fotoList.filter((f) => isFotoKoordinatInvalid(f)),
        [fotoList],
    );

    const groupHasKoordinatMatch = (group: PenerimaFotoGroup, filter: KoordinatFilter): boolean => {
        if (filter === 'all') return true;
        const all = PROGRESS_LEVELS.flatMap((level) => group.fotos[level]);
        if (all.length === 0) return false;
        if (filter === 'invalid') return all.some((f) => isFotoKoordinatInvalid(f));
        if (filter === 'valid') {
            return all.some(
                (f) => Boolean(f.koordinat?.trim()) && f.validasi_koordinat === true,
            );
        }
        // no_coords
        return all.some((f) => !f.koordinat?.trim());
    };

    // Group photos by output and recipient/unit
    const groupedFotos = useMemo(() => {
        const groups: PenerimaFotoGroup[] = [];
        const usedFotoIds = new Set<number>();

        // Phase 1: Create slots based on Output Component definitions
        outputList.forEach(output => {
            if (output.penerima_is_optional) {
                // Communal Logic (Units based on volume ONLY for 'Unit' satuan)
                const isUnitBased = output.satuan?.toLowerCase() === 'unit';
                const unitCount = isUnitBased ? Math.max(1, Math.round(output.volume || 1)) : 1;

                // Collect all photos for this communal output (normalize progress key)
                const communalPhotosByLevel: Record<string, Foto[]> = {};
                fotoList.filter(f => f.komponen_id === output.id && (!f.penerima_id || f.penerima_id === 0)).forEach(f => {
                    const levelKey = normalizeFotoProgress(f.keterangan);
                    if (!communalPhotosByLevel[levelKey]) communalPhotosByLevel[levelKey] = [];
                    communalPhotosByLevel[levelKey].push(f);
                });

                for (let i = 0; i < unitCount; i++) {
                    const unitName = `Unit ${i + 1}`;
                    const group: PenerimaFotoGroup = {
                        penerima_id: 0,
                        penerima_nama: unitCount > 1 ? unitName : 'Output Komunal',
                        penerima_nik: '-',
                        komponen_id: output.id,
                        komponen_nama: output.komponen,
                        unit_index: i + 1,
                        isOrphanKomponen: false,
                        fotos: {
                            '0%': [], '25%': [], '50%': [], '75%': [], '100%': []
                        }
                    };

                    PROGRESS_LEVELS.forEach(level => {
                        const allPhotosForLevel = communalPhotosByLevel[level] || [];
                        const photos = allPhotosForLevel.filter(f => {
                            // 1. Priority: Use explicit unit_index field
                            if (f.unit_index !== null && f.unit_index !== undefined) {
                                return f.unit_index === (i + 1);
                            }

                            // 2. Legacy Fallback: Parse from keterangan string
                            const parts = String(f.keterangan || '').split('|');
                            if (parts.length > 1 && parts[1]?.startsWith('Unit ')) {
                                return parts[1] === unitName;
                            }

                            // 3. Final Fallback: Auto distribution for unmarked photos
                            const autoDistPhotos = allPhotosForLevel.filter(p =>
                                (p.unit_index === null || p.unit_index === undefined) &&
                                !String(p.keterangan || '').includes('|Unit ')
                            );
                            const idx = autoDistPhotos.indexOf(f);
                            return idx !== -1 && idx % unitCount === i;
                        });

                        if (photos.length > 0) {
                            group.fotos[level] = photos;
                            photos.forEach(p => usedFotoIds.add(p.id));
                        }
                    });

                    groups.push(group);
                }
            } else {
                // Per-Recipient Logic
                if (penerimaList.length === 0) {
                    groups.push({
                        penerima_id: 0,
                        penerima_nama: '(Belum ada Penerima)',
                        penerima_nik: '-',
                        komponen_id: output.id,
                        komponen_nama: output.komponen,
                        isOrphanKomponen: false,
                        fotos: {
                            '0%': [], '25%': [], '50%': [], '75%': [], '100%': []
                        }
                    });
                } else {
                    penerimaList.forEach(penerima => {
                        const group: PenerimaFotoGroup = {
                            penerima_id: penerima.id,
                            penerima_nama: `${penerima.nama}${penerima.is_komunal ? ' (Komunal)' : ''}`,
                            penerima_nik: penerima.nik || '-',
                            komponen_id: output.id,
                            komponen_nama: output.komponen,
                            isOrphanKomponen: false,
                            fotos: {
                                '0%': [], '25%': [], '50%': [], '75%': [], '100%': []
                            }
                        };

                        const pPhotos = fotoList.filter(f => f.komponen_id === output.id && f.penerima_id === penerima.id);
                        pPhotos.forEach(f => {
                            const level = normalizeFotoProgress(f.keterangan) as typeof PROGRESS_LEVELS[number];
                            if (PROGRESS_LEVELS.includes(level)) {
                                group.fotos[level].push(f);
                                usedFotoIds.add(f.id);
                            }
                        });

                        groups.push(group);
                    });
                }
            }
        });

        // Phase 2: Handle remaining photos (orphans)
        // Group them by (komponen_id, penerima_id) to avoid multiple rows for the same unit
        const orphanMap = new Map<string, PenerimaFotoGroup>();
        const knownOutputIds = new Set(outputList.map((o) => o.id));

        fotoList.filter(f => !usedFotoIds.has(f.id)).forEach(f => {
            const outputId = f.komponen_id || 0;
            const penerimaId = f.penerima_id || 0;
            const key = `${outputId}-${penerimaId}`;
            const isOrphanKomponen = outputId === 0 || !knownOutputIds.has(outputId);

            if (!orphanMap.has(key)) {
                orphanMap.set(key, {
                    penerima_id: penerimaId,
                    penerima_nama: f.penerima?.nama || (penerimaId === 0 ? 'Communal (Orphan)' : `Ref ${penerimaId} (Orphan)`),
                    penerima_nik: f.penerima?.nik || '-',
                    komponen_id: outputId,
                    komponen_nama: f.komponen?.komponen
                        || (isOrphanKomponen
                            ? (outputId === 0 ? 'Tanpa Komponen (Orphan)' : `Output ${outputId} (Orphan)`)
                            : `Output ${outputId}`),
                    isOrphanKomponen,
                    fotos: {
                        '0%': [], '25%': [], '50%': [], '75%': [], '100%': []
                    }
                });
            }

            const group = orphanMap.get(key)!;
            const level = normalizeFotoProgress(f.keterangan) as typeof PROGRESS_LEVELS[number];
            if (PROGRESS_LEVELS.includes(level)) {
                group.fotos[level].push(f);
                usedFotoIds.add(f.id);
            } else {
                // Slot tidak standar: simpan di 0% agar tetap terlihat & bisa di-attach
                group.fotos['0%'].push(f);
                usedFotoIds.add(f.id);
            }
        });

        orphanMap.forEach(group => groups.push(group));

        return groups;
    }, [fotoList, outputList, penerimaList]);

    const orphanKomponenGroups = useMemo(
        () => groupedFotos.filter((g) => g.isOrphanKomponen),
        [groupedFotos],
    );

    const orphanKomponenFotoCount = useMemo(
        () => orphanKomponenGroups.reduce((count, group) => {
            return count + PROGRESS_LEVELS.reduce((n, level) => n + group.fotos[level].length, 0);
        }, 0),
        [orphanKomponenGroups],
    );

    const attachTargetOutput = useMemo(
        () => outputList.find((o) => o.id.toString() === attachKomponenId),
        [outputList, attachKomponenId],
    );
    const attachNeedsPenerima = Boolean(attachTargetOutput && !attachTargetOutput.penerima_is_optional);


    // Filter by selected komponen + status koordinat
    const filteredGroups = useMemo(() => {
        let groups = groupedFotos;
        if (selectedKomponen !== 'all') {
            groups = groups.filter(
                (group: PenerimaFotoGroup) => group.komponen_id.toString() === selectedKomponen,
            );
        }
        if (koordinatFilter !== 'all') {
            groups = groups.filter((group) => groupHasKoordinatMatch(group, koordinatFilter));
        }
        return groups;
    }, [groupedFotos, selectedKomponen, koordinatFilter]);

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

    const recipientRequirementSummary = useMemo(() => {
        return getRecipientRequirements(outputList).map(requirement => ({
            ...requirement,
            availableRecipients: penerimaList.length,
            isReady: penerimaList.length >= requirement.targetRecipients,
        }));
    }, [outputList, penerimaList]);

    const incompleteRecipientRequirements = recipientRequirementSummary.filter(item => !item.isReady);

    // Progress Summary for each Output — target non-komunal = volume output, bukan jumlah penerima
    const outputProgressSummary = useMemo(() => {
        return outputList.map((output) => {
            const outputPhotos = fotoList.filter((f) => f.komponen_id === output.id);
            return computeOutputFotoProgressSummary(
                output,
                outputPhotos.length,
                penerimaList.length,
            );
        });
    }, [outputList, fotoList, penerimaList]);

    // Always show columns for stability
    const showPenerimaColumns = true;


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
        const totalPhotos = filteredGroups.reduce((count: number, group: PenerimaFotoGroup) => {
            let groupCount = 0;
            PROGRESS_LEVELS.forEach(level => {
                groupCount += group.fotos[level].length;
            });
            return count + groupCount;
        }, 0);

        let printHTML = '';

        // If 10 or fewer photos, use large 2-photos-per-page layout
        if (totalPhotos <= 10) {
            // Collect all photos with their info
            const allPhotos: { foto: Foto; koordinat: string; penerima: string; komponen: string; level: string }[] = [];
            filteredGroups.forEach((group: PenerimaFotoGroup) => {
                PROGRESS_LEVELS.forEach((level) => {
                    group.fotos[level].forEach((foto) => {
                        allPhotos.push({
                            foto: foto,
                            koordinat: foto.koordinat || '',
                            penerima: showPenerimaColumns ? group.penerima_nama : '',
                            komponen: group.komponen_nama,
                            level: level
                        });
                    });
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
            filteredGroups.forEach((group: PenerimaFotoGroup, index: number) => {
                let photoCells = '';
                PROGRESS_LEVELS.forEach((level) => {
                    const photos = group.fotos[level];

                    if (photos.length > 0) {
                        photoCells += `<td style="border: 1px solid #000; padding: 4px; text-align: center; vertical-align: top;">`;
                        photos.forEach(foto => {
                            photoCells += `
                                <div style="margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                                    <img src="${foto.foto_thumb_url || foto.foto_url}" style="width: 70px; height: 70px; object-fit: cover;" onerror="this.style.display='none'" />
                                    <div style="font-size: 7px; color: #666; margin-top: 2px; word-break: break-all; max-width: 80px;">${foto.koordinat || ''}</div>
                                </div>
                            `;
                        });
                        photoCells += `</td>`;
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

    /** unitIndex dari baris grup matriks — banyak foto di DB masih unit_index null */
    const [editingUnitIndex, setEditingUnitIndex] = useState<number | undefined>(undefined);

    const handleEdit = (foto: Foto, unitIndex?: number) => {
        setEditingFoto(foto);
        setEditingUnitIndex(
            unitIndex != null && unitIndex > 0
                ? unitIndex
                : (foto.unit_index != null && Number(foto.unit_index) > 0
                    ? Number(foto.unit_index)
                    : undefined),
        );
        setIsEditDialogOpen(true);
    };

    const resolveUnitIndexForFoto = (foto: Foto): number | undefined => {
        if (foto.unit_index != null && Number(foto.unit_index) > 0) {
            return Number(foto.unit_index);
        }
        const group = groupedFotos.find((g) =>
            PROGRESS_LEVELS.some((level) => g.fotos[level].some((f) => f.id === foto.id)),
        );
        return group?.unit_index;
    };

    const handleEditSuccess = () => {
        setIsEditDialogOpen(false);
        setIsUploadDialogOpen(false);
        setEditingFoto(null);
        setEditingUnitIndex(undefined);
        setUploadPreFill({});
        // Setelah GPS valid, jangan biarkan filter "invalid" menyembunyikan foto
        setKoordinatFilter('all');
        queryClient.invalidateQueries({ queryKey: ['fotos'] });
    };

    const handleCellClick = (group: PenerimaFotoGroup, level: string) => {
        if (group.isOrphanKomponen) {
            openAttachDialog(group);
            return;
        }

        if (group.penerima_id === 0) {
            const output = outputList.find(item => item.id === group.komponen_id);
            if (output && !output.penerima_is_optional) {
                toast.error('Tambahkan penerima terlebih dahulu sebelum upload foto untuk output ini.');
                return;
            }
        }

        setUploadPreFill({
            komponenId: group.komponen_id.toString(),
            penerimaId: group.penerima_id !== 0 ? group.penerima_id.toString() : '',
            keterangan: level,
            unit_index: group.unit_index?.toString() || ''
        });
        setIsUploadDialogOpen(true);
    };

    const collectGroupFotos = (group: PenerimaFotoGroup): Foto[] => {
        return PROGRESS_LEVELS.flatMap((level) => group.fotos[level]);
    };

    const openAttachDialog = (group: PenerimaFotoGroup, fotos?: Foto[]) => {
        const targets = fotos?.length ? fotos : collectGroupFotos(group);
        if (targets.length === 0) {
            toast.error('Tidak ada foto untuk dilampirkan');
            return;
        }
        if (outputList.length === 0) {
            toast.error('Belum ada komponen tersedia. Tambahkan output dulu di tab Output.');
            return;
        }
        setAttachGroup(group);
        setAttachFotos(targets);
        setAttachKomponenId(outputList[0]?.id?.toString() || '');
        setAttachPenerimaId('');
    };

    const closeAttachDialog = () => {
        setAttachGroup(null);
        setAttachFotos([]);
        setAttachKomponenId('');
        setAttachPenerimaId('');
    };

    const attachMutation = useMutation({
        mutationKey: ['fotos', 'attach-orphan'],
        mutationFn: async (payload: {
            fotos: Foto[];
            komponenId: number;
            penerimaId: number | null;
        }) => {
            for (const foto of payload.fotos) {
                const formData = new FormData();
                formData.append('komponen_id', String(payload.komponenId));
                if (payload.penerimaId != null && payload.penerimaId > 0) {
                    formData.append('penerima_id', String(payload.penerimaId));
                }
                // Selalu kirim progress valid — hindari null / format legacy yang gagal validasi
                formData.append('keterangan', normalizeFotoProgress(foto.keterangan));
                if (foto.koordinat) {
                    formData.append('koordinat', foto.koordinat);
                }
                if (foto.unit_index != null && Number(foto.unit_index) > 0) {
                    formData.append('unit_index', String(foto.unit_index));
                }
                // Jangan kirim file kosong — hanya update metadata
                await updateFoto({ id: foto.id, data: formData });
            }
        },
        onSuccess: (_data, variables) => {
            toast.success(
                variables.fotos.length > 1
                    ? `${variables.fotos.length} foto berhasil dilampirkan ke komponen`
                    : 'Foto berhasil dilampirkan ke komponen',
            );
            closeAttachDialog();
            queryClient.invalidateQueries({ queryKey: ['fotos'] });
        },
        onError: () => toast.error('Gagal melampirkan foto ke komponen'),
    });

    const handleAttachSubmit = () => {
        if (!attachKomponenId) {
            toast.error('Pilih komponen tujuan');
            return;
        }
        const targetOutput = outputList.find((o) => o.id.toString() === attachKomponenId);
        if (!targetOutput) {
            toast.error('Komponen tujuan tidak valid');
            return;
        }
        if (!targetOutput.penerima_is_optional) {
            if (penerimaList.length === 0) {
                toast.error('Komponen non-komunal memerlukan penerima. Tambahkan penerima dulu.');
                return;
            }
            if (!attachPenerimaId) {
                toast.error('Pilih penerima untuk komponen ini');
                return;
            }
        }
        attachMutation.mutate({
            fotos: attachFotos,
            komponenId: targetOutput.id,
            penerimaId: targetOutput.penerima_is_optional
                ? null
                : Number(attachPenerimaId),
        });
    };

    const deleteMutation = useMutation({
        mutationKey: ['fotos', 'delete'],
        mutationFn: (id: number) => deleteFoto(id),
        onSuccess: () => {
            toast.success('Foto berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['fotos'] });
        },
        onError: () => toast.error('Gagal menghapus foto')
    });

    const bulkDeleteMutation = useMutation({
        mutationKey: ['fotos', 'bulk-delete'],
        mutationFn: async (ids: number[]) => {
            const results = await Promise.allSettled(ids.map((id) => deleteFoto(id)));
            const failed = results.filter((r) => r.status === 'rejected').length;
            return { ok: results.length - failed, failed, total: results.length };
        },
        onSuccess: ({ ok, failed }) => {
            if (ok > 0) toast.success(`${ok} foto berhasil dihapus`);
            if (failed > 0) toast.error(`${failed} foto gagal dihapus`);
            setSelectedFotoIds([]);
            setBulkDeleteOpen(false);
            if (isCarouselOpen) {
                setIsCarouselOpen(false);
                setCarouselPhotos([]);
            }
            queryClient.invalidateQueries({ queryKey: ['fotos'] });
        },
        onError: () => toast.error('Gagal menghapus foto terpilih'),
    });

    const pageFotoIds = useMemo(() => {
        const ids: number[] = [];
        paginatedGroups.forEach((group) => {
            PROGRESS_LEVELS.forEach((level) => {
                group.fotos[level].forEach((f) => ids.push(f.id));
            });
        });
        return ids;
    }, [paginatedGroups]);

    const selectedFotoCount = selectedFotoIds.length;
    const allPageFotosSelected =
        pageFotoIds.length > 0 && pageFotoIds.every((id) => selectedFotoIds.includes(id));
    const somePageFotosSelected = pageFotoIds.some((id) => selectedFotoIds.includes(id));

    const toggleFotoSelection = (id: number, checked: boolean) => {
        setSelectedFotoIds((current) => {
            if (checked) return current.includes(id) ? current : [...current, id];
            return current.filter((x) => x !== id);
        });
    };

    const toggleAllPageFotos = (checked: boolean) => {
        setSelectedFotoIds((current) => {
            if (!checked) return current.filter((id) => !pageFotoIds.includes(id));
            return Array.from(new Set([...current, ...pageFotoIds]));
        });
    };

    const handleDelete = async () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSuccess: () => {
                    setSelectedFotoIds((current) => current.filter((id) => id !== deleteId));
                },
            });
            setDeleteId(null);
            // If we are in carousel, we might need to adjust or close it
            if (isCarouselOpen) {
                if (carouselPhotos.length <= 1) {
                    setIsCarouselOpen(false);
                } else {
                    const newPhotos = carouselPhotos.filter(p => p.id !== deleteId);
                    setCarouselPhotos(newPhotos);
                    setActivePhotoIndex(prev => Math.min(prev, newPhotos.length - 1));
                }
            }
        }
    };

    const openCarousel = (fotos: Foto[], index: number = 0) => {
        setCarouselPhotos(fotos);
        setActivePhotoIndex(index);
        setIsCarouselOpen(true);
    };

    const nextPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActivePhotoIndex((prev) => (prev + 1) % carouselPhotos.length);
    };

    const prevPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActivePhotoIndex((prev) => (prev - 1 + carouselPhotos.length) % carouselPhotos.length);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {incompleteRecipientRequirements.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="space-y-1">
                            <p className="font-medium">Jumlah penerima pekerjaan belum cukup untuk foto per penerima.</p>
                            <div className="text-sm">
                                {incompleteRecipientRequirements.map((item) => (
                                    <p key={item.id}>
                                        {item.name}: tersedia {item.availableRecipients} penerima pekerjaan, kebutuhan {item.targetRecipients}.
                                    </p>
                                ))}
                            </div>
                            <p className="text-sm">Tambahkan penerima di tab Penerima sebelum melengkapi dokumentasi output non-komunal.</p>
                        </div>
                    </div>
                </div>
            )}

            {koordinatSummary.invalid > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {koordinatSummary.invalid} foto koordinat invalid (di luar desa)
                                </p>
                                <p className="text-sm">
                                    Koordinat tidak sesuai desa/kecamatan pekerjaan. Filter daftar di
                                    bawah, buka foto, lalu <strong>Edit</strong> dan perbaiki koordinat
                                    (file foto tetap). Setelah valid, foto tetap di matriks (filter
                                    invalid akan dilepas otomatis).
                                </p>
                                <p className="text-xs text-red-800/80">
                                    Valid di desa: {koordinatSummary.valid} · Tanpa koordinat:{' '}
                                    {koordinatSummary.noCoords} · Total foto: {koordinatSummary.total}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                                variant={koordinatFilter === 'invalid' ? 'default' : 'outline'}
                                size="sm"
                                className={
                                    koordinatFilter === 'invalid'
                                        ? undefined
                                        : 'border-red-300 bg-white hover:bg-red-100'
                                }
                                onClick={() =>
                                    setKoordinatFilter((prev) =>
                                        prev === 'invalid' ? 'all' : 'invalid',
                                    )
                                }
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                {koordinatFilter === 'invalid'
                                    ? 'Tampilkan semua'
                                    : 'Filter hanya invalid'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 bg-white hover:bg-red-100"
                                onClick={() => openCarousel(invalidFotos, 0)}
                                disabled={invalidFotos.length === 0}
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Preview invalid
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {orphanKomponenFotoCount > 0 && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-950">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Link2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {orphanKomponenFotoCount} foto orphan (komponen tidak tersedia)
                                </p>
                                <p className="text-sm">
                                    Foto ini terikat ke komponen yang sudah dihapus/tidak ada di daftar output.
                                    Lampirkan ke komponen yang masih tersedia agar masuk matriks progress.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-orange-300 bg-white hover:bg-orange-100"
                            onClick={() => {
                                const allOrphanFotos = orphanKomponenGroups.flatMap(collectGroupFotos);
                                const firstGroup = orphanKomponenGroups[0];
                                if (!firstGroup || allOrphanFotos.length === 0) return;
                                openAttachDialog(firstGroup, allOrphanFotos);
                            }}
                        >
                            <Link2 className="mr-2 h-4 w-4" />
                            Lampirkan semua
                        </Button>
                    </div>
                </div>
            )}

            {/* Checklist Progress Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {outputProgressSummary.map((item: OutputProgressSummaryItem) => (
                    <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${selectedKomponen === item.id.toString() ? 'ring-2 ring-primary bg-primary/5' : ''}`} onClick={() => setSelectedKomponen(item.id.toString())}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-sm line-clamp-2 h-10">{item.name}</h3>
                                {item.isComplete ? (
                                    <div className="bg-green-100 text-green-700 p-1 rounded-full">
                                        <Check className="h-3 w-3" />
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-primary leading-none">{item.mainLabel}</span>
                                        {item.totalLabel && <span className="text-xs text-muted-foreground ml-0.5">/{item.totalLabel}</span>}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${item.isComplete ? 'bg-green-500' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                        {item.subLabel}
                                    </span>
                                    {item.isComplete ? (
                                        <span className="text-[10px] text-green-600 font-bold">LENGKAP</span>
                                    ) : item.recipientsReady === false ? (
                                        <span className="text-[10px] text-amber-600 font-bold">
                                            PENERIMA {item.recipientCount}/{item.recipientTarget}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter dan Cetak */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Filter Komponen:</span>
                        <Select value={selectedKomponen} onValueChange={setSelectedKomponen}>
                            <SelectTrigger className="w-[220px]">
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
                        <span className="text-sm font-medium">Koordinat:</span>
                        <Select
                            value={koordinatFilter}
                            onValueChange={(v) => setKoordinatFilter(v as KoordinatFilter)}
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Status koordinat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua ({koordinatSummary.total})
                                </SelectItem>
                                <SelectItem value="invalid">
                                    Invalid / luar desa ({koordinatSummary.invalid})
                                </SelectItem>
                                <SelectItem value="valid">
                                    Valid di desa ({koordinatSummary.valid})
                                </SelectItem>
                                <SelectItem value="no_coords">
                                    Tanpa koordinat ({koordinatSummary.noCoords})
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedFotoCount > 0 && (
                        <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                            <span className="text-sm font-medium">{selectedFotoCount} foto terpilih</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-0 text-xs"
                                onClick={() => setSelectedFotoIds([])}
                                disabled={bulkDeleteMutation.isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-auto px-2 py-0 text-xs"
                                onClick={() => setBulkDeleteOpen(true)}
                                disabled={bulkDeleteMutation.isPending}
                            >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Hapus
                            </Button>
                        </div>
                    )}
                    {pageFotoIds.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAllPageFotos(!allPageFotosSelected)}
                        >
                            {allPageFotosSelected ? 'Batalkan halaman' : 'Pilih halaman'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handlePrintPDF}
                        disabled={filteredGroups.length === 0}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Foto
                    </Button>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px] text-center">
                                    <Checkbox
                                        checked={
                                            allPageFotosSelected
                                                ? true
                                                : somePageFotosSelected
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={(value) => toggleAllPageFotos(value === true)}
                                        aria-label="Pilih semua foto di halaman"
                                        disabled={pageFotoIds.length === 0}
                                    />
                                </TableHead>
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
                                    <TableCell colSpan={10} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">Tidak ada foto. Gunakan form di atas untuk upload foto.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedGroups.map((group: PenerimaFotoGroup, index: number) => {
                                    const groupFotoIds = PROGRESS_LEVELS.flatMap((level) =>
                                        group.fotos[level].map((f) => f.id),
                                    );
                                    const groupSelectedCount = groupFotoIds.filter((id) =>
                                        selectedFotoIds.includes(id),
                                    ).length;
                                    const groupAllSelected =
                                        groupFotoIds.length > 0 && groupSelectedCount === groupFotoIds.length;
                                    const groupSomeSelected =
                                        groupSelectedCount > 0 && groupSelectedCount < groupFotoIds.length;

                                    return (
                                    <TableRow
                                        key={`${group.penerima_id}-${group.komponen_id}-${group.penerima_nama}-${group.isOrphanKomponen ? 'orphan' : 'ok'}`}
                                        className={group.isOrphanKomponen ? 'bg-orange-50/70' : undefined}
                                    >
                                        <TableCell className="text-center align-middle">
                                            <Checkbox
                                                checked={
                                                    groupAllSelected
                                                        ? true
                                                        : groupSomeSelected
                                                          ? 'indeterminate'
                                                          : false
                                                }
                                                disabled={groupFotoIds.length === 0}
                                                onCheckedChange={(value) => {
                                                    const checked = value === true;
                                                    setSelectedFotoIds((current) => {
                                                        if (!checked) {
                                                            return current.filter((id) => !groupFotoIds.includes(id));
                                                        }
                                                        return Array.from(new Set([...current, ...groupFotoIds]));
                                                    });
                                                }}
                                                aria-label={`Pilih semua foto baris ${index + 1}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        {showPenerimaColumns && (
                                            <>
                                                <TableCell
                                                    className={cn(
                                                        "font-medium text-sm transition-colors group/name",
                                                        group.isOrphanKomponen
                                                            ? "text-orange-800"
                                                            : group.penerima_id === 0
                                                              ? "text-amber-700"
                                                              : "cursor-pointer hover:text-primary"
                                                    )}
                                                    onClick={() => {
                                                        if (group.isOrphanKomponen) {
                                                            openAttachDialog(group);
                                                            return;
                                                        }
                                                        if (group.penerima_id !== 0) {
                                                            handleCellClick(group, PROGRESS_LEVELS[0]);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {group.penerima_nama}
                                                        {group.isOrphanKomponen ? (
                                                            <Link2 className="h-3 w-3 opacity-70" />
                                                        ) : group.penerima_id !== 0 ? (
                                                            <Upload className="h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {group.penerima_nik}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell
                                            className={cn(
                                                "text-sm transition-colors group/comp",
                                                group.isOrphanKomponen
                                                    ? "text-orange-800 font-medium cursor-pointer hover:text-orange-950"
                                                    : group.penerima_id === 0 && !outputList.find(item => item.id === group.komponen_id)?.penerima_is_optional
                                                      ? "text-muted-foreground"
                                                      : "text-muted-foreground cursor-pointer hover:text-primary"
                                            )}
                                            onClick={() => handleCellClick(group, PROGRESS_LEVELS[0])}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    {group.komponen_nama}
                                                    {group.isOrphanKomponen ? (
                                                        <Link2 className="h-3 w-3 opacity-70" />
                                                    ) : (
                                                        <Upload className="h-3 w-3 opacity-0 group-hover/comp:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                                {group.isOrphanKomponen ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 w-fit border-orange-300 bg-white px-2 text-xs text-orange-900 hover:bg-orange-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAttachDialog(group);
                                                        }}
                                                    >
                                                        <Link2 className="mr-1 h-3 w-3" />
                                                        Lampirkan ke komponen
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        {PROGRESS_LEVELS.map((level) => {
                                            const fotos = group.fotos[level];
                                            const hasPhotos = fotos.length > 0;

                                            return (
                                                <TableCell key={level} className="text-center p-2 align-middle">
                                                    <div className="flex flex-col items-center justify-center min-h-[80px] gap-2">
                                                        {hasPhotos ? (
                                                            <div className="relative group/stack flex flex-col items-center">
                                                                {/* Stack Effect for multiple photos */}
                                                                {fotos.length > 1 && (
                                                                    <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1">
                                                                        <div className="absolute inset-0 w-16 h-16 rounded-lg bg-muted border border-muted-foreground/10 -rotate-3 translate-x-1" />
                                                                        <div className="absolute inset-0 w-16 h-16 rounded-lg bg-muted border border-muted-foreground/20 rotate-3 translate-x-0.5" />
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Main Photo Card */}
                                                                <div
                                                                   className={cn(
                                                                       "relative w-16 h-16 rounded-lg border-2 shadow-md overflow-hidden bg-muted cursor-pointer hover:scale-105 transition-transform active:scale-95",
                                                                       fotos.some((f) => isFotoKoordinatInvalid(f))
                                                                           ? "border-red-500 ring-2 ring-red-400/60"
                                                                           : selectedFotoIds.includes(fotos[0].id)
                                                                           ? "border-primary ring-2 ring-primary/40"
                                                                           : "border-background",
                                                                   )}
                                                                   onClick={() => openCarousel(fotos, 0)}
                                                                >
                                                                    <img
                                                                        src={getFotoThumbUrl(fotos[0])}
                                                                        alt={`Foto ${level}`}
                                                                        loading="lazy"
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-size="10"%3ENo Img%3C/text%3E%3C/svg%3E';
                                                                        }}
                                                                    />

                                                                    <div
                                                                        className="absolute left-0.5 top-0.5 z-10"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Checkbox
                                                                            checked={selectedFotoIds.includes(fotos[0].id)}
                                                                            onCheckedChange={(value) => {
                                                                                // Jika multi-foto di slot, pilih semua di slot saat cek
                                                                                if (value === true) {
                                                                                    setSelectedFotoIds((current) =>
                                                                                        Array.from(
                                                                                            new Set([
                                                                                                ...current,
                                                                                                ...fotos.map((f) => f.id),
                                                                                            ]),
                                                                                        ),
                                                                                    );
                                                                                } else {
                                                                                    const slotIds = new Set(fotos.map((f) => f.id));
                                                                                    setSelectedFotoIds((current) =>
                                                                                        current.filter((id) => !slotIds.has(id)),
                                                                                    );
                                                                                }
                                                                            }}
                                                                            aria-label={`Pilih foto ${level}`}
                                                                            className="border-white bg-black/40 data-[state=checked]:bg-primary"
                                                                        />
                                                                    </div>
                                                                    
                                                                    {/* Photo Count Badge */}
                                                                    {fotos.length > 1 && (
                                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs pointer-events-none">
                                                                            +{fotos.length}
                                                                        </div>
                                                                    )}

                                                                    {isFotoKoordinatInvalid(fotos[0]) && (
                                                                        <div
                                                                            className="absolute right-0.5 top-0.5 z-10 rounded bg-red-600 px-1 py-0.5 text-[8px] font-bold uppercase leading-none text-white shadow"
                                                                            title={
                                                                                fotos[0].validasi_koordinat_message ||
                                                                                'Koordinat di luar desa'
                                                                            }
                                                                        >
                                                                            GPS!
                                                                        </div>
                                                                    )}

                                                                    {/* Action Hover Buttons */}
                                                                    <div className="absolute inset-x-0 bottom-0 flex justify-around p-1 bg-black/60 translate-y-full group-hover/stack:translate-y-0 transition-transform">
                                                                        <button 
                                                                           onClick={(e) => {
                                                                               e.stopPropagation();
                                                                               handleEdit(fotos[0], group.unit_index);
                                                                           }}
                                                                           className="text-white hover:text-primary transition-colors"
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </button>
                                                                        <button 
                                                                           onClick={(e) => { e.stopPropagation(); setDeleteId(fotos[0].id); }}
                                                                           className="text-white hover:text-destructive transition-colors"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Coordinate info */}
                                                                {fotos[0].koordinat && (
                                                                    <div
                                                                        className={cn(
                                                                            'mt-1 flex max-w-[70px] items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px]',
                                                                            isFotoKoordinatInvalid(fotos[0])
                                                                                ? 'bg-red-100 text-red-700'
                                                                                : 'bg-muted/50 text-muted-foreground',
                                                                        )}
                                                                        title={
                                                                            fotos[0].validasi_koordinat_message ||
                                                                            fotos[0].koordinat
                                                                        }
                                                                    >
                                                                        <MapPin className="h-2 w-2 shrink-0" />
                                                                        <span className="truncate">{fotos[0].koordinat}</span>
                                                                    </div>
                                                                )}
                                                                {isFotoKoordinatInvalid(fotos[0]) &&
                                                                    fotos[0].validasi_koordinat_message && (
                                                                        <p
                                                                            className="mt-0.5 max-w-[72px] truncate text-[7px] font-medium text-red-600"
                                                                            title={fotos[0].validasi_koordinat_message}
                                                                        >
                                                                            {fotos[0].validasi_koordinat_message}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        ) : (
                                                           /* Empty State / Upload Placeholder */
                                                           <div 
                                                               className={cn(
                                                                   "w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-all group/upload",
                                                                   group.isOrphanKomponen
                                                                       ? "border-orange-300 bg-orange-50 cursor-pointer"
                                                                       : group.penerima_id === 0 && !outputList.find(item => item.id === group.komponen_id)?.penerima_is_optional
                                                                         ? "border-amber-300 bg-amber-50 cursor-not-allowed"
                                                                         : "border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 cursor-pointer"
                                                               )}
                                                               onClick={() => handleCellClick(group, level)}
                                                           >
                                                               {group.isOrphanKomponen ? (
                                                                   <Link2 className="h-5 w-5 text-orange-500 group-hover/upload:scale-110 transition-all" />
                                                               ) : (
                                                                   <Upload className="h-5 w-5 text-muted-foreground/50 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all" />
                                                               )}
                                                           </div>
                                                        )}

                                                        {/* Small consistent upload / attach button if photos already exist */}
                                                        {hasPhotos && (
                                                            <Button 
                                                               variant="ghost" 
                                                               size="icon" 
                                                               className={cn(
                                                                   "h-6 w-16 mt-1 border border-dashed opacity-50 hover:opacity-100 transition-all",
                                                                   group.isOrphanKomponen
                                                                       ? "border-orange-300 hover:bg-orange-100 hover:text-orange-900"
                                                                       : "hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                                                               )}
                                                               onClick={() => {
                                                                   if (group.isOrphanKomponen) {
                                                                       openAttachDialog(group, fotos);
                                                                   } else {
                                                                       handleCellClick(group, level);
                                                                   }
                                                               }}
                                                               title={group.isOrphanKomponen ? 'Lampirkan ke komponen' : 'Upload foto'}
                                                            >
                                                                {group.isOrphanKomponen ? <Link2 className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                    );
                                })
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
                            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Attach orphan foto ke komponen tersedia */}
            <Dialog open={!!attachGroup} onOpenChange={(open) => !open && closeAttachDialog()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Lampirkan foto ke komponen</DialogTitle>
                        <DialogDescription>
                            {attachFotos.length} foto dari{' '}
                            <span className="font-medium text-foreground">
                                {attachGroup?.komponen_nama || 'komponen orphan'}
                            </span>{' '}
                            akan dipindahkan ke komponen yang dipilih. Slot progress (0%–100%) tetap.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Komponen tujuan</Label>
                            <Select
                                value={attachKomponenId}
                                onValueChange={(value) => {
                                    setAttachKomponenId(value);
                                    setAttachPenerimaId('');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih komponen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {outputList.map((output) => (
                                        <SelectItem key={output.id} value={output.id.toString()}>
                                            {output.komponen}
                                            {output.penerima_is_optional ? ' (Komunal)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {attachNeedsPenerima ? (
                            <div className="space-y-2">
                                <Label>Penerima</Label>
                                {penerimaList.length === 0 ? (
                                    <p className="text-sm text-amber-700">
                                        Belum ada penerima. Tambahkan di tab Penerima sebelum melampirkan.
                                    </p>
                                ) : (
                                    <Select value={attachPenerimaId} onValueChange={setAttachPenerimaId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih penerima" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {penerimaList.map((penerima) => (
                                                <SelectItem key={penerima.id} value={penerima.id.toString()}>
                                                    {penerima.nama}
                                                    {penerima.is_komunal ? ' (Komunal)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeAttachDialog} disabled={attachMutation.isPending}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleAttachSubmit} disabled={attachMutation.isPending || !attachKomponenId}>
                            {attachMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    Lampirkan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) {
                        setEditingFoto(null);
                        setEditingUnitIndex(undefined);
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Foto</DialogTitle>
                    </DialogHeader>
                    {editingFoto && (
                        <EmbeddedFotoForm
                            key={`edit-foto-${editingFoto.id}-${editingUnitIndex ?? 'na'}`}
                            pekerjaanId={pekerjaanId}
                            pekerjaan={pekerjaan}
                            foto={editingFoto}
                            initialUnitIndex={editingUnitIndex}
                            onSuccess={handleEditSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Upload Foto Progress {uploadPreFill.keterangan}</DialogTitle>
                    </DialogHeader>
                    <EmbeddedFotoForm
                        pekerjaanId={pekerjaanId}
                        pekerjaan={pekerjaan}
                        onSuccess={handleEditSuccess}
                        preFill={uploadPreFill}
                    />
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

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus {selectedFotoCount} foto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedFotoCount} foto terpilih akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            disabled={bulkDeleteMutation.isPending}
                            onClick={() => bulkDeleteMutation.mutate(selectedFotoIds)}
                        >
                            {bulkDeleteMutation.isPending ? 'Menghapus...' : 'Hapus semua terpilih'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Carousel Dialog */}
            <Dialog open={isCarouselOpen} onOpenChange={setIsCarouselOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="flex h-[90vh] w-[calc(100%-2rem)] max-w-5xl flex-col gap-0 overflow-hidden border-none bg-black/95 p-0 sm:max-w-5xl"
                    aria-describedby={undefined}
                >
                    <DialogTitle className="sr-only">
                        Pratinjau foto progress{' '}
                        {carouselPhotos[activePhotoIndex]?.keterangan || ''}
                        {carouselPhotos.length > 0
                            ? ` (${activePhotoIndex + 1} dari ${carouselPhotos.length})`
                            : ''}
                    </DialogTitle>
                    <div className="relative h-[85vh] flex flex-col">
                        {/* Close Button Overlay */}
                        <button 
                            type="button"
                            onClick={() => setIsCarouselOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                            aria-label="Tutup pratinjau"
                        >
                            <X size={24} />
                        </button>

                        {/* Photo Display */}
                        <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
                            {carouselPhotos.length > 0 && (
                                <div className="relative group/viewer w-full h-full flex items-center justify-center">
                                    <img 
                                        src={getFotoFullUrl(carouselPhotos[activePhotoIndex])} 
                                        alt="Full View" 
                                        className="max-w-full max-h-full object-contain shadow-2xl animate-in fade-in zoom-in duration-300"
                                    />
                                    
                                    {/* Info Overlay */}
                                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-xl text-white border border-white/10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-primary text-[10px] font-bold rounded uppercase tracking-wider">
                                                        Progress {carouselPhotos[activePhotoIndex].keterangan}
                                                    </span>
                                                    {isFotoKoordinatInvalid(carouselPhotos[activePhotoIndex]) ? (
                                                        <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                            Koordinat invalid
                                                        </span>
                                                    ) : carouselPhotos[activePhotoIndex].validasi_koordinat === true ? (
                                                        <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                            Koordinat valid
                                                        </span>
                                                    ) : null}
                                                    <span className="text-xs text-white/60">
                                                        {activePhotoIndex + 1} of {carouselPhotos.length}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold truncate">
                                                    {carouselPhotos[activePhotoIndex].penerima?.nama || 'Output Komunal'}
                                                </p>
                                                {isFotoKoordinatInvalid(carouselPhotos[activePhotoIndex]) &&
                                                    carouselPhotos[activePhotoIndex].validasi_koordinat_message && (
                                                        <p className="text-xs text-red-200">
                                                            {carouselPhotos[activePhotoIndex].validasi_koordinat_message}
                                                        </p>
                                                    )}
                                            </div>
                                            
                                            {carouselPhotos[activePhotoIndex].koordinat && (
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px]',
                                                        isFotoKoordinatInvalid(carouselPhotos[activePhotoIndex])
                                                            ? 'border-red-400/40 bg-red-600/30'
                                                            : 'border-white/5 bg-white/10',
                                                    )}
                                                >
                                                    <MapPin size={14} className="text-primary" />
                                                    <span className="font-mono">{carouselPhotos[activePhotoIndex].koordinat}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-8 gap-2"
                                                    onClick={() => {
                                                        const foto = carouselPhotos[activePhotoIndex];
                                                        handleEdit(foto, resolveUnitIndexForFoto(foto));
                                                    }}
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    className="h-8 gap-2"
                                                    onClick={() => setDeleteId(carouselPhotos[activePhotoIndex].id)}
                                                >
                                                    <Trash2 size={14} />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation Controls */}
                                    {carouselPhotos.length > 1 && (
                                        <>
                                            <button 
                                                onClick={prevPhoto}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all bg-black/20 hover:bg-black/40 rounded-r-2xl"
                                            >
                                                <ChevronLeft size={48} />
                                            </button>
                                            <button 
                                                onClick={nextPhoto}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all bg-black/20 hover:bg-black/40 rounded-l-2xl"
                                            >
                                                <ChevronRight size={48} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails list at the bottom */}
                        {carouselPhotos.length > 1 && (
                            <div className="h-24 px-8 pb-4 flex items-center justify-center gap-2 overflow-x-auto border-t border-white/10">
                                {carouselPhotos.map((photo, idx) => (
                                    <button 
                                        key={photo.id}
                                        onClick={() => setActivePhotoIndex(idx)}
                                        className={cn(
                                            "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                                            activePhotoIndex === idx ? "border-primary scale-110 shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "border-transparent opacity-50 hover:opacity-80"
                                        )}
                                    >
                                        <img src={getFotoThumbUrl(photo)} className="w-full h-full object-cover" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
