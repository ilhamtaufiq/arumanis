import React, { useState, useCallback, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields';
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { ImportPekerjaanDialog } from './ImportPekerjaanDialog';
import { ExportPekerjaanDialog } from './ExportPekerjaanDialog';
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
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {item.kode_rekening ? <span>{item.kode_rekening}</span> : null}
                    {item.is_konsultan ? (
                        <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                            Konsultan
                        </span>
                    ) : null}
                    {item.status === 'canceled' ? (
                        <span className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                            Dibatalkan
                        </span>
                    ) : null}
                    {!(item.has_kontrak ?? (item.kontrak?.length ?? item.kontrak_count ?? 0) > 0) &&
                    item.status !== 'canceled' ? (
                        <span className="rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                            Belum berkontrak
                        </span>
                    ) : null}
                </div>
                <PekerjaanTagSelect
                    selectedTags={item.tags || []}
                    disabled={updatingRow === item.id}
                    onChange={(tags: Tag[]) => handleUpdateTags(item.id, tags)}
                />
            </TableCell>
            <TableCell>{item.kegiatan?.nama_sub_kegiatan || '-'}</TableCell>
            <TableCell>
                {item.is_konsultan ? '—' : (getKecamatanName(item.kecamatan) || '-')}
            </TableCell>
            <TableCell>
                {item.is_konsultan ? '—' : (getDesaName(item.desa) || '-')}
            </TableCell>
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
    const [exportOpen, setExportOpen] = useState(false);
    const { tahunAnggaran } = useAppSettingsValues();
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    // Queries
    const filterQueryOpts = {
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    } as const

    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
        ...filterQueryOpts,
    });
    const kecamatanList = kecamatanRes?.data || [];

    const { data: kegiatanRes } = useQuery({
        queryKey: ['kegiatan', { tahun: tahunAnggaran }],
        queryFn: () => api.get<KegiatanResponse>('/kegiatan', { params: { tahun: tahunAnggaran, per_page: -1 } }),
        enabled: !!tahunAnggaran,
        ...filterQueryOpts,
    });
    const kegiatanList = kegiatanRes?.data || [];

    const { data: tagRes } = useQuery({
        queryKey: ['tags'],
        queryFn: () => getTags(),
        ...filterQueryOpts,
    });
    const tagList = tagRes?.data || [];

    const { data: pengawasRes } = useQuery({
        queryKey: ['pengawas'],
        queryFn: () => getPengawas(),
        ...filterQueryOpts,
    });
    const pengawasList = pengawasRes?.data || [];

    const exportFilters = useMemo(() => {
        const filterLabels: string[] = [];
        if (selectedKecamatan !== 'all') {
            const kec = kecamatanList.find((k) => k.id.toString() === selectedKecamatan);
            if (kec) filterLabels.push(`Kecamatan: ${kec.nama_kecamatan}`);
        }
        if (selectedPengawas !== 'all') {
            const pengawas = pengawasList.find((p) => p.id.toString() === selectedPengawas);
            if (pengawas) filterLabels.push(`Pengawas: ${pengawas.nama}`);
        }
        if (selectedKegiatan !== 'all') {
            const keg = kegiatanList.find((k) => k.id.toString() === selectedKegiatan);
            if (keg) {
                filterLabels.push(`Kegiatan: ${keg.nama_sub_kegiatan || '-'}`);
            }
        }
        if (selectedTag !== 'all') {
            const tag = tagList.find((t) => t.id.toString() === selectedTag);
            if (tag) filterLabels.push(`Tag: ${tag.name}`);
        }
        if (debouncedSearch) {
            filterLabels.push(`Cari: ${debouncedSearch}`);
        }
        return {
            kecamatanId: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
            kegiatanId: selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan),
            tagId: selectedTag === 'all' ? undefined : parseInt(selectedTag),
            pengawasId: selectedPengawas === 'all' ? undefined : parseInt(selectedPengawas),
            search: debouncedSearch || undefined,
            tahun: tahunAnggaran,
            filterLabels,
        };
    }, [
        selectedKecamatan,
        selectedKegiatan,
        selectedTag,
        selectedPengawas,
        debouncedSearch,
        tahunAnggaran,
        kecamatanList,
        pengawasList,
        kegiatanList,
        tagList,
    ]);

    const exportKegiatanOptions = useMemo(
        () =>
            kegiatanList.map((k: Kegiatan) => ({
                id: k.id,
                label: k.nama_sub_kegiatan || `Sub kegiatan #${k.id}`,
            })),
        [kegiatanList],
    );

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

    return (
        <>
            <ListPageLayout
                shell
                title="Daftar Pekerjaan"
                description="Kelola data pekerjaan dan paket"
                cardTitle="Data Pekerjaan"
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => setExportOpen(true)}>
                            <FileDown className="mr-2 h-4 w-4" /> Ekspor
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

            <ExportPekerjaanDialog
                open={exportOpen}
                onOpenChange={setExportOpen}
                filters={exportFilters}
                kegiatanOptions={exportKegiatanOptions}
            />
        </>
    );
}
