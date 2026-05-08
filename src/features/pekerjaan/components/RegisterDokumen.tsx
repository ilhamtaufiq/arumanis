import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    Building2,
    AlertTriangle,
    ExternalLink,
    Loader2,
    Calendar,
    Settings2,
    Save,
    Trash2,
    Plus,
    PlusCircle
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    getDocumentRegister,
    getDocumentSequence,
    getDocumentTypes,
} from '../api/pekerjaan';
import type { Pekerjaan, DocumentType } from '../types';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from '@/components/shared/SearchInput';

/**
 * UTILITIES
 */
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * COMPONENTS
 */
const DocumentCell = ({ num, date, label }: { num: string | null | undefined; date: string | null | undefined; label: string }) => {
    const isMissing = !num;

    return (
        <div className="flex flex-col gap-1 min-w-[140px]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
            {isMissing ? (
                <div className="flex items-center gap-1.5 text-destructive bg-destructive/5 px-2 py-1 rounded border border-destructive/20 border-dashed">
                    <AlertCircle size={14} />
                    <span className="text-xs font-medium italic">Belum Ada</span>
                </div>
            ) : (
                <div className="group">
                    <div className="text-sm font-semibold text-foreground tabular-nums wrap-break-word" title={num!}>
                        {num}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {formatDate(date)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function RegisterDokumen() {
    const { tahunAnggaran } = useAppSettingsValues();
    const [data, setData] = useState<Pekerjaan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState(tahunAnggaran || new Date().getFullYear().toString());
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState('20');
    const [meta, setMeta] = useState<{
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
    } | null>(null);
    const [exporting, setExporting] = useState(false);

    // Sequence states
    const [lastSequence, setLastSequence] = useState<number>(0);
    const [editingSequence, setEditingSequence] = useState(false);
    const [newSequence, setNewSequence] = useState<number>(0);

    // Dynamic Register states
    const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPekerjaanForReg, setSelectedPekerjaanForReg] = useState<Pekerjaan | null>(null);

    const [form, setForm] = useState({
        type_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        nomor: '',
        description: '',
        sequence_number: ''
    });

    const [editingRegister, setEditingRegister] = useState<any>(null);

    // Type settings states
    const [showTypeSettings, setShowTypeSettings] = useState(false);
    const [editingType, setEditingType] = useState<DocumentType | null>(null);
    const [typeForm, setTypeForm] = useState({
        name: '',
        code: '',
        format_template: ''
    });

    const createTypeMutation = useMutation<any, any, { name: string; code: string; format_template: string }>({
        mutationKey: ['document-type', 'create'],
        onSuccess: () => {
            toast.success('Tipe dokumen berhasil ditambahkan');
            fetchDocTypes();
            setEditingType(null);
            setTypeForm({ name: '', code: '', format_template: '' });
        },
        onError: () => toast.error('Gagal menambahkan tipe dokumen')
    });

    const updateTypeMutation = useMutation<any, any, { id: number; data: { name: string; code: string; format_template: string } }>({
        mutationKey: ['document-type', 'update'],
        onSuccess: () => {
            toast.success('Tipe dokumen berhasil diperbarui');
            fetchDocTypes();
            setEditingType(null);
            setTypeForm({ name: '', code: '', format_template: '' });
        },
        onError: () => toast.error('Gagal memperbarui tipe dokumen')
    });

    const deleteTypeMutation = useMutation<any, any, number>({
        mutationKey: ['document-type', 'delete'],
        onSuccess: () => {
            toast.success('Tipe dokumen berhasil dihapus');
            fetchDocTypes();
        },
        onError: (error: any) => toast.error(error.message || 'Gagal menghapus tipe dokumen')
    });

    const handleSaveType = () => {
        if (!typeForm.name || !typeForm.code) {
            toast.error('Nama dan Kode tipe wajib diisi');
            return;
        }

        if (editingType) {
            updateTypeMutation.mutate({ id: editingType.id, data: typeForm });
        } else {
            createTypeMutation.mutate(typeForm);
        }
    };

    const handleDeleteType = (id: number) => {
        if (!window.confirm('Hapus tipe dokumen ini?')) return;
        deleteTypeMutation.mutate(id);
    };

    const fetchSequence = useCallback(async () => {
        try {
            const res = await getDocumentSequence(selectedYear);
            setLastSequence(res.last_number);
            setNewSequence(res.last_number);
        } catch (error) {
            console.error('Failed to fetch sequence', error);
        }
    }, [selectedYear]);

    const fetchDocTypes = useCallback(async () => {
        try {
            const res = await getDocumentTypes();
            setDocTypes(res);
        } catch (error) {
            console.error('Failed to fetch doc types', error);
        }
    }, []);


    const createRegisterMutation = useMutation<any, any, any>({
        mutationKey: ['document-register', 'create'],
        onSuccess: () => {
            toast.success('Nomor dokumen berhasil diregistrasi');
            setShowCreateModal(false);
            setEditingRegister(null);
            setSelectedPekerjaanForReg(null);
            fetchData();
            setForm({
                type_id: '',
                tanggal: new Date().toISOString().split('T')[0],
                nomor: '',
                description: '',
                sequence_number: ''
            });
        },
        onError: () => toast.error('Gagal meregistrasi nomor dokumen')
    });

    const updateRegisterMutation = useMutation<any, any, { id: number; data: any }>({
        mutationKey: ['document-register', 'update'],
        onSuccess: () => {
            toast.success('Nomor dokumen berhasil diperbarui');
            setShowCreateModal(false);
            setEditingRegister(null);
            setSelectedPekerjaanForReg(null);
            fetchData();
        },
        onError: () => toast.error('Gagal memperbarui nomor dokumen')
    });

    const deleteRegisterMutation = useMutation<any, any, number>({
        mutationKey: ['document-register', 'delete'],
        onSuccess: () => {
            toast.success('Registrasi nomor berhasil dihapus');
            fetchData();
        },
        onError: () => toast.error('Gagal menghapus registrasi nomor')
    });

    const updateSequenceMutation = useMutation<any, any, { year: string; last_number: number }>({
        mutationKey: ['document-sequence', 'update'],
        onSuccess: () => {
            setLastSequence(newSequence);
            setEditingSequence(false);
            toast.success('Urutan penomoran berhasil diperbarui');
        },
        onError: () => toast.error('Gagal memperbarui urutan penomoran')
    });

    const deletePekerjaanMutation = useMutation<any, any, number>({
        mutationKey: ['pekerjaan', 'delete'],
        onSuccess: () => {
            toast.success('Pekerjaan berhasil dihapus');
            fetchData();
        },
        onError: () => toast.error('Gagal menghapus pekerjaan')
    });


    const handleCreateRegister = () => {
        if (!selectedPekerjaanForReg || !selectedPekerjaanForReg.kontrak?.[0]) {
            toast.error('Kontrak tidak ditemukan untuk pekerjaan ini');
            return;
        }

        if (!form.type_id || !form.tanggal) {
            toast.error('Tipe dokumen dan tanggal wajib diisi');
            return;
        }

        if (editingRegister) {
            updateRegisterMutation.mutate({
                id: editingRegister.id,
                data: {
                    tanggal: form.tanggal,
                    nomor: form.nomor,
                    description: form.description
                }
            });
        } else {
            createRegisterMutation.mutate({
                kontrak_id: selectedPekerjaanForReg.kontrak[0].id,
                type_id: parseInt(form.type_id),
                tanggal: form.tanggal,
                description: form.description,
                sequence_number: form.sequence_number ? parseInt(form.sequence_number) : undefined
            });
        }
    };

    const handleDeleteRegister = (id: number) => {
        if (!window.confirm('Hapus registrasi nomor ini?')) return;
        deleteRegisterMutation.mutate(id);
    };


    const handleSaveSequence = () => {
        updateSequenceMutation.mutate({ year: selectedYear, last_number: newSequence });
    };

    const handleDelete = (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data pekerjaan ini? (Semua data kontrak & berita acara akan terhapus)')) return;
        deletePekerjaanMutation.mutate(id);
    };

    useEffect(() => {
        if (tahunAnggaran && !selectedYear) {
            setSelectedYear(tahunAnggaran);
        }
    }, [tahunAnggaran, selectedYear]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getDocumentRegister({
                page,
                search,
                tahun: selectedYear,
                per_page: parseInt(perPage)
            });
            setData(res.data);
            setMeta(res.meta);
        } catch (error) {
            console.error('Failed to fetch register:', error);
            toast.error('Gagal memuat data register');
        } finally {
            setLoading(false);
        }
    }, [page, search, selectedYear, perPage]);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchSequence();
        fetchDocTypes();
    }, [fetchSequence, fetchDocTypes]);


    const handleExportExcel = async () => {
        try {
            setExporting(true);
            toast.loading('Mempersiapkan data export...');

            // Fetch ALL data for export
            const res = await getDocumentRegister({
                tahun: selectedYear,
                per_page: -1 // Assume -1 means all or just a large number
            });

            const allData = res.data;

            const excelData = allData.map((item: Pekerjaan, index: number) => {
                const k = item.kontrak?.[0];
                const row: Record<string, string | number> = {
                    'No': index + 1,
                    'Nama Paket': item.nama_paket,
                    'Pagu': item.pagu,
                    'Penyedia': k?.penyedia?.nama || '-',
                    'SPPBJ Nomor': k?.sppbj || '-',
                    'SPPBJ Tanggal': formatDate(k?.tgl_sppbj),
                    'SPK Nomor': k?.spk || '-',
                    'SPK Tanggal': formatDate(k?.tgl_spk),
                    'SPMK Nomor': k?.spmk || '-',
                    'SPMK Tanggal': formatDate(k?.tgl_spmk),
                };

                // Dynamic Doc Types
                docTypes.forEach(type => {
                    const reg = k?.registers?.find((r: { type_id: number, nomor: string, tanggal: string }) => r.type_id === type.id);
                    row[type.name] = reg ? `${reg.nomor} (${formatDate(reg.tanggal)})` : '-';
                });

                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Register Dokumen");

            // Set column widths
            const baseCols = [
                { wch: 5 }, { wch: 50 }, { wch: 15 }, { wch: 30 },
                { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
                { wch: 25 }, { wch: 20 }
            ];

            // Add widths for dynamic columns
            const dynamicCols = docTypes.map(() => ({ wch: 30 }));
            worksheet['!cols'] = [...baseCols, ...dynamicCols];

            XLSX.writeFile(workbook, `Register_Dokumen_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.dismiss();
            toast.success('Excel berhasil diunduh');
        } catch (error) {
            toast.dismiss();
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const renderPagination = () => {
        if (!meta) return null;
        const totalPages = meta.last_page;
        const currentPage = page;

        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((p, index) => (
                        <PaginationItem key={index}>
                            {p === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(p as number);
                                    }}
                                    isActive={currentPage === p}
                                    className="cursor-pointer"
                                >
                                    {p}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };


    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Register Penomoran Dokumen</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Clock size={14} />
                            Monitoring administrasi penomoran SPPBJ, SPK, SPMK dan Berita Acara
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-10"
                            onClick={() => setShowTypeSettings(true)}
                        >
                            <Settings2 size={16} />
                            Konfigurasi Tipe
                        </Button>
                        <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10"
                            onClick={() => {
                                setSelectedPekerjaanForReg(null);
                                setShowCreateModal(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Registrasi Baru
                        </Button>
                        <Button variant="outline" size="sm" className="h-10" onClick={handleExportExcel} disabled={exporting}>
                            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />}
                            Export Excel
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <CardStat label="Total Paket" value={meta?.total || 0} icon={Building2} color="text-blue-600" />
                    <CardStat label="SPK Belum Ada" value={data.filter(d => !d.kontrak?.[0]?.spk).length} icon={AlertTriangle} color="text-amber-600" />
                    <CardStat label="SPMK Belum Ada" value={data.filter(d => !d.kontrak?.[0]?.spmk).length} icon={AlertCircle} color="text-rose-600" />
                    <CardStat label="PHO Selesai" value={data.filter(d => (d.berita_acara?.data?.serah_terima_pertama?.length || 0) > 0).length} icon={CheckCircle2} color="text-emerald-600" />
                </div>

                <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <SearchInput
                            defaultValue={search}
                            onSearch={handleSearch}
                            placeholder="Cari paket, penyedia, atau nomor..."
                            className="w-full md:max-w-md"
                        />
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap bg-muted/50 px-3 py-1.5 rounded-lg border">
                                <Clock size={14} />
                                Monitor:
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[110px] h-7 border-none bg-transparent focus:ring-0 font-bold text-foreground">
                                        <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['2026', '2025', '2024', '2023', '2022'].map(y => (
                                            <SelectItem key={y} value={y}>TA {y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
                                <span className="text-xs font-medium text-muted-foreground">Sequence:</span>
                                {editingSequence ? (
                                    <div className="inline-flex items-center border rounded overflow-hidden">
                                        <Input
                                            type="number"
                                            value={newSequence}
                                            onChange={(e) => setNewSequence(parseInt(e.target.value) || 0)}
                                            className="h-6 w-14 px-1 py-0 text-xs border-0 focus-visible:ring-0"
                                        />
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-none hover:bg-emerald-100 text-emerald-600" onClick={handleSaveSequence}>
                                            <Save size={12} />
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-sm font-bold flex items-center gap-1">
                                        {lastSequence}
                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => setEditingSequence(true)}>
                                            <Settings2 size={10} />
                                        </Button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle>Daftar Penomoran Utama</CardTitle>
                        <CardDescription>Nomor SPPBJ, SPK, dan SPMK berdasarkan data kontrak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="min-w-[300px]">Pekerjaan / Paket</TableHead>
                                        <TableHead className="min-w-[150px]">SPPBJ</TableHead>
                                        <TableHead className="min-w-[150px]">SPK (Kontrak)</TableHead>
                                        <TableHead className="min-w-[150px]">SPMK</TableHead>
                                        {docTypes.map(type => (
                                            <TableHead key={type.id} className="min-w-[150px]">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="text-left font-bold">
                                                            {type.name}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Tipe: {type.name}</p>
                                                            <p className="text-xs text-muted-foreground">Kode: {type.code}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-right sticky right-0 bg-muted/50 z-10">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5 + docTypes.length} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-2 justify-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Memuat data register...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : data.length > 0 ? (
                                        data.map((item) => {
                                            const k = item.kontrak?.[0];

                                            return (
                                                <TableRow key={item.id} className="group">
                                                    <TableCell className="align-top">
                                                        <div className="space-y-1.5">
                                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {item.nama_paket}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-[12px] font-medium text-emerald-700 bg-emerald-50 w-fit px-1.5 py-0.5 rounded border border-emerald-200">
                                                                    {formatCurrency(item.pagu)}
                                                                </div>
                                                                {/* Progress Bar with Tooltip */}
                                                                {(() => {
                                                                    const k = item.kontrak?.[0];

                                                                    // 1. Registrasi Nomor Dokumen
                                                                    const regRequired = 3 + docTypes.length;
                                                                    let regFilled = 0;
                                                                    if (k?.sppbj) regFilled++;
                                                                    if (k?.spk) regFilled++;
                                                                    if (k?.spmk) regFilled++;
                                                                    docTypes.forEach(type => {
                                                                        if (k?.registers?.some((r: { type_id: number }) => r.type_id === type.id)) regFilled++;
                                                                    });

                                                                    // 2. Berkas Hasil Scan (NPHD, SPK, BA)
                                                                    const scanRequired = 3;
                                                                    let scanFilled = 0;
                                                                    const berkasTypes = item.berkas?.map(b => b.jenis_dokumen.toLowerCase()) || [];
                                                                    if (berkasTypes.some(t => t.includes('nphd'))) scanFilled++;
                                                                    if (berkasTypes.some(t => t.includes('spk') || t.includes('kontrak'))) scanFilled++;
                                                                    if (berkasTypes.some(t => t.includes('ba') || t.includes('berita acara'))) scanFilled++;

                                                                    // 3. Foto Progres
                                                                    let totalExpectedPhotos = 0;
                                                                    item.output?.forEach(o => {
                                                                        if (o.penerima_is_optional) {
                                                                            const unitCount = o.satuan?.toLowerCase() === 'unit' ? Math.max(1, Math.round(o.volume || 1)) : 1;
                                                                            totalExpectedPhotos += unitCount * 5;
                                                                        } else {
                                                                            totalExpectedPhotos += (item.penerima_count || 0) * 5;
                                                                        }
                                                                    });

                                                                    const fotoUploaded = item.foto_count || 0;
                                                                    const fotoProgress = totalExpectedPhotos > 0 ? Math.min(100, (fotoUploaded / totalExpectedPhotos) * 100) : 0;

                                                                    // Total Weighted Progress
                                                                    // We can split it: 40% Registrasi, 30% Scan, 30% Foto
                                                                    const regWeight = (regFilled / regRequired) * 40;
                                                                    const scanWeight = (scanFilled / scanRequired) * 30;
                                                                    const fotoWeight = (fotoProgress / 100) * 30;

                                                                    const totalPercentage = Math.round(regWeight + scanWeight + fotoWeight);

                                                                    return (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="mt-2 space-y-1 cursor-help">
                                                                                        <div className="flex justify-between items-center text-[10px]">
                                                                                            <span className="text-muted-foreground font-medium">Status Kelengkapan</span>
                                                                                            <span className={cn("font-bold", totalPercentage === 100 ? "text-emerald-600" : "text-amber-600")}>{totalPercentage}%</span>
                                                                                        </div>
                                                                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border">
                                                                                            <div
                                                                                                className={cn("h-full transition-all", totalPercentage === 100 ? "bg-emerald-500" : "bg-amber-500")}
                                                                                                style={{ width: `${totalPercentage}%` }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="right" className="w-64 p-3 space-y-2">
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-xs font-bold border-bottom pb-1 mb-1">Rincian Kelengkapan:</p>
                                                                                        <div className="flex justify-between text-[11px]">
                                                                                            <span>Penomoran Dokumen:</span>
                                                                                            <span className="font-mono">{regFilled}/{regRequired}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between text-[11px]">
                                                                                            <span>Upload Scan (NPHD/SPK/BA):</span>
                                                                                            <span className="font-mono">{scanFilled}/{scanRequired}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between text-[11px]">
                                                                                            <span>Foto Progres:</span>
                                                                                            <span className="font-mono">{fotoUploaded}/{totalExpectedPhotos}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    );
                                                                })()}
                                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                    <Building2 size={12} className="shrink-0" />
                                                                    <span className="wrap-break-word truncate max-w-[200px]" title={k?.penyedia?.nama || '-'}>
                                                                        {k?.penyedia?.nama || 'Penyedia belum diatur'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <DocumentCell num={k?.sppbj} date={k?.tgl_sppbj} label="Penyediaan" />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <DocumentCell num={k?.spk} date={k?.tgl_spk} label="Perjanjian Kerja" />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <DocumentCell num={k?.spmk} date={k?.tgl_spmk} label="Mulai Kerja" />
                                                    </TableCell>
                                                    {docTypes.map((type: DocumentType) => {
                                                        const reg = k?.registers?.find((r: { type_id: number }) => r.type_id === type.id);
                                                        return (
                                                            <TableCell key={type.id} className="align-top group/cell">
                                                                {reg ? (
                                                                    <div className="relative">
                                                                        <div className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-1 rounded border border-blue-200 wrap-break-word min-w-[120px]">
                                                                            {reg.nomor}
                                                                            {reg.tanggal && <div className="text-[9px] text-muted-foreground font-normal mt-0.5">{formatDate(reg.tanggal)}</div>}
                                                                        </div>
                                                                        <div className="absolute top-0 right-0 h-full flex items-center gap-1 pr-1 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-linear-to-l from-blue-50 via-blue-50/90 to-transparent pl-4 rounded-r">
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                className="h-6 w-6 text-blue-600 hover:bg-blue-200/50"
                                                                                onClick={() => {
                                                                                    setEditingRegister(reg);
                                                                                    setSelectedPekerjaanForReg(item);
                                                                                    setForm({
                                                                                        type_id: reg.type_id.toString(),
                                                                                        tanggal: reg.tanggal.split('T')[0],
                                                                                        nomor: reg.nomor,
                                                                                        description: reg.description || '',
                                                                                        sequence_number: reg.sequence_number?.toString() || ''
                                                                                    });
                                                                                    setShowCreateModal(true);
                                                                                }}
                                                                            >
                                                                                <Settings2 size={12} />
                                                                            </Button>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                                                onClick={() => handleDeleteRegister(reg.id)}
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[10px] text-muted-foreground italic">-</span>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell className="align-top text-right sticky right-0 bg-background/95 group-hover:bg-muted/50 transition-colors z-10 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                title="Buat Registrasi Nomor Baru"
                                                                onClick={() => {
                                                                    setSelectedPekerjaanForReg(item);
                                                                    setShowCreateModal(true);
                                                                }}
                                                            >
                                                                <Plus size={18} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Hapus Pekerjaan" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                            <Button variant="outline" size="icon" asChild title="Detail Pekerjaan" className="h-8 w-8">
                                                                <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                                                                    <ExternalLink size={16} />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5 + docTypes.length} className="h-40 text-center text-muted-foreground">
                                                Tidak ada data ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    {meta && (
                        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t bg-muted/20 py-4 gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    Menampilkan {meta.from || 0}-{meta.to || 0} dari {meta.total || 0} paket
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Baris:</span>
                                    <Select value={perPage} onValueChange={(v) => { setPerPage(v); setPage(1); }}>
                                        <SelectTrigger className="h-8 w-[70px] text-xs">
                                            <SelectValue placeholder="20" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['10', '20', '50', '100'].map(v => (
                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {renderPagination()}
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* MODAL REGISTRASI NOMOR BARU */}
                <Dialog open={showCreateModal} onOpenChange={(open) => {
                    setShowCreateModal(open);
                    if (!open) {
                        setEditingRegister(null);
                        setForm({ type_id: '', tanggal: new Date().toISOString().split('T')[0], nomor: '', description: '', sequence_number: '' });
                    }
                }}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                {editingRegister ? <Settings2 className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
                                {editingRegister ? 'Edit Nomor Dokumen' : 'Registrasi Nomor Dokumen'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingRegister ? 'Perbarui data nomor dokumen yang sudah terdaftar' : 'Lengkapi data di bawah untuk generate nomor dokumen resmi'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {!selectedPekerjaanForReg ? (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Pilih Pekerjaan / Kontrak</Label>
                                    <Select
                                        onValueChange={(v) => {
                                            const p = data.find(item => item.id.toString() === v);
                                            if (p) setSelectedPekerjaanForReg(p);
                                        }}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Cari paket pekerjaan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.nama_paket} ({p.kontrak?.[0]?.penyedia?.nama || 'Tanpa Penyedia'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground italic">*Hanya menampilkan paket di tahun {selectedYear} yang sedang aktif</p>
                                </div>
                            ) : (
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-1 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Building2 size={80} />
                                    </div>
                                    <p className="text-[10px] uppercase font-bold text-primary/60 tracking-widest">Pekerjaan Aktif</p>
                                    <p className="text-sm font-bold leading-tight pr-8">{selectedPekerjaanForReg.nama_paket}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-[10px] bg-background/50 border-primary/20">
                                            {selectedPekerjaanForReg.kontrak?.[0]?.penyedia?.nama || 'Belum ada penyedia'}
                                        </Badge>
                                    </div>
                                    {!editingRegister && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => setSelectedPekerjaanForReg(null)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                            )}

                            {selectedPekerjaanForReg && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Jenis Dokumen</Label>
                                        <Select value={form.type_id} onValueChange={(v) => setForm(f => ({ ...f, type_id: v }))} disabled={!!editingRegister}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Pilih Jenis Dokumen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {docTypes.map(type => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-primary">{type.code}</span>
                                                                <span className="text-muted-foreground">—</span>
                                                                <span>{type.name}</span>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-70">
                                                                Template: {type.format_template || '{sequence}/{code}-AMIS/{month}/{year}'}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {editingRegister && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Nomor Dokumen (Manual)</Label>
                                            <Input
                                                value={form.nomor}
                                                onChange={(e) => setForm(f => ({ ...f, nomor: e.target.value }))}
                                                className="h-11 font-mono font-bold"
                                                placeholder="Masukkan nomor lengkap..."
                                            />
                                            <p className="text-[10px] text-muted-foreground">Catatan: Mengedit nomor secara manual tidak akan mengubah urutan sequence otomatis.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Tanggal Dokumen</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    type="date"
                                                    className="pl-10 h-11"
                                                    value={form.tanggal}
                                                    onChange={(e) => setForm(f => ({ ...f, tanggal: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        {!editingRegister && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Urutan Manual (Opsional)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Biarkan kosong untuk Auto"
                                                    className="h-11"
                                                    value={form.sequence_number}
                                                    onChange={(e) => setForm(f => ({ ...f, sequence_number: e.target.value }))}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Keterangan / Keperluan</Label>
                                        <Textarea
                                            placeholder="Misal: Dokumen untuk termin 1, lampiran nphd, dll..."
                                            className="min-h-[80px] resize-none"
                                            value={form.description}
                                            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="font-medium">Batal</Button>
                            <Button
                                onClick={handleCreateRegister}
                                disabled={!selectedPekerjaanForReg || !form.type_id || !form.tanggal}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6"
                            >
                                {editingRegister ? <Save className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {editingRegister ? 'Simpan Perubahan' : 'Generate & Simpan Nomor'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* MODAL KONFIGURASI TIPE */}
                <Dialog open={showTypeSettings} onOpenChange={(open) => {
                    setShowTypeSettings(open);
                    if (!open) {
                        setEditingType(null);
                        setTypeForm({ name: '', code: '', format_template: '' });
                    }
                }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Konfigurasi Tipe Dokumen</DialogTitle>
                            <DialogDescription>
                                Atur format penomoran untuk berbagai jenis dokumen dinamis.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* List of existing types */}
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Nama Tipe</TableHead>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Template</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {docTypes.length > 0 ? (
                                            docTypes.map((type) => (
                                                <TableRow key={type.id}>
                                                    <TableCell className="font-medium">{type.name}</TableCell>
                                                    <TableCell><Badge variant="outline">{type.code}</Badge></TableCell>
                                                    <TableCell className="text-xs font-mono break-all" title={type.format_template}>
                                                        {type.format_template || '{sequence}/{code}-AMIS/{month}/{year}'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => {
                                                                    setEditingType(type);
                                                                    setTypeForm({
                                                                        name: type.name,
                                                                        code: type.code,
                                                                        format_template: type.format_template || ''
                                                                    });
                                                                }}
                                                            >
                                                                <Save size={14} className="text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-destructive"
                                                                onClick={() => handleDeleteType(type.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-12 text-xs italic">
                                                    Belum ada tipe dokumen. Silakan tambah di bawah.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Form for add/edit */}
                            <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/30 space-y-4 shadow-inner">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <PlusCircle size={16} className={editingType ? "text-blue-500" : "text-emerald-500"} />
                                    {editingType ? 'Edit Tipe Dokumen' : 'Tambah Tipe Baru'}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nama Dokumen</Label>
                                        <Input
                                            placeholder="Contoh: Berita Acara NPHD"
                                            value={typeForm.name}
                                            onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kode Singkat</Label>
                                        <Input
                                            placeholder="Contoh: BA"
                                            value={typeForm.code}
                                            onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        Format Template
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Gunakan Tag Placeholder</span>
                                    </Label>
                                    <Input
                                        placeholder="{sequence}/{code}-AMIS/{month}/{year}"
                                        value={typeForm.format_template}
                                        onChange={(e) => setTypeForm({ ...typeForm, format_template: e.target.value })}
                                        className="font-mono text-sm bg-background border-primary/20"
                                    />
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {[
                                            { tag: '{sequence}', desc: '001' },
                                            { tag: '{nomor_urut_surat}', desc: '1' },
                                            { tag: '{code}', desc: 'Kode' },
                                            { tag: '{year}', desc: 'Tahun' },
                                            { tag: '{tahun}', desc: 'Alias Tahun' },
                                            { tag: '{month}', desc: 'Romawi' },
                                            { tag: '{day}', desc: 'Tgl' },
                                            { tag: '{kontrak_id}', desc: 'ID K' },
                                            { tag: '{id_pekerjaan}', desc: 'ID P' },
                                        ].map((p) => (
                                            <Badge
                                                key={p.tag}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-[10px] font-mono py-0 h-5"
                                                onClick={() => setTypeForm({ ...typeForm, format_template: typeForm.format_template + p.tag })}
                                                title={p.desc}
                                            >
                                                {p.tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-muted">
                                    {editingType && (
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setEditingType(null);
                                            setTypeForm({ name: '', code: '', format_template: '' });
                                        }}>
                                            Batal
                                        </Button>
                                    )}
                                    <Button 
                                        size="sm" 
                                        onClick={handleSaveType} 
                                        disabled={createTypeMutation.isPending || updateTypeMutation.isPending} 
                                        className="gap-1.5"
                                    >
                                        {(createTypeMutation.isPending || updateTypeMutation.isPending) ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Save size={14} />
                                        )}
                                        {editingType ? 'Simpan Perubahan' : 'Tambah Tipe'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}

function CardStat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number | string; className?: string }>; color: string }) {
    return (
        <Card className="shadow-none border-dashed bg-background">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-2.5 rounded-lg bg-muted/50", color)}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
