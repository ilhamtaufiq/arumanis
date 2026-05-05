import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    getDocumentRegister,
    deletePekerjaan,
    getDocumentSequence,
    updateDocumentSequence,
    getDocumentTypes,
    createDocumentRegister,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType
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
        description: '',
        sequence_number: ''
    });

    // Type settings states
    const [showTypeSettings, setShowTypeSettings] = useState(false);
    const [isSavingType, setIsSavingType] = useState(false);
    const [editingType, setEditingType] = useState<DocumentType | null>(null);
    const [typeForm, setTypeForm] = useState({
        name: '',
        code: '',
        format_template: ''
    });

    const handleSaveType = async () => {
        if (!typeForm.name || !typeForm.code) {
            toast.error('Nama dan Kode tipe wajib diisi');
            return;
        }

        try {
            setIsSavingType(true);
            if (editingType) {
                await updateDocumentType(editingType.id, typeForm);
                toast.success('Tipe dokumen berhasil diperbarui');
            } else {
                await createDocumentType(typeForm);
                toast.success('Tipe dokumen berhasil ditambahkan');
            }
            fetchDocTypes();
            setEditingType(null);
            setTypeForm({ name: '', code: '', format_template: '' });
        } catch (error) {
            console.error('Failed to save type', error);
            toast.error('Gagal menyimpan tipe dokumen');
        } finally {
            setIsSavingType(false);
        }
    };

    const handleDeleteType = async (id: number) => {
        if (!window.confirm('Hapus tipe dokumen ini?')) return;
        try {
            await deleteDocumentType(id);
            toast.success('Tipe dokumen berhasil dihapus');
            fetchDocTypes();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || 'Gagal menghapus tipe dokumen');
        }
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


    const handleCreateRegister = async () => {
        if (!selectedPekerjaanForReg || !selectedPekerjaanForReg.kontrak?.[0]) {
            toast.error('Kontrak tidak ditemukan untuk pekerjaan ini');
            return;
        }

        if (!form.type_id || !form.tanggal) {
            toast.error('Tipe dokumen dan tanggal wajib diisi');
            return;
        }

        try {
            await createDocumentRegister({
                kontrak_id: selectedPekerjaanForReg.kontrak[0].id,
                type_id: parseInt(form.type_id),
                tanggal: form.tanggal,
                description: form.description,
                sequence_number: form.sequence_number ? parseInt(form.sequence_number) : undefined
            });
            toast.success('Nomor dokumen berhasil diregistrasi');
            setShowCreateModal(false);
            setSelectedPekerjaanForReg(null);
            fetchData();
            // Reset form
            setForm({
                type_id: '',
                tanggal: new Date().toISOString().split('T')[0],
                description: '',
                sequence_number: ''
            });
        } catch (error) {
            console.error('Failed to create register', error);
            toast.error('Gagal meregistrasi nomor dokumen');
        }
    };


    const handleSaveSequence = async () => {
        try {
            await updateDocumentSequence(selectedYear, newSequence);
            setLastSequence(newSequence);
            setEditingSequence(false);
            toast.success('Urutan penomoran berhasil diperbarui');
        } catch (error) {
            console.error('Failed to update sequence', error);
            toast.error('Gagal memperbarui urutan penomoran');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data pekerjaan ini? (Semua data kontrak & berita acara akan terhapus)')) return;
        try {
            await deletePekerjaan(id);
            toast.success('Pekerjaan berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Failed to delete pekerjaan:', error);
            toast.error('Gagal menghapus pekerjaan');
        }
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
                return {
                    'No': index + 1,
                    'Nama Paket': item.nama_paket,
                    'Pagu': item.pagu,
                    'Penyedia': k?.penyedia?.nama || '-',
                    'SPPBJ Nomor': k?.sppbj || '-',
                    'SPPBJ Tanggal': k?.tgl_sppbj || '-',
                    'SPK Nomor': k?.spk || '-',
                    'SPK Tanggal': k?.tgl_spk || '-',
                    'SPMK Nomor': k?.spmk || '-',
                    'SPMK Tanggal': k?.tgl_spmk || '-',
                    'BA LPP': item.berita_acara?.data?.ba_lpp?.length || 0,
                    'BA PHO': item.berita_acara?.data?.serah_terima_pertama?.length || 0,
                    'BA PHP': item.berita_acara?.data?.ba_php?.length || 0,
                    'BA FHO': item.berita_acara?.data?.ba_stp?.length || 0,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Register Dokumen");

            // Set column widths
            worksheet['!cols'] = [
                { wch: 5 }, { wch: 50 }, { wch: 15 }, { wch: 30 },
                { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
                { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
                { wch: 10 }, { wch: 10 }
            ];

            XLSX.writeFile(workbook, `Register_Dokumen_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.dismiss();
            toast.success('Excel berhasil diunduh');
        } catch (error) {
            toast.dismiss();
            console.error('Export failed:', error);
            toast.error('Gagal mengekspor data');
        } finally {
            setExporting(false);
        }
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
                                            <TableHead key={type.id} className="min-w-[150px]">{type.name}</TableHead>
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
                                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                    <Building2 size={12} className="shrink-0" />
                                                                    <span className="wrap-break-word" title={k?.penyedia?.nama || '-'}>
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
                                                            <TableCell key={type.id} className="align-top">
                                                                {reg ? (
                                                                    <div className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-1 rounded border border-blue-200 wrap-break-word min-w-[120px]">
                                                                        {reg.nomor}
                                                                        {reg.tanggal && <div className="text-[9px] text-muted-foreground font-normal mt-0.5">{formatDate(reg.tanggal)}</div>}
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="h-8 px-2"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Prev
                                </Button>
                                <div className="flex items-center px-3 h-8 rounded-md border bg-background text-xs font-medium">
                                    Halaman {page} dari {meta.last_page || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === meta.last_page || meta.last_page === 0}
                                    onClick={() => setPage(p => p + 1)}
                                    className="h-8 px-2"
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* MODAL REGISTRASI NOMOR BARU */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <PlusCircle className="h-6 w-6 text-primary" />
                                Registrasi Nomor Dokumen
                            </DialogTitle>
                            <DialogDescription>
                                Lengkapi data di bawah untuk generate nomor dokumen resmi
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => setSelectedPekerjaanForReg(null)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            )}

                            {selectedPekerjaanForReg && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Jenis Dokumen</Label>
                                        <Select value={form.type_id} onValueChange={(v) => setForm(f => ({ ...f, type_id: v }))}>
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
                                disabled={!selectedPekerjaanForReg || !form.type_id}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Generate & Simpan Nomor
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
                                    <Button size="sm" onClick={handleSaveType} disabled={isSavingType} className="gap-1.5">
                                        {isSavingType ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save size={14} />}
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
