import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Calendar,
    Check,
    Clock,
    FileText,
    Plus,
    ShieldCheck,
    User,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { getKontrakAddendumById, updateKontrakAddendum, overrideKontrakAddendumKelengkapan, approveKontrakAddendum, rejectKontrakAddendum, processKontrakAddendum } from '../api/kontrak';
import { ADDENDUM_ATTACHMENT_TYPES } from '../lib/addendum-constants';
import { getDocumentTypes, getDocumentRegisters, createDocumentRegister, deleteDocumentRegister } from '@/features/pekerjaan/api/pekerjaan';
import type { DocumentType, DocumentRegister } from '@/features/pekerjaan/types';
import type { KontrakAddendum, KontrakAddendumPayload } from '../types';
import { AddendumDocumentChecklist } from './AddendumDocumentChecklist';
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { DatePickerField } from '@/components/shared/DatePickerField';

const statusClass: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    diajukan: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    diproses: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    disetujui: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    ditolak: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
};

const jenisLabel: Record<string, string> = {
    teknis: 'Teknis',
    biaya: 'Biaya',
    waktu: 'Waktu',
    teknis_biaya: 'Teknis & Biaya',
    lainnya: 'Lainnya',
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (value?: number | null) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
    }).format(value || 0);

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-1 border-b border-border/50 py-3 last:border-0 sm:grid-cols-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm font-medium sm:col-span-2 break-words">{value ?? '-'}</span>
        </div>
    );
}

export default function KontrakAddendumDetail() {
    const { id } = useParams({ strict: false });
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.auth.user);
    const isAdmin = Boolean(user?.roles?.includes('admin'));

    const { data: addendum, isLoading, error } = useQuery({
        queryKey: ['kontrak-addendum', id],
        queryFn: () => getKontrakAddendumById(Number(id)),
        enabled: Boolean(id),
    });

    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<KontrakAddendumPayload | null>(null);
    const [approveOpen, setApproveOpen] = useState(false);
    const [approveNomor, setApproveNomor] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [regForm, setRegForm] = useState({ type_id: '', nomor: '', tanggal: '', description: '' });
    const [processOpen, setProcessOpen] = useState(false);
    const [processNomor, setProcessNomor] = useState('');
    const [processDokumen, setProcessDokumen] = useState<Record<string, { nomor: string; tanggal: string }>>({});

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['kontrak-addendum', id] });

    const overrideMutation = useMutation({
        mutationFn: ({ id: addendumId, kelengkapan_override }: { id: number; kelengkapan_override: boolean }) =>
            overrideKontrakAddendumKelengkapan(addendumId, kelengkapan_override),
        onSuccess: () => {
            toast.success('Kelengkapan di-override');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal mengubah override kelengkapan'),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: KontrakAddendumPayload) => updateKontrakAddendum(Number(id), payload),
        onSuccess: () => {
            toast.success('Data addendum berhasil diperbarui');
            setEditOpen(false);
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal memperbarui addendum'),
    });

    const approveMutation = useMutation({
        mutationFn: ({ id: addendumId, nomor_addendum }: { id: number; nomor_addendum: string }) =>
            approveKontrakAddendum(addendumId, { nomor_addendum }),
        onSuccess: () => {
            toast.success('Addendum disetujui');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menyetujui addendum'),
    });

    const rejectMutation = useMutation({
        mutationFn: (addendumId: number) => rejectKontrakAddendum(addendumId),
        onSuccess: () => {
            toast.success('Addendum ditolak');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menolak addendum'),
    });

    const { data: documentTypes } = useQuery({
        queryKey: ['document-types'],
        queryFn: getDocumentTypes,
        enabled: isAdmin,
    });

    const { data: registersData } = useQuery({
        queryKey: ['kontrak-addendum', id, 'registers'],
        queryFn: () => getDocumentRegisters({ addendum_id: Number(id), per_page: 100 }),
        enabled: Boolean(id),
    });
    const registers = registersData?.data ?? [];

    const createRegisterMutation = useMutation({
        mutationFn: (payload: { type_id: number; nomor: string; tanggal: string; description?: string }) =>
            createDocumentRegister({
                kontrak_id: addendum!.kontrak!.id,
                addendum_id: addendum!.id,
                type_id: payload.type_id,
                nomor: payload.nomor,
                tanggal: payload.tanggal,
                description: payload.description,
            }),
        onSuccess: () => {
            toast.success('Nomor dokumen ditambahkan');
            setRegisterOpen(false);
            setRegForm({ type_id: '', nomor: '', tanggal: '', description: '' });
            queryClient.invalidateQueries({ queryKey: ['kontrak-addendum', id, 'registers'] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menambahkan nomor dokumen'),
    });

    const processMutation = useMutation({
        mutationFn: (payload: { nomor_addendum: string; dokumen: { type: string; nomor: string; tanggal: string }[] }) =>
            processKontrakAddendum(Number(id), payload),
        onSuccess: () => {
            toast.success('Addendum disetujui');
            setProcessOpen(false);
            invalidate();
            queryClient.invalidateQueries({ queryKey: ['kontrak-addendum', id, 'registers'] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal memproses addendum'),
    });

    const openProcess = () => {
        if (!addendum) return;
        const today = new Date().toISOString().slice(0, 10);
        setProcessNomor(addendum.nomor_addendum || '');
        setProcessDokumen(Object.fromEntries(
            Object.keys(ADDENDUM_ATTACHMENT_TYPES).map((type) => [type, { nomor: '', tanggal: today }]),
        ));
        setProcessOpen(true);
    };

    const deleteRegisterMutation = useMutation({
        mutationFn: (registerId: number) => deleteDocumentRegister(registerId),
        onSuccess: () => {
            toast.success('Nomor dokumen dihapus');
            queryClient.invalidateQueries({ queryKey: ['kontrak-addendum', id, 'registers'] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menghapus nomor dokumen'),
    });

    const handleReject = () => {
        if (!addendum) return;
        rejectMutation.mutate(addendum.id);
        setRejectOpen(false);
    };

    const openEdit = (addendum: KontrakAddendum) => {
        setEditForm({
            addendum_ke: addendum.addendum_ke,
            nomor_addendum: addendum.nomor_addendum || '',
            tanggal_addendum: addendum.tanggal_addendum,
            jenis_addendum: addendum.jenis_addendum,
            alasan: addendum.alasan || '',
            deskripsi_perubahan: addendum.deskripsi_perubahan || '',
            nilai_kontrak_sebelum: addendum.nilai_kontrak_sebelum ?? undefined,
            nilai_kontrak_sesudah: addendum.nilai_kontrak_sesudah ?? undefined,
            tgl_selesai_sebelum: addendum.tgl_selesai_sebelum || undefined,
            tgl_selesai_sesudah: addendum.tgl_selesai_sesudah || undefined,
        });
        setEditOpen(true);
    };

    const openApprove = () => {
        if (!addendum) return;
        setApproveNomor(addendum.nomor_addendum?.trim() || '');
        setApproveOpen(true);
    };

    const handleApprove = () => {
        if (!addendum) return;
        if (!approveNomor.trim()) {
            toast.error('Nomor addendum wajib diisi saat approve');
            return;
        }
        approveMutation.mutate({ id: addendum.id, nomor_addendum: approveNomor.trim() });
        setApproveOpen(false);
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <Main>
                    <Skeleton className="h-10 w-64 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </Main>
            </>
        );
    }

    if (error || !addendum) {
        return (
            <>
                <Header />
                <Main>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                        <p className="font-medium text-destructive">Addendum tidak ditemukan atau gagal dimuat.</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link to="/kontrak-addendums">Kembali ke daftar</Link>
                        </Button>
                    </div>
                </Main>
            </>
        );
    }

    const items = addendum.items ?? [];

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 space-y-3">
                    <Button variant="ghost" size="sm" className="-ml-2" asChild>
                        <Link to="/kontrak-addendums">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar Addendum
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Addendum ke-{addendum.addendum_ke}
                        </h1>
                        <Badge variant="outline" className={statusClass[addendum.status] || statusClass.draft}>
                            {addendum.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        {addendum.nomor_addendum || 'Nomor addendum belum ditetapkan'}
                    </p>
                </div>

                {isAdmin && addendum.status !== 'disetujui' && (
                    <Card className="mb-6 border-primary/30 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Aksi Admin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium">Override Kelengkapan Dokumen</p>
                                    <p className="text-xs text-muted-foreground">
                                        Tandai kelengkapan lengkap meski belum semua dokumen diunggah.
                                    </p>
                                </div>
                                <Switch
                                    checked={Boolean(addendum.kelengkapan_override)}
                                    onCheckedChange={(checked) =>
                                        overrideMutation.mutate({ id: addendum.id, kelengkapan_override: checked })
                                    }
                                    disabled={overrideMutation.isPending}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => openEdit(addendum)}
                                    disabled={updateMutation.isPending}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Edit Data & Nilai
                                </Button>
                                {addendum.status === 'diajukan' && (
                                    <Button
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={openProcess}
                                        disabled={processMutation.isPending}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Proses & Setujui
                                    </Button>
                                )}
                                {addendum.status !== 'diajukan' && (
                                    <Button
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={openApprove}
                                        disabled={approveMutation.isPending}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Setujui Langsung
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={() => setRejectOpen(true)}
                                    disabled={rejectMutation.isPending}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Tolak
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5 text-primary" />
                                Informasi Addendum
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailRow label="Addendum Ke" value={addendum.addendum_ke} />
                            <DetailRow label="Nomor Addendum" value={addendum.nomor_addendum} />
                            <DetailRow label="Tanggal Addendum" value={formatDate(addendum.tanggal_addendum)} />
                            <DetailRow label="Jenis Addendum" value={jenisLabel[addendum.jenis_addendum] || addendum.jenis_addendum} />
                            <DetailRow label="Nilai Kontrak Sebelum" value={formatCurrency(addendum.nilai_kontrak_sebelum)} />
                            <DetailRow label="Nilai Kontrak Sesudah" value={formatCurrency(addendum.nilai_kontrak_sesudah)} />
                            <DetailRow label="Tgl. Selesai Sebelum" value={formatDate(addendum.tgl_selesai_sebelum)} />
                            <DetailRow label="Tgl. Selesai Sesudah" value={formatDate(addendum.tgl_selesai_sesudah)} />
                            <DetailRow label="Alasan" value={addendum.alasan} />
                            <DetailRow label="Deskripsi Perubahan" value={addendum.deskripsi_perubahan} />
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Konteks Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-1.5">
                                        <p className="text-xs uppercase text-muted-foreground">Pekerjaan</p>
                                        {(() => {
                                            const pekerjaans = addendum.kontrak?.pekerjaans?.length
                                                ? addendum.kontrak.pekerjaans
                                                : (addendum.kontrak?.pekerjaan ? [addendum.kontrak.pekerjaan] : []);
                                            return pekerjaans.length > 0 ? pekerjaans.map((p) => (
                                                <div key={p.id}>
                                                    <p className="font-medium">{p.nama_paket}</p>
                                                    <p className="text-xs text-muted-foreground">{p.kode_rekening || '-'}</p>
                                                </div>
                                            )) : <p className="font-medium">-</p>;
                                        })()}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Penyedia</p>
                                        <p className="font-medium">{addendum.kontrak?.penyedia?.nama || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">SPK / Kode Paket</p>
                                        <p className="font-medium">{addendum.kontrak?.spk || addendum.kontrak?.kode_paket || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Nilai Kontrak Utama</p>
                                        <p className="font-medium">{formatCurrency(addendum.kontrak?.nilai_kontrak)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Tgl. Selesai Kontrak</p>
                                        <p className="font-medium">{formatDate(addendum.kontrak?.tgl_selesai)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Riwayat & Persetujuan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Dibuat oleh</p>
                                    <p className="font-medium">{addendum.creator?.name || '-'}</p>
                                    <p className="text-xs text-muted-foreground">{formatDateTime(addendum.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Disetujui oleh</p>
                                    <p className="font-medium">{addendum.approver?.name || '-'}</p>
                                    <p className="text-xs text-muted-foreground">{formatDateTime(addendum.approved_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Terakhir diperbarui</p>
                                    <p className="font-medium">{formatDateTime(addendum.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Dokumen Addendum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddendumDocumentChecklist attachments={addendum.attachments} />
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Nomor Dokumen Terkait</CardTitle>
                            {isAdmin && (
                                <Button variant="outline" size="sm" onClick={() => setRegisterOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Nomor Dokumen
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {registers.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Belum ada nomor dokumen terkait.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jenis Dokumen</TableHead>
                                        <TableHead>Nomor</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registers.map((register) => (
                                        <TableRow key={register.id}>
                                            <TableCell className="font-medium">{register.type?.name || '-'}</TableCell>
                                            <TableCell className="font-mono text-xs">{register.nomor}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatDate(register.tanggal)}</TableCell>
                                            <TableCell>{register.description || '-'}</TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Hapus"
                                                        onClick={() => deleteRegisterMutation.mutate(register.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Rincian Item</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {items.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada rincian item addendum.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Spesifikasi Sebelum</TableHead>
                                        <TableHead>Spesifikasi Sesudah</TableHead>
                                        <TableHead className="text-right">Volume Sebelum</TableHead>
                                        <TableHead className="text-right">Volume Sesudah</TableHead>
                                        <TableHead className="text-right">Harga Sebelum</TableHead>
                                        <TableHead className="text-right">Harga Sesudah</TableHead>
                                        <TableHead className="text-right">Subtotal Sebelum</TableHead>
                                        <TableHead className="text-right">Subtotal Sesudah</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.nama_item || '-'}</TableCell>
                                            <TableCell>{item.spesifikasi_sebelum || '-'}</TableCell>
                                            <TableCell>{item.spesifikasi_sesudah || '-'}</TableCell>
                                            <TableCell className="text-right">{item.volume_sebelum ?? '-'}</TableCell>
                                            <TableCell className="text-right">{item.volume_sesudah ?? '-'}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.harga_sebelum)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.harga_sesudah)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.subtotal_sebelum)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.subtotal_sesudah)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[720px]">
                        <DialogHeader>
                            <DialogTitle>Edit Data Addendum</DialogTitle>
                            <DialogDescription>
                                Ubah nilai kontrak, tanggal selesai, dan detail addendum sebelum disetujui.
                            </DialogDescription>
                        </DialogHeader>
                        {editForm && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Addendum ke</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={editForm.addendum_ke}
                                        onChange={(event) => setEditForm((prev) => prev && ({ ...prev, addendum_ke: Number(event.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal Addendum</Label>
                                    <DatePickerField
                                        value={editForm.tanggal_addendum}
                                        onChange={(tanggal_addendum) => setEditForm((prev) => prev && ({ ...prev, tanggal_addendum }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nilai Sebelum</Label>
                                    <CurrencyInput
                                        name="nilai_kontrak_sebelum"
                                        value={editForm.nilai_kontrak_sebelum || 0}
                                        onChange={(name, value) => setEditForm((prev) => prev && ({ ...prev, [name]: value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nilai Sesudah</Label>
                                    <CurrencyInput
                                        name="nilai_kontrak_sesudah"
                                        value={editForm.nilai_kontrak_sesudah || 0}
                                        onChange={(name, value) => setEditForm((prev) => prev && ({ ...prev, [name]: value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tgl. Selesai Sebelum</Label>
                                    <DatePickerField
                                        value={editForm.tgl_selesai_sebelum || ''}
                                        onChange={(tgl_selesai_sebelum) => setEditForm((prev) => prev && ({ ...prev, tgl_selesai_sebelum }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tgl. Selesai Sesudah</Label>
                                    <DatePickerField
                                        value={editForm.tgl_selesai_sesudah || ''}
                                        onChange={(tgl_selesai_sesudah) => setEditForm((prev) => prev && ({ ...prev, tgl_selesai_sesudah }))}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Nomor Addendum</Label>
                                    <Input
                                        value={editForm.nomor_addendum || ''}
                                        onChange={(event) => setEditForm((prev) => prev && ({ ...prev, nomor_addendum: event.target.value }))}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Alasan</Label>
                                    <Textarea
                                        value={editForm.alasan || ''}
                                        onChange={(event) => setEditForm((prev) => prev && ({ ...prev, alasan: event.target.value }))}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Deskripsi Perubahan</Label>
                                    <Textarea
                                        value={editForm.deskripsi_perubahan || ''}
                                        onChange={(event) => setEditForm((prev) => prev && ({ ...prev, deskripsi_perubahan: event.target.value }))}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={() => editForm && updateMutation.mutate(editForm)} disabled={updateMutation.isPending}>
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Setujui Addendum</AlertDialogTitle>
                            <AlertDialogDescription>
                                Masukkan nomor addendum untuk menyetujui pengajuan ini.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input
                            value={approveNomor}
                            onChange={(event) => setApproveNomor(event.target.value)}
                            placeholder="Nomor addendum"
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprove} disabled={approveMutation.isPending}>
                                Setujui
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tolak Addendum</AlertDialogTitle>
                            <AlertDialogDescription>
                                Anda yakin ingin menolak addendum ini? Pengawas dapat memperbaiki dan mengajukan kembali.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleReject}
                                disabled={rejectMutation.isPending}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                Tolak
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={processOpen} onOpenChange={setProcessOpen}>
                    <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[720px]">
                        <DialogHeader>
                            <DialogTitle>Proses & Setujui Addendum</DialogTitle>
                            <DialogDescription>
                                Tetapkan nomor addendum dan nomor-nomor dokumen wajib untuk menyetujui pengajuan ini.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nomor Addendum</Label>
                                <Input
                                    value={processNomor}
                                    onChange={(event) => setProcessNomor(event.target.value)}
                                    placeholder="Nomor addendum"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Nomor Dokumen Wajib</Label>
                                {Object.entries(ADDENDUM_ATTACHMENT_TYPES).map(([type, label]) => (
                                    <div key={type} className="rounded-lg border p-3 space-y-2">
                                        <p className="text-sm font-medium">{label}</p>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <Input
                                                placeholder="Nomor dokumen"
                                                value={processDokumen[type]?.nomor || ''}
                                                onChange={(event) => setProcessDokumen((prev) => ({
                                                    ...prev,
                                                    [type]: { ...prev[type], nomor: event.target.value },
                                                }))}
                                            />
                                            <Input
                                                type="date"
                                                value={processDokumen[type]?.tanggal || ''}
                                                onChange={(event) => setProcessDokumen((prev) => ({
                                                    ...prev,
                                                    [type]: { ...prev[type], tanggal: event.target.value },
                                                }))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setProcessOpen(false)}>
                                Batal
                            </Button>
                            <Button
                                onClick={() => processMutation.mutate({
                                    nomor_addendum: processNomor,
                                    dokumen: Object.entries(processDokumen).map(([type, d]) => ({
                                        type,
                                        nomor: d.nomor,
                                        tanggal: d.tanggal,
                                    })),
                                })}
                                disabled={processMutation.isPending || !processNomor || Object.values(processDokumen).some((d) => !d.nomor || !d.tanggal)}
                            >
                                Proses & Setujui
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                    <DialogContent className="sm:max-w-[520px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Nomor Dokumen</DialogTitle>
                            <DialogDescription>
                                Catat nomor dokumen addendum lain agar penomoran sejalan dengan register.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Jenis Dokumen</Label>
                                <Select
                                    value={regForm.type_id}
                                    onValueChange={(value) => setRegForm((prev) => ({ ...prev, type_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis dokumen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(documentTypes ?? []).map((type: DocumentType) => (
                                            <SelectItem key={type.id} value={String(type.id)}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Nomor</Label>
                                <Input
                                    value={regForm.nomor}
                                    onChange={(event) => setRegForm((prev) => ({ ...prev, nomor: event.target.value }))}
                                    placeholder="Nomor dokumen"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal</Label>
                                <Input
                                    type="date"
                                    value={regForm.tanggal}
                                    onChange={(event) => setRegForm((prev) => ({ ...prev, tanggal: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Textarea
                                    value={regForm.description}
                                    onChange={(event) => setRegForm((prev) => ({ ...prev, description: event.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
                                Batal
                            </Button>
                            <Button
                                onClick={() => createRegisterMutation.mutate({
                                    type_id: Number(regForm.type_id),
                                    nomor: regForm.nomor,
                                    tanggal: regForm.tanggal,
                                    description: regForm.description || undefined,
                                })}
                                disabled={createRegisterMutation.isPending || !regForm.type_id || !regForm.nomor || !regForm.tanggal}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}