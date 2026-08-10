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
    ShieldCheck,
    User,
} from 'lucide-react';
import { toast } from 'sonner';
import { getKontrakAddendumById, updateKontrakAddendum, overrideKontrakAddendumKelengkapan, approveKontrakAddendum } from '../api/kontrak';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { DatePickerField } from '@/components/shared/DatePickerField';

const statusClass: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    diajukan: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
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

    const handleApprove = () => {
        if (!addendum) return;
        const nomor = window.prompt('Nomor addendum');
        if (!nomor?.trim()) {
            toast.error('Nomor addendum wajib diisi saat approve');
            return;
        }
        approveMutation.mutate({ id: addendum.id, nomor_addendum: nomor.trim() });
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
                                <Button
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    onClick={handleApprove}
                                    disabled={approveMutation.isPending}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Setujui Langsung
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
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Pekerjaan</p>
                                        <p className="font-medium">{addendum.kontrak?.pekerjaan?.nama_paket || '-'}</p>
                                        <p className="text-xs text-muted-foreground">{addendum.kontrak?.pekerjaan?.kode_rekening || '-'}</p>
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
            </Main>
        </>
    );
}