import React, { useState, useEffect, useMemo } from 'react';
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
    Settings2,
    Save,
    Trash2,
    Plus,
    PlusCircle
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DatePickerField } from '@/components/shared/DatePickerField';
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
import { getDocumentRegister } from '../api/pekerjaan';
import type { Pekerjaan, DocumentType, DocumentRegister } from '../types';
import {
    useDocumentRegisterList,
    useDocumentRegisterPicker,
    useDocumentTypes,
    useDocumentSequence,
    useCreateDocumentType,
    useUpdateDocumentType,
    useDeleteDocumentType,
    useCreateDocumentRegister,
    useUpdateDocumentRegister,
    useDeleteDocumentRegister,
    useUpdateDocumentSequence,
} from '../hooks/useDocumentRegister';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
import { DocumentCell } from './register/DocumentCell';
import {
    findRegisterByType,
    formatRegisterCurrency as formatCurrency,
    formatRegisterDate as formatDate,
    getOrderedKontraks,
    getPrimaryKontrak,
    getRegisterApiErrorMessage as getApiErrorMessage,
    type RegisterPendingConfirmAction as PendingConfirmAction,
} from '../lib/register-dokumen';

export default function RegisterDokumen() {
    const { tahunAnggaran } = useAppSettingsValues();
    const currentCalendarYear = new Date().getFullYear();
    const yearOptions = useMemo(
        () => Array.from({ length: 10 }, (_, index) => (currentCalendarYear - 5 + index).toString()),
        [currentCalendarYear],
    );
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState(tahunAnggaran || currentCalendarYear.toString());
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState('20');
    const [exporting, setExporting] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmAction>(null);
    const [selectedKontrakId, setSelectedKontrakId] = useState<number | null>(null);

    const listParams = {
        page,
        search,
        tahun: selectedYear,
        per_page: parseInt(perPage),
    };
    const {
        data: listResponse,
        isLoading: loading,
        isError: isListError,
    } = useDocumentRegisterList(listParams);
    const data = listResponse?.data ?? [];
    const meta = listResponse?.meta ?? null;
    const summary = meta?.summary;

    const { data: docTypes = [] } = useDocumentTypes();
    const { data: sequenceData } = useDocumentSequence(selectedYear);

    // Sequence states
    const [lastSequence, setLastSequence] = useState<number>(0);
    const [editingSequence, setEditingSequence] = useState(false);
    const [newSequence, setNewSequence] = useState<number>(0);
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

    const createTypeMutation = useCreateDocumentType();
    const updateTypeMutation = useUpdateDocumentType();
    const deleteTypeMutation = useDeleteDocumentType();
    const createRegisterMutation = useCreateDocumentRegister();
    const updateRegisterMutation = useUpdateDocumentRegister();
    const deleteRegisterMutation = useDeleteDocumentRegister();
    const updateSequenceMutation = useUpdateDocumentSequence();
    const { data: pickerResponse, isLoading: isPickerLoading } = useDocumentRegisterPicker(
        selectedYear,
        showCreateModal && !selectedPekerjaanForReg,
    );
    const pickerData = pickerResponse?.data ?? [];

    const handleSaveType = () => {
        if (!typeForm.name || !typeForm.code) {
            toast.error('Nama dan Kode tipe wajib diisi');
            return;
        }

        if (editingType) {
            updateTypeMutation.mutate(
                { id: editingType.id, data: typeForm },
                {
                    onSuccess: () => {
                        toast.success('Tipe dokumen berhasil diperbarui');
                        setEditingType(null);
                        setTypeForm({ name: '', code: '', format_template: '' });
                    },
                    onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal memperbarui tipe dokumen')),
                },
            );
        } else {
            createTypeMutation.mutate(typeForm, {
                onSuccess: () => {
                    toast.success('Tipe dokumen berhasil ditambahkan');
                    setEditingType(null);
                    setTypeForm({ name: '', code: '', format_template: '' });
                },
                onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal menambahkan tipe dokumen')),
            });
        }
    };

    const handleDeleteType = (id: number) => {
        setPendingConfirm({ type: 'delete-type', id });
    };

    const runPendingConfirm = () => {
        if (!pendingConfirm) return;

        if (pendingConfirm.type === 'delete-type') {
            deleteTypeMutation.mutate(pendingConfirm.id, {
                onSuccess: () => {
                    toast.success('Tipe dokumen berhasil dihapus');
                    setPendingConfirm(null);
                },
                onError: (error) => {
                    toast.error(getApiErrorMessage(error, 'Gagal menghapus tipe dokumen'));
                },
            });
            return;
        }

        deleteRegisterMutation.mutate(pendingConfirm.id, {
            onSuccess: () => {
                toast.success('Registrasi nomor berhasil dihapus');
                setPendingConfirm(null);
            },
            onError: (error) => {
                toast.error(getApiErrorMessage(error, 'Gagal menghapus registrasi nomor'));
            },
        });
    };


    const handleCreateRegister = () => {
        const kontraks = selectedPekerjaanForReg ? getOrderedKontraks(selectedPekerjaanForReg) : [];
        const activeKontrak = kontraks.find((entry) => entry.id === selectedKontrakId) ?? kontraks[0];

        if (!selectedPekerjaanForReg || !activeKontrak) {
            toast.error('Kontrak tidak ditemukan untuk pekerjaan ini');
            return;
        }

        if (!form.type_id || !form.tanggal) {
            toast.error('Tipe dokumen dan tanggal wajib diisi');
            return;
        }

        const parsedTypeId = parseInt(form.type_id, 10);

        if (!editingRegister) {
            const alreadyRegistered = activeKontrak.registers?.some((entry) => entry.type_id === parsedTypeId);
            if (alreadyRegistered) {
                toast.error('Kontrak ini sudah memiliki registrasi untuk tipe dokumen tersebut');
                return;
            }
        }

        if (editingRegister) {
            updateRegisterMutation.mutate(
                {
                    id: editingRegister.id,
                    data: {
                        tanggal: form.tanggal,
                        nomor: form.nomor,
                        description: form.description,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success('Nomor dokumen berhasil diperbarui');
                        setShowCreateModal(false);
                        setEditingRegister(null);
                        setSelectedPekerjaanForReg(null);
                        setSelectedKontrakId(null);
                    },
                    onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal memperbarui nomor dokumen')),
                },
            );
        } else {
            createRegisterMutation.mutate(
                {
                    kontrak_id: activeKontrak.id,
                    type_id: parsedTypeId,
                    tanggal: form.tanggal,
                    description: form.description,
                    sequence_number: form.sequence_number ? parseInt(form.sequence_number, 10) : undefined,
                },
                {
                    onSuccess: () => {
                        toast.success('Nomor dokumen berhasil diregistrasi');
                        setShowCreateModal(false);
                        setEditingRegister(null);
                        setSelectedPekerjaanForReg(null);
                        setSelectedKontrakId(null);
                        setForm({
                            type_id: '',
                            tanggal: new Date().toISOString().split('T')[0],
                            nomor: '',
                            description: '',
                            sequence_number: '',
                        });
                    },
                    onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal meregistrasi nomor dokumen')),
                },
            );
        }
    };

    const handleDeleteRegister = (id: number) => {
        setPendingConfirm({ type: 'delete-register', id });
    };


    const handleSaveSequence = () => {
        updateSequenceMutation.mutate(
            { year: selectedYear, last_number: newSequence },
            {
                onSuccess: () => {
                    setLastSequence(newSequence);
                    setEditingSequence(false);
                    toast.success('Urutan penomoran berhasil diperbarui');
                },
                onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal memperbarui urutan penomoran')),
            },
        );
    };

    useEffect(() => {
        if (tahunAnggaran) {
            setSelectedYear(tahunAnggaran);
        }
    }, [tahunAnggaran]);

    useEffect(() => {
        setPage(1);
    }, [selectedYear]);

    useEffect(() => {
        if (sequenceData) {
            setLastSequence(sequenceData.last_number);
            setNewSequence(sequenceData.last_number);
        }
    }, [sequenceData]);

    useEffect(() => {
        if (isListError) {
            toast.error('Gagal memuat data register');
        }
    }, [isListError]);

    useEffect(() => {
        if (!selectedPekerjaanForReg) {
            setSelectedKontrakId(null);
            return;
        }

        const kontraks = getOrderedKontraks(selectedPekerjaanForReg);
        setSelectedKontrakId((current) => {
            if (current && kontraks.some((entry) => entry.id === current)) {
                return current;
            }
            return kontraks[0]?.id ?? null;
        });
    }, [selectedPekerjaanForReg]);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };


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
                const k = getPrimaryKontrak(item);
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
                docTypes.forEach((type) => {
                    const reg = findRegisterByType(item, type.id);
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
            toast.error(getApiErrorMessage(error, 'Gagal mengekspor data register'));
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


    const confirmDialogContent = pendingConfirm?.type === 'delete-type'
        ? {
            title: 'Hapus tipe dokumen?',
            desc: 'Tipe dokumen yang sudah dipakai di register tidak dapat dihapus.',
            confirmText: 'Hapus',
        }
        : pendingConfirm?.type === 'delete-register'
          ? {
              title: 'Hapus registrasi nomor?',
              desc: 'Registrasi nomor yang dihapus tidak dapat dikembalikan.',
              confirmText: 'Hapus',
          }
          : null;

    return (
        <>
            <ConfirmDialog
                open={pendingConfirm !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingConfirm(null);
                }}
                title={confirmDialogContent?.title ?? ''}
                desc={confirmDialogContent?.desc ?? ''}
                destructive
                confirmText={confirmDialogContent?.confirmText ?? 'Hapus'}
                handleConfirm={runPendingConfirm}
                isLoading={deleteTypeMutation.isPending || deleteRegisterMutation.isPending}
            />
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
                    <CardStat label="SPK Belum Ada" value={summary?.spk_missing ?? 0} icon={AlertTriangle} color="text-amber-600" />
                    <CardStat label="SPMK Belum Ada" value={summary?.spmk_missing ?? 0} icon={AlertCircle} color="text-rose-600" />
                    <CardStat label="PHO Selesai" value={summary?.pho_completed ?? 0} icon={CheckCircle2} color="text-emerald-600" />
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
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={year}>TA {year}</SelectItem>
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
                                            const k = getPrimaryKontrak(item);

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
                                                                    const kontraks = getOrderedKontraks(item);

                                                                    // 1. Registrasi Nomor Dokumen
                                                                    const regRequired = 3 + docTypes.length;
                                                                    let regFilled = 0;
                                                                    if (kontraks.some((entry) => entry.sppbj)) regFilled++;
                                                                    if (kontraks.some((entry) => entry.spk)) regFilled++;
                                                                    if (kontraks.some((entry) => entry.spmk)) regFilled++;
                                                                    docTypes.forEach((type) => {
                                                                        if (findRegisterByType(item, type.id)) regFilled++;
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
                                                        const reg = findRegisterByType(item, type.id);
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
                                                                                    setSelectedKontrakId(reg.kontrak_id);
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
                        setSelectedPekerjaanForReg(null);
                        setSelectedKontrakId(null);
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
                                            const pekerjaan = pickerData.find((entry) => entry.id.toString() === v);
                                            if (pekerjaan) setSelectedPekerjaanForReg(pekerjaan);
                                        }}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={isPickerLoading ? 'Memuat daftar paket...' : 'Cari paket pekerjaan...'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pickerData.map((pekerjaan) => (
                                                <SelectItem key={pekerjaan.id} value={pekerjaan.id.toString()}>
                                                    {pekerjaan.nama_paket} ({getPrimaryKontrak(pekerjaan)?.penyedia?.nama || 'Tanpa Penyedia'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground italic">*Menampilkan semua paket TA {selectedYear}</p>
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
                                    {getOrderedKontraks(selectedPekerjaanForReg).length > 1 && !editingRegister && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Pilih Kontrak</Label>
                                            <Select
                                                value={selectedKontrakId?.toString() ?? ''}
                                                onValueChange={(value) => setSelectedKontrakId(parseInt(value, 10))}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Pilih kontrak" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getOrderedKontraks(selectedPekerjaanForReg).map((kontrak) => (
                                                        <SelectItem key={kontrak.id} value={kontrak.id.toString()}>
                                                            Kontrak #{kontrak.id} — {kontrak.penyedia?.nama || 'Tanpa penyedia'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

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
                                            <DatePickerField
                                                className="h-11"
                                                value={form.tanggal}
                                                onChange={(tanggal) => setForm((f) => ({ ...f, tanggal }))}
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Urutan sequence mengikuti tahun tanggal dokumen (monitor TA {selectedYear}).
                                            </p>
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
