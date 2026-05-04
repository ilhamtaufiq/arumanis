import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    Search,
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
    FileText,
    History,
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
    getDocumentRegisters,
    createDocumentRegister,
    deleteDocumentRegister,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType
} from '../api/pekerjaan';
import type { Pekerjaan, DocumentType, DocumentRegister } from '../types';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
                    <div className="text-sm font-semibold text-foreground tabular-nums truncate max-w-[180px]" title={num!}>
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
    const [meta, setMeta] = useState<any>(null);
    const [exporting, setExporting] = useState(false);

    // Sequence states
    const [lastSequence, setLastSequence] = useState<number>(0);
    const [editingSequence, setEditingSequence] = useState(false);
    const [newSequence, setNewSequence] = useState<number>(0);

    // Dynamic Register states
    const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
    const [registers, setRegisters] = useState<DocumentRegister[]>([]);
    const [isRegistersLoading, setIsRegistersLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [registerPage, setRegisterPage] = useState(1);
    const [registerMeta, setRegisterMeta] = useState<any>(null);
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
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus tipe dokumen');
        }
    };

    const fetchSequence = async () => {
        try {
            const res = await getDocumentSequence(selectedYear);
            setLastSequence(res.last_number);
            setNewSequence(res.last_number);
        } catch (error) {
            console.error('Failed to fetch sequence', error);
        }
    };

    const fetchDocTypes = async () => {
        try {
            const res = await getDocumentTypes();
            setDocTypes(res);
        } catch (error) {
            console.error('Failed to fetch doc types', error);
        }
    };

    const fetchRegisters = async () => {
        try {
            setIsRegistersLoading(true);
            const res = await getDocumentRegisters({
                page: registerPage,
                tahun: selectedYear,
                search: search
            });
            console.log('Fetched registers:', res);
            setRegisters(res.data || []);
            setRegisterMeta({
                total: res.total || 0,
                last_page: res.last_page || 1,
                current_page: res.current_page || 1
            });
        } catch (error) {
            console.error('Failed to fetch registers', error);
        } finally {
            setIsRegistersLoading(false);
        }
    };

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
            fetchRegisters();
            // Reset form
            setForm({
                type_id: '',
                tanggal: new Date().toISOString().split('T')[0],
                description: '',
                sequence_number: ''
            });
        } catch (error: any) {
            console.error('Failed to create register', error);
            toast.error(error.response?.data?.message || 'Gagal meregistrasi nomor dokumen');
        }
    };

    const handleDeleteRegister = async (id: number) => {
        if (!window.confirm('Hapus registrasi nomor ini?')) return;
        try {
            await deleteDocumentRegister(id);
            toast.success('Registrasi berhasil dihapus');
            fetchData();
            fetchRegisters();
        } catch (error) {
            toast.error('Gagal menghapus registrasi');
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
    }, [tahunAnggaran]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getDocumentRegister({
                page,
                search,
                tahun: selectedYear,
                per_page: 20
            });
            setData(res.data);
            setMeta(res.meta);
        } catch (error) {
            console.error('Failed to fetch register:', error);
            toast.error('Gagal memuat data register');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchSequence();
        fetchDocTypes();
        fetchRegisters();
    }, [page, registerPage, selectedYear]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
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

    const getBAStatus = (pekerjaan: Pekerjaan) => {
        if (!pekerjaan.berita_acara || !pekerjaan.berita_acara.data) return [];

        const ba = pekerjaan.berita_acara.data;
        const summaries: { type: string; count: number; status: 'completed' | 'missing' }[] = [];

        if (ba.ba_lpp && ba.ba_lpp.length > 0) summaries.push({ type: 'LPP', count: ba.ba_lpp.length, status: 'completed' });
        if (ba.serah_terima_pertama && ba.serah_terima_pertama.length > 0) summaries.push({ type: 'PHO', count: ba.serah_terima_pertama.length, status: 'completed' });
        if (ba.ba_php && ba.ba_php.length > 0) summaries.push({ type: 'PHP', count: ba.ba_php.length, status: 'completed' });
        if (ba.ba_stp && ba.ba_stp.length > 0) summaries.push({ type: 'FHO', count: ba.ba_stp.length, status: 'completed' });

        return summaries;
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
                        <Button variant="outline" onClick={handleExportExcel} disabled={exporting}>
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
                        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari paket, penyedia, atau nomor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </form>
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

                <Tabs defaultValue="utama" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                        <TabsTrigger value="utama" className="flex items-center gap-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <FileText size={16} />
                            Register Utama (SPPBJ/SPK/SPMK)
                        </TabsTrigger>
                        <TabsTrigger value="dinamis" className="flex items-center gap-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <History size={16} />
                            Register Dinamis (Lainnya)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="utama">
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
                                                <TableHead className="w-[350px]">Pekerjaan / Paket</TableHead>
                                                <TableHead>SPPBJ</TableHead>
                                                <TableHead>SPK (Kontrak)</TableHead>
                                                <TableHead>SPMK</TableHead>
                                                <TableHead>Register Dinamis</TableHead>
                                                <TableHead>Progress BA</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-40 text-center">
                                                        <div className="flex flex-col items-center gap-2 justify-center">
                                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Memuat data register...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : data.length > 0 ? (
                                                data.map((item) => {
                                                    const k = item.kontrak?.[0];
                                                    const baSummaries = getBAStatus(item);

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
                                                                            <span className="truncate max-w-[280px]" title={k?.penyedia?.nama || '-'}>
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
                                                            <TableCell className="align-top">
                                                                <div className="flex flex-col gap-1 max-w-[180px]">
                                                                    {k?.registers && k.registers.length > 0 ? (
                                                                        k.registers.map(reg => (
                                                                            <Badge key={reg.id} variant="secondary" className="font-mono text-[10px] py-0 px-1.5 truncate block border-blue-100 bg-blue-50 text-blue-800 hover:bg-blue-100">
                                                                                {reg.type?.code}: {reg.nomor}
                                                                            </Badge>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-[10px] text-muted-foreground italic">Belum ada</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <div className="flex flex-wrap gap-2 max-w-[240px]">
                                                                    {baSummaries.length > 0 ? (
                                                                        baSummaries.map((ba, idx) => (
                                                                            <Badge
                                                                                key={idx}
                                                                                variant="outline"
                                                                                className={cn(
                                                                                    "h-6 text-[10px]",
                                                                                    ba.status === 'completed'
                                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                                                )}
                                                                            >
                                                                                {ba.type}
                                                                                {ba.count > 0 && <span className="ml-1 opacity-70">({ba.count})</span>}
                                                                            </Badge>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-[10px] text-muted-foreground italic uppercase tracking-wider font-semibold">Belum Ada BA</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="align-top text-right">
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
                                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                                        Tidak ada data ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            {meta && meta.last_page > 1 && (
                                <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
                                    <p className="text-xs text-muted-foreground">
                                        Menampilkan {meta.from}-{meta.to} dari {meta.total} paket
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            <ChevronLeft size={16} />
                                        </Button>
                                        <span className="text-sm font-medium">Halaman {page} dari {meta.last_page}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === meta.last_page}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="dinamis">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle>Register Dokumen Dinamis</CardTitle>
                                    <CardDescription>Daftar penomoran untuk Berita Acara, NPHD, Ringkasan Kontrak, dll.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-1.5"
                                        onClick={() => setShowTypeSettings(true)}
                                    >
                                        <Settings2 size={16} />
                                        Konfigurasi Tipe
                                    </Button>
                                    <Button 
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={() => {
                                            setSelectedPekerjaanForReg(null); // Clear selected if any
                                            setShowCreateModal(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Registrasi Baru
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>No. Dokumen</TableHead>
                                                <TableHead>Tipe</TableHead>
                                                <TableHead>Pekerjaan / Paket</TableHead>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isRegistersLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-40 text-center">
                                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                                    </TableCell>
                                                </TableRow>
                                            ) : registers.length > 0 ? (
                                                registers.map((reg) => (
                                                    <TableRow key={reg.id}>
                                                        <TableCell className="font-bold tabular-nums">{reg.nomor}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{reg.type?.name}</Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-[250px]">
                                                            <div className="font-medium truncate">{reg.kontrak?.pekerjaan?.nama_paket}</div>
                                                            <div className="text-[10px] text-muted-foreground truncate">{reg.kontrak?.penyedia?.nama}</div>
                                                        </TableCell>
                                                        <TableCell>{formatDate(reg.tanggal)}</TableCell>
                                                        <TableCell className="text-muted-foreground text-xs italic">{reg.description || '-'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleDeleteRegister(reg.id)}
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                                        Belum ada register dokumen dinamis.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            {registerMeta && registerMeta.last_page > 1 && (
                                <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
                                    <p className="text-xs text-muted-foreground">
                                        Total {registerMeta.total} register
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={registerPage === 1}
                                            onClick={() => setRegisterPage(p => p - 1)}
                                        >
                                            <ChevronLeft size={16} />
                                        </Button>
                                        <span className="text-sm font-medium">Halaman {registerPage}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={registerPage === registerMeta.last_page}
                                            onClick={() => setRegisterPage(p => p + 1)}
                                        >
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>

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
                                                <TableCell className="text-xs font-mono max-w-[200px] truncate" title={type.format_template}>
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

function CardStat({ label, value, icon: Icon, color }: any) {
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
