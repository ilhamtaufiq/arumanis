import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createPekerjaan, getPekerjaanById, updatePekerjaan } from '../api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import type { Kecamatan } from '@/features/kecamatan/types';
import { getDesaByKecamatan } from '@/features/desa/api/desa';
import type { Desa } from '@/features/desa/types';
import { getAllKegiatan } from '@/features/kegiatan/api/kegiatan';
import type { Kegiatan } from '@/features/kegiatan/types';
import { getPengawas } from '@/features/pengawas/api/pengawas';
import type { Pengawas } from '@/features/pengawas/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Info, MapPin, Users, Wallet, Tag as TagIcon, Briefcase, StickyNote } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import TagInput from './TagInput';
import type { PekerjaanStatus, Tag } from '../types';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Separator } from '@/components/ui/separator';
import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields';

/** Normalize API list payloads: `{ data: T[] }` or bare `T[]`. */
function unwrapList<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: T[] }).data;
    }
    return [];
}

/** Radix Select only shows a label when a matching SelectItem exists — inject current relation if missing. */
function ensureOption<T extends { id: number | string }>(
    list: T[],
    current: T | null | undefined,
): T[] {
    if (!current) return list;
    const id = Number(current.id);
    if (!id || Number.isNaN(id)) return list;
    if (list.some((item) => Number(item.id) === id)) return list;
    return [current, ...list];
}

function toId(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function PekerjaanForm() {
    const queryClient = useQueryClient();
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id && id !== 'new';
    const { tahunAnggaran } = useAppSettingsValues();

    const [formData, setFormData] = useState({
        kode_rekening: '',
        nama_paket: '',
        pagu: 0,
        is_konsultan: false,
        status: 'active' as PekerjaanStatus,
        catatan: '',
        kecamatan_id: 0,
        desa_id: 0,
        kegiatan_id: 0,
        pengawas_id: 0,
        pendamping_id: 0,
    });
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    /** Prevent double-hydrate overwriting user edits if query refetches. */
    const [hydratedId, setHydratedId] = useState<string | null>(null);

    // Queries
    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
    });

    const { data: kegiatanRes } = useQuery({
        queryKey: ['kegiatan', 'all', { tahun: tahunAnggaran }],
        queryFn: () => getAllKegiatan(tahunAnggaran),
        enabled: !!tahunAnggaran,
    });

    const { data: pengawasRes } = useQuery({
        queryKey: ['pengawas'],
        queryFn: () => getPengawas(),
    });

    const { data: pekerjaanRes, isLoading: loadingPekerjaan } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => {
            const response = await getPekerjaanById(Number(id)) as {
                data?: { data?: unknown } | unknown
            };
            // Laravel JsonResource: { data: pekerjaan } — avoid double-unwrap mistakes
            const body = response?.data ?? response;
            if (body && typeof body === 'object' && 'data' in body && (body as { data: unknown }).data && typeof (body as { data: unknown }).data === 'object' && 'id' in ((body as { data: object }).data as object)) {
                return (body as { data: unknown }).data;
            }
            return body;
        },
        enabled: isEdit && !!id && !isNaN(Number(id)),
    });

    const { data: desaRes, isLoading: loadingDesa } = useQuery({
        queryKey: ['desa', formData.kecamatan_id],
        queryFn: () => getDesaByKecamatan(formData.kecamatan_id),
        enabled: !!formData.kecamatan_id,
    });

    // Dropdown options — always include currently selected entity so Radix can render the label
    const kecamatanList = useMemo(
        () =>
            ensureOption(
                unwrapList<Kecamatan>(kecamatanRes),
                pekerjaanRes?.kecamatan as Kecamatan | undefined,
            ),
        [kecamatanRes, pekerjaanRes?.kecamatan],
    );

    const desaList = useMemo(
        () =>
            ensureOption(
                unwrapList<Desa>(desaRes),
                formData.desa_id > 0
                    ? (pekerjaanRes?.desa as Desa | undefined) ??
                      ({ id: formData.desa_id, nama_desa: `Desa #${formData.desa_id}` } as Desa)
                    : undefined,
            ),
        [desaRes, formData.desa_id, pekerjaanRes?.desa],
    );

    const kegiatanList = useMemo(
        () =>
            ensureOption(
                Array.isArray(kegiatanRes) ? kegiatanRes : unwrapList<Kegiatan>(kegiatanRes),
                pekerjaanRes?.kegiatan as Kegiatan | undefined,
            ),
        [kegiatanRes, pekerjaanRes?.kegiatan],
    );

    const pengawasList = useMemo(
        () => {
            const base = unwrapList<Pengawas>(pengawasRes);
            let list = ensureOption(base, pekerjaanRes?.pengawas as Pengawas | undefined);
            list = ensureOption(list, pekerjaanRes?.pendamping as Pengawas | undefined);
            return list;
        },
        [pengawasRes, pekerjaanRes?.pengawas, pekerjaanRes?.pendamping],
    );

    // Hydrate form once per edit id when detail arrives
    useEffect(() => {
        if (!pekerjaanRes || !isEdit || !id) return;
        if (hydratedId === id) return;

        const data = pekerjaanRes as Record<string, unknown> & {
            kecamatan?: { id?: number }
            desa?: { id?: number }
            kegiatan?: { id?: number }
            pengawas?: { id?: number }
            pendamping?: { id?: number }
            tags?: Tag[]
        };

        setFormData({
            kode_rekening: String(data.kode_rekening ?? ''),
            nama_paket: String(data.nama_paket ?? ''),
            pagu: Number(data.pagu) || 0,
            is_konsultan: Boolean(data.is_konsultan),
            status: (data.status === 'canceled' ? 'canceled' : 'active') as PekerjaanStatus,
            catatan: String(data.catatan ?? ''),
            kecamatan_id: toId(data.kecamatan_id ?? data.kecamatan?.id),
            desa_id: toId(data.desa_id ?? data.desa?.id),
            kegiatan_id: toId(data.kegiatan_id ?? data.kegiatan?.id),
            pengawas_id: toId(data.pengawas_id ?? data.pengawas?.id),
            pendamping_id: toId(data.pendamping_id ?? data.pendamping?.id),
        });
        setSelectedTags(Array.isArray(data.tags) ? data.tags : []);
        setHydratedId(id);
    }, [pekerjaanRes, isEdit, id, hydratedId]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEdit && id) {
                return updatePekerjaan(Number(id), data);
            }
            return createPekerjaan(data);
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Pekerjaan berhasil diperbarui' : 'Pekerjaan berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['pekerjaan'] });
            navigate({ to: '/pekerjaan' });
        },
        onError: () => toast.error('Gagal menyimpan pekerjaan'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'pagu' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'status') {
            setFormData((prev) => ({
                ...prev,
                status: (value === 'canceled' ? 'canceled' : 'active') as PekerjaanStatus,
            }));
            return;
        }
        const idValue = parseInt(value) || 0;
        setFormData((prev) => ({
            ...prev,
            [name]: idValue,
            // Only reset desa if kecamatan is changed manually
            ...(name === 'kecamatan_id' && prev.kecamatan_id !== idValue ? { desa_id: 0 } : {}),
        }));
    };

    const handleNumberChange = (name: string, value: number) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama_paket?.trim()) {
            toast.error('Harap isi nama paket');
            return;
        }

        // Pagu boleh 0 (mis. paket dibatalkan / belum ada anggaran); tolak hanya nilai invalid
        const paguNum = Number(formData.pagu)
        if (!Number.isFinite(paguNum) || paguNum < 0) {
            toast.error('Pagu harus angka ≥ 0');
            return;
        }

        if (!formData.is_konsultan && (!formData.kecamatan_id || !formData.desa_id)) {
            toast.error('Kecamatan dan desa wajib diisi untuk pekerjaan non-konsultan');
            return;
        }

        const dataToSave = {
            ...formData,
            pagu: paguNum,
            is_konsultan: formData.is_konsultan,
            status: formData.status === 'canceled' ? 'canceled' : 'active',
            catatan: formData.catatan?.trim() ? formData.catatan.trim() : null,
            kecamatan_id: formData.is_konsultan
                ? null
                : (formData.kecamatan_id === 0 ? null : formData.kecamatan_id),
            desa_id: formData.is_konsultan
                ? null
                : (formData.desa_id === 0 ? null : formData.desa_id),
            kegiatan_id: formData.kegiatan_id === 0 ? null : formData.kegiatan_id,
            pengawas_id: formData.pengawas_id === 0 ? null : formData.pengawas_id,
            pendamping_id: formData.pendamping_id === 0 ? null : formData.pendamping_id,
            tag_ids: selectedTags.map(tag => tag.id)
        };

        mutation.mutate(dataToSave);
    };

    /**
     * Controlled Select value as string id.
     * Always return string when set so Radix stays controlled and matches SelectItem values.
     */
    const selectValue = (val: number | undefined | null, allowZero = false): string | undefined => {
        if (allowZero) return String(val ?? 0);
        return val && val > 0 ? String(val) : undefined;
    };

    return (
        <PageContainer>
            <div className="w-full space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link to="/pekerjaan">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isEdit ? 'Edit Paket Pekerjaan' : 'Tambah Paket Baru'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isEdit ? 'Perbarui detail data teknis pekerjaan' : 'Input data awal untuk paket pekerjaan baru'}
                            </p>
                        </div>
                    </div>
                </div>

                {loadingPekerjaan ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-card rounded-xl border border-dashed border-muted">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-muted-foreground font-medium">Menyiapkan data teknis...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Main Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Info className="w-5 h-5" />
                                            <CardTitle className="text-lg">Informasi Umum</CardTitle>
                                        </div>
                                        <CardDescription>Detail identitas paket pekerjaan</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_paket" className="text-xs uppercase tracking-wider text-muted-foreground">Nama Paket Pekerjaan <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="nama_paket"
                                                name="nama_paket"
                                                className="h-12 text-lg font-medium"
                                                value={formData.nama_paket}
                                                onChange={handleChange}
                                                required
                                                placeholder="Contoh: Pembangunan Saluran Air Dusun A"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="kode_rekening" className="text-xs uppercase tracking-wider text-muted-foreground">Kode Rekening</Label>
                                                <Input
                                                    id="kode_rekening"
                                                    name="kode_rekening"
                                                    value={formData.kode_rekening}
                                                    onChange={handleChange}
                                                    placeholder="Contoh: 1.2.03.01"
                                                />
                                            </div>

                                            <div className="space-y-2 min-w-0">
                                                <Label htmlFor="kegiatan_id" className="text-xs uppercase tracking-wider text-muted-foreground">Sub Kegiatan <span className="text-red-500">*</span></Label>
                                                <Select
                                                    key={`kegiatan-${formData.kegiatan_id}-${kegiatanList.length}`}
                                                    value={selectValue(formData.kegiatan_id)}
                                                    onValueChange={(val) => handleSelectChange('kegiatan_id', val)}
                                                    disabled={mutation.isPending}
                                                >
                                                    <SelectTrigger className="h-10 w-full min-w-0">
                                                        <SelectValue placeholder="Pilih Sub Kegiatan" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-w-[min(100vw-2rem,36rem)]">
                                                        {kegiatanList.map((keg) => (
                                                            <SelectItem
                                                                key={keg.id}
                                                                value={String(keg.id)}
                                                                className="whitespace-normal"
                                                            >
                                                                {keg.nama_sub_kegiatan || `Sub kegiatan #${keg.id}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="is_konsultan"
                                                    checked={formData.is_konsultan}
                                                    onCheckedChange={(checked) => {
                                                        const isKonsultan = checked === true
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            is_konsultan: isKonsultan,
                                                            ...(isKonsultan
                                                                ? { kecamatan_id: 0, desa_id: 0 }
                                                                : {}),
                                                        }))
                                                    }}
                                                    disabled={mutation.isPending}
                                                />
                                                <div className="space-y-1">
                                                    <Label
                                                        htmlFor="is_konsultan"
                                                        className="text-sm font-semibold cursor-pointer"
                                                    >
                                                        Pekerjaan Konsultan
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Centang jika paket ini jasa konsultansi. Tidak perlu desa/kecamatan
                                                        dan tidak ditampilkan di Progress Fisik PUSPEN.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {!formData.is_konsultan ? (
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <MapPin className="w-5 h-5" />
                                            <CardTitle className="text-lg">Lokasi Pekerjaan</CardTitle>
                                        </div>
                                        <CardDescription>Tentukan wilayah administratif pekerjaan</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 min-w-0">
                                            <Label htmlFor="kecamatan_id" className="text-xs uppercase tracking-wider text-muted-foreground">Kecamatan <span className="text-red-500">*</span></Label>
                                            <Select
                                                key={`kecamatan-${formData.kecamatan_id}-${kecamatanList.length}`}
                                                value={selectValue(formData.kecamatan_id)}
                                                onValueChange={(val) => handleSelectChange('kecamatan_id', val)}
                                                disabled={mutation.isPending}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Kecamatan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {kecamatanList.map((kec) => (
                                                        <SelectItem key={kec.id} value={String(kec.id)}>
                                                            {getKecamatanName(kec) || `Kecamatan #${kec.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 min-w-0">
                                            <Label htmlFor="desa_id" className="text-xs uppercase tracking-wider text-muted-foreground">Desa / Kelurahan <span className="text-red-500">*</span></Label>
                                            <Select
                                                key={`desa-${formData.desa_id}-${desaList.length}-${formData.kecamatan_id}`}
                                                value={selectValue(formData.desa_id)}
                                                onValueChange={(val) => handleSelectChange('desa_id', val)}
                                                disabled={mutation.isPending || !formData.kecamatan_id || loadingDesa}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            !formData.kecamatan_id
                                                                ? 'Pilih kecamatan dulu'
                                                                : loadingDesa
                                                                  ? 'Memuat desa...'
                                                                  : 'Pilih Desa'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {desaList.map((desa) => (
                                                        <SelectItem key={desa.id} value={String(desa.id)}>
                                                            {getDesaName(desa) || `Desa #${desa.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                                ) : (
                                <Card className="shadow-sm border-dashed">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <MapPin className="w-5 h-5" />
                                            <CardTitle className="text-lg">Lokasi Pekerjaan</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Tidak diperlukan untuk pekerjaan konsultan.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                                )}

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Users className="w-5 h-5" />
                                            <CardTitle className="text-lg">Personil Pengawasan</CardTitle>
                                        </div>
                                        <CardDescription>Penugasan staff pengawas dan pendamping (Opsional)</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="pengawas_id" className="text-xs uppercase tracking-wider text-muted-foreground flex justify-between">
                                                Pengawas 
                                                <span className="text-[10px] text-muted-foreground lowercase italic">Optional</span>
                                            </Label>
                                            <Select
                                                key={`pengawas-${formData.pengawas_id}-${pengawasList.length}`}
                                                value={selectValue(formData.pengawas_id, true)}
                                                onValueChange={(val) => handleSelectChange('pengawas_id', val)}
                                                disabled={mutation.isPending}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Pengawas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0" className="text-muted-foreground italic">Belum ditentukan</SelectItem>
                                                    <SelectSeparator className="my-1" />
                                                    {pengawasList.map((p) => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pendamping_id" className="text-xs uppercase tracking-wider text-muted-foreground flex justify-between">
                                                Pendamping
                                                <span className="text-[10px] text-muted-foreground lowercase italic">Optional</span>
                                            </Label>
                                            <Select
                                                key={`pendamping-${formData.pendamping_id}-${pengawasList.length}`}
                                                value={selectValue(formData.pendamping_id, true)}
                                                onValueChange={(val) => handleSelectChange('pendamping_id', val)}
                                                disabled={mutation.isPending}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Pendamping" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0" className="text-muted-foreground italic">Belum ditentukan</SelectItem>
                                                    <SelectSeparator className="my-1" />
                                                    {pengawasList.map((p) => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Financials & Tags */}
                            <div className="space-y-8">
                                <Card className="shadow-sm border-t-4 border-t-primary">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Wallet className="w-5 h-5" />
                                            <CardTitle className="text-lg">Anggaran</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="pagu" className="text-xs uppercase tracking-wider text-muted-foreground">Pagu Anggaran <span className="text-red-500">*</span></Label>
                                            <CurrencyInput
                                                id="pagu"
                                                name="pagu"
                                                value={formData.pagu}
                                                onChange={handleNumberChange}
                                                required
                                                className="text-xl font-bold h-12"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Boleh diisi 0 (misalnya paket belum beranggaran atau dibatalkan).
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Briefcase className="w-5 h-5" />
                                            <CardTitle className="text-lg">Status paket</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Tandai dibatalkan jika paket tidak dilanjutkan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                                            Status
                                        </Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => handleSelectChange('status', val)}
                                            disabled={mutation.isPending}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="canceled">Dibatalkan (canceled)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formData.status === 'canceled' ? (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400">
                                                Paket dibatalkan akan ditandai di daftar pekerjaan.
                                            </p>
                                        ) : null}
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <StickyNote className="w-5 h-5" />
                                            <CardTitle className="text-lg">Catatan</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Keterangan internal (alasan batal, follow-up, dll.)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            id="catatan"
                                            name="catatan"
                                            value={formData.catatan}
                                            onChange={handleChange}
                                            disabled={mutation.isPending}
                                            rows={4}
                                            placeholder="Tulis catatan di sini…"
                                            className="resize-y min-h-[96px]"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <TagIcon className="w-5 h-5" />
                                            <CardTitle className="text-lg">Klasifikasi</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Label / Tags</Label>
                                            <TagInput
                                                selectedTags={selectedTags}
                                                onTagsChange={setSelectedTags}
                                                disabled={mutation.isPending}
                                            />
                                            <p className="text-[10px] text-muted-foreground italic mt-2">
                                                Gunakan tag untuk memudahkan pencarian dan pengelompokan data
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Briefcase className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm">Simpan paket</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Kontrak, foto, dan progress dapat diisi setelah paket disimpan.
                                                Paket tanpa kontrak ditandai &quot;Belum berkontrak&quot; di daftar.
                                            </p>
                                        </div>
                                    </div>
                                    <Separator className="bg-primary/10" />
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            type="submit" 
                                            disabled={mutation.isPending}
                                            className="w-full h-12 text-md font-bold shadow-lg"
                                        >
                                            {mutation.isPending ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-5 w-5" />
                                            )}
                                            {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Paket Sekarang'}
                                        </Button>
                                        <Button variant="ghost" type="button" className="w-full text-muted-foreground" asChild>
                                            <Link to="/pekerjaan">Batalkan</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </PageContainer>
    );
}
