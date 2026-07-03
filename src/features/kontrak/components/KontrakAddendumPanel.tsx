import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus, Send, Check, X, Upload, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
    approveKontrakAddendum,
    createKontrakAddendum,
    rejectKontrakAddendum,
    submitKontrakAddendum,
    uploadKontrakAddendum,
} from '../api/kontrak';
import type { Kontrak, KontrakAddendum, KontrakAddendumPayload } from '../types';
import { useAuthStore } from '@/stores/auth-stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { DatePickerField } from '@/components/shared/DatePickerField';

const statusVariant: Record<string, string> = {
    utama: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
    draft: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
    diajukan: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    disetujui: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    ditolak: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatCurrency = (value?: number | null) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

function statusBadge(status: string) {
    return (
        <Badge variant="outline" className={statusVariant[status] || statusVariant.draft}>
            {status}
        </Badge>
    );
}

export function KontrakAddendumPanel({ kontrak }: { kontrak: Kontrak }) {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.auth.user);
    const roles = user?.roles?.map((role) => role.toLowerCase()) ?? [];
    const isAdmin = roles.includes('admin');
    const isPengawas = roles.includes('pengawas');
    const addendums = kontrak.addendums ?? [];
    const latestApproved = [...addendums]
        .filter((item) => item.status === 'disetujui')
        .sort((a, b) => b.addendum_ke - a.addendum_ke)[0];

    const nextAddendumKe = (addendums.reduce((max, item) => Math.max(max, item.addendum_ke), 0) || 0) + 1;
    const defaultNilaiSebelum = latestApproved?.nilai_kontrak_sesudah ?? kontrak.nilai_kontrak ?? 0;
    const defaultTglSelesaiSebelum = latestApproved?.tgl_selesai_sesudah ?? kontrak.tgl_selesai ?? '';

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<KontrakAddendumPayload>({
        addendum_ke: nextAddendumKe,
        nomor_addendum: '',
        tanggal_addendum: new Date().toISOString().slice(0, 10),
        jenis_addendum: 'lainnya',
        alasan: '',
        deskripsi_perubahan: '',
        nilai_kontrak_sebelum: defaultNilaiSebelum,
        nilai_kontrak_sesudah: defaultNilaiSebelum,
        tgl_selesai_sebelum: defaultTglSelesaiSebelum,
        tgl_selesai_sesudah: defaultTglSelesaiSebelum,
    });

    const versions = useMemo(() => {
        if (kontrak.contract_versions?.length) return kontrak.contract_versions;

        return [
            {
                type: 'utama' as const,
                label: 'Kontrak Utama',
                nomor: kontrak.spk || kontrak.kode_paket,
                tanggal: kontrak.tgl_spk,
                nilai_kontrak: kontrak.nilai_kontrak,
                tgl_selesai: kontrak.tgl_selesai,
                status: 'utama',
            },
            ...addendums.map((item) => ({
                type: 'addendum' as const,
                id: item.id,
                label: `Addendum ke-${item.addendum_ke}`,
                addendum_ke: item.addendum_ke,
                nomor: item.nomor_addendum,
                tanggal: item.tanggal_addendum,
                nilai_kontrak: item.nilai_kontrak_sesudah,
                tgl_selesai: item.tgl_selesai_sesudah,
                status: item.status,
            })),
        ];
    }, [addendums, kontrak]);

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['kontrak', String(kontrak.id)] });

    const createMutation = useMutation({
        mutationFn: () => createKontrakAddendum(kontrak.id, form),
        onSuccess: () => {
            toast.success('Addendum berhasil dibuat');
            setDialogOpen(false);
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal membuat addendum'),
    });

    const submitMutation = useMutation({
        mutationFn: (id: number) => submitKontrakAddendum(id),
        onSuccess: () => {
            toast.success('Addendum berhasil diajukan');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal mengajukan addendum'),
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, nomor_addendum }: { id: number; nomor_addendum: string }) => approveKontrakAddendum(id, { nomor_addendum }),
        onSuccess: () => {
            toast.success('Addendum disetujui');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menyetujui addendum'),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => rejectKontrakAddendum(id),
        onSuccess: () => {
            toast.success('Addendum ditolak');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menolak addendum'),
    });

    const uploadMutation = useMutation({
        mutationFn: ({ id, file }: { id: number; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            return uploadKontrakAddendum(id, formData);
        },
        onSuccess: () => {
            toast.success('Dokumen addendum berhasil diupload');
            invalidate();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal upload dokumen'),
    });

    const resetForm = () => {
        setForm({
            addendum_ke: nextAddendumKe,
            nomor_addendum: '',
            tanggal_addendum: new Date().toISOString().slice(0, 10),
            jenis_addendum: 'lainnya',
            alasan: '',
            deskripsi_perubahan: '',
            nilai_kontrak_sebelum: defaultNilaiSebelum,
            nilai_kontrak_sesudah: defaultNilaiSebelum,
            tgl_selesai_sebelum: defaultTglSelesaiSebelum,
            tgl_selesai_sesudah: defaultTglSelesaiSebelum,
        });
    };

    const handleCreate = () => {
        if (!form.tanggal_addendum) {
            toast.error('Tanggal addendum wajib diisi');
            return;
        }

        createMutation.mutate();
    };

    const canSubmit = (addendum: KontrakAddendum) =>
        (isAdmin || isPengawas) && ['draft', 'ditolak'].includes(addendum.status);

    return (
        <>
            <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Versi Kontrak & Addendum
                        </CardTitle>
                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    resetForm();
                                    setDialogOpen(true);
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Addendum
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Versi</TableHead>
                                    <TableHead>Nomor</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Nilai</TableHead>
                                    <TableHead>Tgl. Selesai</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {versions.map((version) => {
                                    const addendum = version.type === 'addendum'
                                        ? addendums.find((item) => item.id === version.id)
                                        : undefined;

                                    return (
                                        <TableRow key={`${version.type}-${version.id ?? 'utama'}`}>
                                            <TableCell className="font-medium whitespace-nowrap">{version.label}</TableCell>
                                            <TableCell className="min-w-[180px]">{version.nomor || '-'}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatDate(version.tanggal)}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(version.nilai_kontrak)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatDate(version.tgl_selesai)}</TableCell>
                                            <TableCell>{statusBadge(version.status)}</TableCell>
                                            <TableCell className="text-right">
                                                {addendum ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="outline" title="Detail addendum" asChild>
                                                            <Link
                                                                to="/kontrak-addendums/$id"
                                                                params={{ id: String(addendum.id) }}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        {canSubmit(addendum) && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                title="Ajukan addendum"
                                                                onClick={() => submitMutation.mutate(addendum.id)}
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {isAdmin && addendum.status === 'diajukan' && (
                                                            <>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    title="Setujui addendum"
                                                                    onClick={() => {
                                                                        const nomorAddendum = window.prompt('Nomor addendum');

                                                                        if (!nomorAddendum?.trim()) {
                                                                            toast.error('Nomor addendum wajib diisi saat approve');
                                                                            return;
                                                                        }

                                                                        approveMutation.mutate({
                                                                            id: addendum.id,
                                                                            nomor_addendum: nomorAddendum.trim(),
                                                                        });
                                                                    }}
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    title="Tolak addendum"
                                                                    onClick={() => rejectMutation.mutate(addendum.id)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {isAdmin && addendum.status !== 'disetujui' && (
                                                            <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border bg-background hover:bg-accent">
                                                                <Upload className="w-4 h-4" />
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    onChange={(event) => {
                                                                        const file = event.target.files?.[0];
                                                                        if (file) uploadMutation.mutate({ id: addendum.id, file });
                                                                        event.target.value = '';
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Baseline</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[1080px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Addendum Kontrak</DialogTitle>
                        <DialogDescription>
                            Addendum disimpan sebagai versi baru tanpa mengubah data kontrak utama.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Addendum ke</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.addendum_ke}
                                onChange={(event) => setForm((prev) => ({ ...prev, addendum_ke: Number(event.target.value) }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Addendum</Label>
                            <DatePickerField
                                value={form.tanggal_addendum}
                                onChange={(tanggal_addendum) =>
                                    setForm((prev) => ({ ...prev, tanggal_addendum }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Addendum</Label>
                            <Select
                                value={form.jenis_addendum}
                                onValueChange={(value: KontrakAddendumPayload['jenis_addendum']) =>
                                    setForm((prev) => ({ ...prev, jenis_addendum: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="teknis">Teknis</SelectItem>
                                    <SelectItem value="biaya">Biaya</SelectItem>
                                    <SelectItem value="waktu">Waktu</SelectItem>
                                    <SelectItem value="teknis_biaya">Teknis & Biaya</SelectItem>
                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nilai Sebelum</Label>
                            <CurrencyInput
                                name="nilai_kontrak_sebelum"
                                value={form.nilai_kontrak_sebelum || 0}
                                onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nilai Sesudah</Label>
                            <CurrencyInput
                                name="nilai_kontrak_sesudah"
                                value={form.nilai_kontrak_sesudah || 0}
                                onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tgl. Selesai Sebelum</Label>
                            <DatePickerField
                                value={form.tgl_selesai_sebelum || ''}
                                onChange={(tgl_selesai_sebelum) =>
                                    setForm((prev) => ({ ...prev, tgl_selesai_sebelum }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tgl. Selesai Sesudah</Label>
                            <DatePickerField
                                value={form.tgl_selesai_sesudah || ''}
                                onChange={(tgl_selesai_sesudah) =>
                                    setForm((prev) => ({ ...prev, tgl_selesai_sesudah }))
                                }
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Alasan</Label>
                            <Textarea
                                value={form.alasan || ''}
                                onChange={(event) => setForm((prev) => ({ ...prev, alasan: event.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Deskripsi Perubahan</Label>
                            <Textarea
                                value={form.deskripsi_perubahan || ''}
                                onChange={(event) => setForm((prev) => ({ ...prev, deskripsi_perubahan: event.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            Simpan Addendum
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
