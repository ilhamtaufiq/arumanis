import React, { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPekerjaan } from '../api/pekerjaan';
import {
    useBulkDeletePekerjaan,
    useDeletePekerjaan,
    usePekerjaanList,
    useUpdatePekerjaan,
} from '../hooks/usePekerjaan';
import { getTags } from '../api/tags';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import { getPengawas } from '@/features/pengawas/api/pengawas';
import api from '@/lib/api-client';
import type { KegiatanResponse, Kegiatan } from '@/features/kegiatan/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { toast } from 'sonner';
import { Check, ChevronDown, FileDown, FileUp, Pencil, Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { ImportPekerjaanDialog } from './ImportPekerjaanDialog';
import { useAuthStore } from '@/stores/auth-stores';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { PekerjaanTagSelect } from './PekerjaanTagSelect';
import type { Pekerjaan, Tag } from '../types';
import type { Pengawas } from '@/features/pengawas/types';


interface PekerjaanRowProps {
    item: Pekerjaan;
    isAdmin: boolean;
    isSelected: boolean;
    onToggleSelected: (id: number, selected: boolean) => void;
    updatingRow: number | null;
    pengawasList: Pengawas[];
    handleUpdatePengawas: (
        pekerjaanId: number,
        field: 'pengawas_id' | 'pendamping_id',
        value: number | null,
    ) => void;
    handleUpdateTags: (pekerjaanId: number, tags: Tag[]) => void;
    handleUpdateNamaPaket: (pekerjaanId: number, namaPaket: string) => void;
    onDeleteRequest: (id: number) => void;
}

// Memoized Row to prevent re-rendering all rows when only one changes
const PekerjaanRow = React.memo(({
    item,
    isAdmin,
    isSelected,
    onToggleSelected,
    updatingRow,
    pengawasList,
    handleUpdatePengawas,
    handleUpdateTags,
    handleUpdateNamaPaket,
    onDeleteRequest,
}: PekerjaanRowProps) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState(item.nama_paket || '');

    React.useEffect(() => {
        if (!isEditingName) {
            setNameDraft(item.nama_paket || '');
        }
    }, [isEditingName, item.nama_paket]);

    const saveName = () => {
        const nextName = nameDraft.trim();

        if (!nextName) {
            toast.error('Nama paket tidak boleh kosong');
            setNameDraft(item.nama_paket || '');
            return;
        }

        setIsEditingName(false);

        if (nextName !== item.nama_paket) {
            handleUpdateNamaPaket(item.id, nextName);
        }
    };

    const cancelNameEdit = () => {
        setNameDraft(item.nama_paket || '');
        setIsEditingName(false);
    };

    return (
        <TableRow key={item.id}>
            <TableCell>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onToggleSelected(item.id, checked === true)}
                    aria-label={`Pilih pekerjaan ${item.nama_paket}`}
                />
            </TableCell>
            <TableCell className="font-medium">
                {isEditingName ? (
                    <div className="flex min-w-[280px] items-center gap-2">
                        <Input
                            value={nameDraft}
                            onChange={(event) => setNameDraft(event.target.value)}
                            onBlur={saveName}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    saveName();
                                }

                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    cancelNameEdit();
                                }
                            }}
                            disabled={updatingRow === item.id}
                            autoFocus
                            className="h-8 min-w-[220px] text-sm font-medium"
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={saveName}
                            disabled={updatingRow === item.id}
                            title="Simpan nama paket"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={cancelNameEdit}
                            disabled={updatingRow === item.id}
                            title="Batalkan edit nama paket"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex min-w-[280px] items-start gap-2">
                        <button
                            type="button"
                            className={isAdmin ? 'cursor-text text-left leading-snug hover:text-primary' : 'text-left leading-snug'}
                            onDoubleClick={() => isAdmin && setIsEditingName(true)}
                            title={isAdmin ? 'Double click untuk edit nama paket' : undefined}
                        >
                            {item.nama_paket}
                        </button>
                    </div>
                )}
                <div className="text-xs text-muted-foreground">{item.kode_rekening}</div>
                <PekerjaanTagSelect
                    selectedTags={item.tags || []}
                    disabled={updatingRow === item.id}
                    onChange={(tags: Tag[]) => handleUpdateTags(item.id, tags)}
                />
            </TableCell>
            <TableCell>{item.kegiatan?.nama_sub_kegiatan || '-'}</TableCell>
            <TableCell>{item.kecamatan?.nama_kecamatan || '-'}</TableCell>
            <TableCell>{item.desa?.nama_desa || '-'}</TableCell>
            <TableCell>
                <Select
                    value={(item.pengawas_id || 0).toString()}
                    onValueChange={(val) => handleUpdatePengawas(item.id, 'pengawas_id', val === '0' ? null : parseInt(val))}
                    disabled={updatingRow === item.id}
                >
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="Pilih Pengawas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Belum Ada</SelectItem>
                        {pengawasList.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <Select
                    value={(item.pendamping_id || 0).toString()}
                    onValueChange={(val) => handleUpdatePengawas(item.id, 'pendamping_id', val === '0' ? null : parseInt(val))}
                    disabled={updatingRow === item.id}
                >
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="Pilih Pendamping" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Belum Ada</SelectItem>
                        {pengawasList.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="whitespace-nowrap">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.pagu || 0)}
            </TableCell>
            <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">
                {isAdmin ? (
                    <ListRowActions
                        edit={(
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Edit Pekerjaan">
                                <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        onDelete={() => onDeleteRequest(item.id)}
                    />
                ) : (
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Edit Pekerjaan">
                        <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
});

PekerjaanRow.displayName = 'PekerjaanRow';

export default function PekerjaanList() {
    const queryClient = useQueryClient();
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [selectedKegiatan, setSelectedKegiatan] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [selectedPengawas, setSelectedPengawas] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('updated_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [updatingRow, setUpdatingRow] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    // Queries
    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
    });
    const kecamatanList = kecamatanRes?.data || [];

    const { data: kegiatanRes } = useQuery({
        queryKey: ['kegiatan', { tahun: tahunAnggaran }],
        queryFn: () => api.get<KegiatanResponse>('/kegiatan', { params: { tahun: tahunAnggaran, per_page: -1 } }),
        enabled: !!tahunAnggaran,
    });
    const kegiatanList = kegiatanRes?.data || [];

    const { data: tagRes } = useQuery({
        queryKey: ['tags'],
        queryFn: () => getTags(),
    });
    const tagList = tagRes?.data || [];

    const { data: pengawasRes } = useQuery({
        queryKey: ['pengawas'],
        queryFn: () => getPengawas(),
    });
    const pengawasList = pengawasRes?.data || [];

    const pekerjaanFilters = useMemo(() => ({
        page: currentPage,
        kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
        kegiatan_id: selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan),
        tag_id: selectedTag === 'all' ? undefined : parseInt(selectedTag),
        pengawas_id: selectedPengawas === 'all' ? undefined : parseInt(selectedPengawas),
        search: debouncedSearch || undefined,
        tahun: tahunAnggaran,
        sort_by: sortBy,
        sort_direction: sortDirection,
    }), [currentPage, selectedKecamatan, selectedKegiatan, selectedTag, selectedPengawas, debouncedSearch, tahunAnggaran, sortBy, sortDirection]);

    const { data: pekerjaanRes, isLoading: loading } = usePekerjaanList(pekerjaanFilters, !!tahunAnggaran);
    
    const pekerjaanList = pekerjaanRes?.data || [];
    const totalPages = pekerjaanRes?.meta?.last_page || 1;
    const total = pekerjaanRes?.meta?.total || 0;
    const selectedCount = selectedIds.length;
    const allVisibleSelected = pekerjaanList.length > 0 && pekerjaanList.every((item) => selectedIds.includes(item.id));
    const someVisibleSelected = pekerjaanList.some((item) => selectedIds.includes(item.id));


    const handleSearch = useCallback((val: string) => {
        setDebouncedSearch(val);
        setCurrentPage(1);
    }, []);

    const toggleSelection = (id: number, checked: boolean) => {
        setSelectedIds((current) => {
            if (checked) {
                return current.includes(id) ? current : [...current, id];
            }
            return current.filter((selectedId) => selectedId !== id);
        });
    };

    const toggleAllVisible = (checked: boolean) => {
        const visibleIds = pekerjaanList.map((item) => item.id);
        setSelectedIds((current) => {
            if (!checked) {
                return current.filter((selectedId) => !visibleIds.includes(selectedId));
            }

            return Array.from(new Set([...current, ...visibleIds]));
        });
    };

    const deleteMutation = useDeletePekerjaan();
    const bulkDeleteMutation = useBulkDeletePekerjaan();
    const updateMutation = useUpdatePekerjaan({ onSettled: () => setUpdatingRow(null) });

    const handleConfirmDelete = () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSettled: () => setDeleteId(null),
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        bulkDeleteMutation.mutate(selectedIds, {
            onSuccess: (_, ids) => {
                setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
            },
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleUpdatePengawas = async (pekerjaanId: number, field: 'pengawas_id' | 'pendamping_id', value: number | null) => {
        setUpdatingRow(pekerjaanId);
        updateMutation.mutate({ id: pekerjaanId, data: { [field]: value } });
    };

    const handleUpdateTags = async (pekerjaanId: number, tags: Tag[]) => {
        setUpdatingRow(pekerjaanId);
        updateMutation.mutate({
            id: pekerjaanId,
            data: { tag_ids: tags.map((tag) => tag.id) },
        });
    };

    const handleUpdateNamaPaket = async (pekerjaanId: number, namaPaket: string) => {
        setUpdatingRow(pekerjaanId);
        updateMutation.mutate({ id: pekerjaanId, data: { nama_paket: namaPaket } });
    };

    const handleExportPDF = async () => {
        try {
            toast.loading('Mengambil semua data...');

            // Fetch ALL records with current filters
            const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);
            const kegiatanId = selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan);
            const tagId = selectedTag === 'all' ? undefined : parseInt(selectedTag);
            const pengawasId = selectedPengawas === 'all' ? undefined : parseInt(selectedPengawas);

            const response = await getPekerjaan({
                per_page: -1,
                kecamatan_id: kecamatanId,
                kegiatan_id: kegiatanId,
                tag_id: tagId,
                pengawas_id: pengawasId,
                search: debouncedSearch || undefined,
                tahun: tahunAnggaran
            });

            toast.dismiss();

            const allData = response.data;

            if (allData.length === 0) {
                toast.error('Tidak ada data untuk diekspor');
                return;
            }

            const doc = new jsPDF('landscape');
            const timestamp = new Date().toLocaleString('id-ID');

            // Title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DAFTAR PEKERJAAN', 148, 15, { align: 'center' });

            // Subtitle & timestamp
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Tahun Anggaran: ${tahunAnggaran || '-'} | Tanggal Cetak: ${timestamp}`, 148, 22, { align: 'center' });

            // Filter info
            let filterInfo = '';
            if (selectedKecamatan !== 'all') {
                const kec = kecamatanList.find(k => k.id.toString() === selectedKecamatan);
                filterInfo += `Kecamatan: ${kec?.nama_kecamatan || '-'} | `;
            }
            if (selectedPengawas !== 'all') {
                const pengawas = pengawasList.find(p => p.id.toString() === selectedPengawas);
                filterInfo += `Pengawas: ${pengawas?.nama || '-'} | `;
            }
            if (filterInfo) {
                doc.text(filterInfo.replace(/ \| $/, ''), 148, 28, { align: 'center' });
            }

            // Table data - use allData instead of pekerjaanList
            const tableData = allData.map((item, index) => [
                (index + 1).toString(),
                item.nama_paket,
                item.kegiatan?.nama_sub_kegiatan || '-',
                item.kecamatan?.nama_kecamatan || '-',
                item.desa?.nama_desa || '-',
                item.pengawas?.nama || '-',
                `Rp ${item.pagu.toLocaleString('id-ID')}`,
            ]);

            // Generate table
            autoTable(doc, {
                startY: filterInfo ? 33 : 27,
                head: [['No', 'Nama Paket', 'Sub Kegiatan', 'Kecamatan', 'Desa', 'Pengawas', 'Pagu']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center',
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 30 },
                    5: { cellWidth: 35 },
                    6: { halign: 'right', cellWidth: 35 },
                },
            });

            // Save
            const fileName = `Daftar_Pekerjaan_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            toast.success(`PDF berhasil diunduh (${allData.length} data)`);
        } catch (error) {
            toast.dismiss();
            console.error('Failed to export PDF:', error);
            toast.error('Gagal mengekspor PDF');
        }
    };

    const handleExportExcel = async () => {
        try {
            toast.loading('Mengambil semua data untuk Excel...');

            // Fetch ALL records with current filters
            const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan)
            const kegiatanId = selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan)
            const tagId = selectedTag === 'all' ? undefined : parseInt(selectedTag)
            const pengawasId = selectedPengawas === 'all' ? undefined : parseInt(selectedPengawas)

            const response = await getPekerjaan({
                per_page: -1,
                kecamatan_id: kecamatanId,
                kegiatan_id: kegiatanId,
                tag_id: tagId,
                pengawas_id: pengawasId,
                search: debouncedSearch || undefined,
                tahun: tahunAnggaran
            })

            toast.dismiss()

            const allData = response.data

            if (allData.length === 0) {
                toast.error('Tidak ada data untuk diekspor')
                return
            }

            // Transform data for Excel
            const excelData = allData.map((item, index) => ({
                'No': index + 1,
                'Kode Rekening': item.kode_rekening || '-',
                'Nama Paket': item.nama_paket,
                'Sub Kegiatan': item.kegiatan?.nama_sub_kegiatan || '-',
                'Kecamatan': item.kecamatan?.nama_kecamatan || '-',
                'Desa': item.desa?.nama_desa || '-',
                'Pagu': item.pagu,
                'Pengawas': item.pengawas?.nama || '-',
                'Pendamping': item.pendamping?.nama || '-',
                'Tags': item.tags?.map(t => t.name).join(', ') || '-',
            }))

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Pekerjaan")

            // Set column widths
            const wscols = [
                { wch: 5 },  // No
                { wch: 20 }, // Kode Rekening
                { wch: 50 }, // Nama Paket
                { wch: 40 }, // Sub Kegiatan
                { wch: 20 }, // Kecamatan
                { wch: 20 }, // Desa
                { wch: 15 }, // Pagu
                { wch: 25 }, // Pengawas
                { wch: 25 }, // Pendamping
                { wch: 30 }, // Tags
            ]
            worksheet['!cols'] = wscols

            // Save file
            const fileName = `Daftar_Pekerjaan_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(workbook, fileName)
            toast.success(`Excel berhasil diunduh (${allData.length} data)`)
        } catch (error) {
            toast.dismiss()
            console.error('Failed to export Excel:', error)
            toast.error('Gagal mengekspor Excel')
        }
    };

    return (
        <>
            <ListPageLayout
                shell
                title="Daftar Pekerjaan"
                description="Kelola data pekerjaan dan paket"
                cardTitle="Data Pekerjaan"
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={handleExportPDF}>
                            <FileDown className="mr-2 h-4 w-4" /> Ekspor PDF
                        </Button>
                        <Button variant="outline" onClick={handleExportExcel}>
                            <FileDown className="mr-2 h-4 w-4" /> Ekspor Excel
                        </Button>
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Tambah <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link to="/pekerjaan/new" className="flex w-full items-center">
                                            <Plus className="mr-2 h-4 w-4" /> Tambah Manual
                                        </Link>
                                    </DropdownMenuItem>
                                    <ImportPekerjaanDialog
                                        onSuccess={() => {
                                            queryClient.invalidateQueries({ queryKey: ['pekerjaan'] });
                                        }}
                                        trigger={
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <FileUp className="mr-2 h-4 w-4" /> Impor Excel
                                            </DropdownMenuItem>
                                        }
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={debouncedSearch}
                        onSearch={handleSearch}
                        placeholder="Cari pekerjaan..."
                        className="w-full sm:max-w-sm"
                    />
                )}
                footer={totalPages > 1 ? (
                    <ListPagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        disabled={loading}
                        meta={{
                            from: pekerjaanRes?.meta?.from,
                            to: pekerjaanRes?.meta?.to,
                            total,
                            label: 'pekerjaan',
                        }}
                    />
                ) : undefined}
            >
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                                    {selectedCount > 0 && (
                                        <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                                            <span className="text-sm font-medium">{selectedCount} terpilih</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto px-2 py-0 text-xs"
                                                onClick={() => setSelectedIds([])}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-auto px-2 py-0 text-xs"
                                                onClick={handleBulkDelete}
                                                disabled={bulkDeleteMutation.isPending}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Kecamatan:</span>
                                        <Select value={selectedKecamatan} onValueChange={(value) => {
                                            setSelectedKecamatan(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Semua Kecamatan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kecamatan</SelectItem>
                                                {kecamatanList.map((kec) => (
                                                    <SelectItem key={kec.id} value={kec.id.toString()}>
                                                        {kec.nama_kecamatan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Sub Kegiatan:</span>
                                        <Select value={selectedKegiatan} onValueChange={(value) => {
                                            setSelectedKegiatan(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[250px]">
                                                <SelectValue placeholder="Semua Sub Kegiatan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Sub Kegiatan</SelectItem>
                                                {kegiatanList.map((keg: Kegiatan) => (
                                                    <SelectItem key={keg.id} value={keg.id.toString()}>
                                                        {keg.nama_sub_kegiatan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Tag:</span>
                                        <Select value={selectedTag} onValueChange={(value) => {
                                            setSelectedTag(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Semua Tag" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Tag</SelectItem>
                                                {tagList.map((tag) => (
                                                    <SelectItem key={tag.id} value={tag.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: tag.color || '#6B7280' }}
                                                            />
                                                            {tag.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Pengawas:</span>
                                        <Select value={selectedPengawas} onValueChange={(value) => {
                                            setSelectedPengawas(value)
                                            setCurrentPage(1)
                                        }}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Semua Pengawas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Pengawas</SelectItem>
                                                {pengawasList.map((p) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Urutkan:</span>
                                        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Terbaru" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="updated_at">Terbaru</SelectItem>
                                                <SelectItem value="nama_paket">Nama Paket</SelectItem>
                                                <SelectItem value="pagu">Pagu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Desc" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Turun</SelectItem>
                                                <SelectItem value="asc">Naik</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                    </div>
                </div>

                {loading ? (
                            <TableSkeleton columns={8} rows={10} />
                        ) : pekerjaanList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Belum ada data pekerjaan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[48px]">
                                                <Checkbox
                                                    checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                                                    onCheckedChange={(checked) => toggleAllVisible(checked === true)}
                                                    aria-label="Pilih semua pekerjaan pada halaman ini"
                                                />
                                            </TableHead>
                                            <TableHead>Nama Paket</TableHead>
                                            <TableHead>Sub Kegiatan</TableHead>
                                            <TableHead>Kecamatan</TableHead>
                                            <TableHead>Desa</TableHead>
                                            <TableHead>Pengawas</TableHead>
                                            <TableHead>Pendamping</TableHead>
                                            <TableHead>Pagu</TableHead>
                                            <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pekerjaanList.map((item) => (
                                            <PekerjaanRow 
                                                key={item.id} 
                                                item={item} 
                                                isAdmin={isAdmin}
                                                isSelected={selectedIds.includes(item.id)}
                                                onToggleSelected={toggleSelection}
                                                updatingRow={updatingRow}
                                                pengawasList={pengawasList}
                                                handleUpdatePengawas={handleUpdatePengawas}
                                                handleUpdateTags={handleUpdateTags}
                                                handleUpdateNamaPaket={handleUpdateNamaPaket}
                                                onDeleteRequest={setDeleteId}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Pekerjaan"
                onConfirm={handleConfirmDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}
