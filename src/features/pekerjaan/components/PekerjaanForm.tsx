import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createPekerjaan, getPekerjaanById, updatePekerjaan } from '../api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import { getDesaByKecamatan } from '@/features/desa/api/desa';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
import { getPengawas } from '@/features/pengawas/api/pengawas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Info, MapPin, Users, Wallet, Tag as TagIcon, Briefcase } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import TagInput from './TagInput';
import type { Tag } from '../types';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Separator } from '@/components/ui/separator';

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
        kecamatan_id: 0,
        desa_id: 0,
        kegiatan_id: 0,
        pengawas_id: 0,
        pendamping_id: 0,
    });
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    // Queries
    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
    });
    const kecamatanList = kecamatanRes?.data || [];

    const { data: kegiatanRes } = useQuery({
        queryKey: ['kegiatan', { tahun: tahunAnggaran }],
        queryFn: () => getKegiatan({ tahun: tahunAnggaran }),
        enabled: !!tahunAnggaran,
    });
    const kegiatanList = kegiatanRes?.data || [];

    const { data: pengawasRes } = useQuery({
        queryKey: ['pengawas'],
        queryFn: () => getPengawas(),
    });
    const pengawasList = pengawasRes?.data || [];

    const { data: pekerjaanRes, isLoading: loadingPekerjaan } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => {
            const response = await getPekerjaanById(Number(id)) as any;
            return response.data?.data || response.data || response;
        },
        enabled: isEdit && !!id && !isNaN(Number(id)),
    });

    const { data: desaRes } = useQuery({
        queryKey: ['desa', formData.kecamatan_id],
        queryFn: () => getDesaByKecamatan(formData.kecamatan_id),
        enabled: !!formData.kecamatan_id,
    });
    const desaList = desaRes?.data || [];

    // Sync form data
    useEffect(() => {
        if (pekerjaanRes) {
            const data = pekerjaanRes;
            setFormData({
                kode_rekening: data.kode_rekening || '',
                nama_paket: data.nama_paket || '',
                pagu: Number(data.pagu) || 0,
                kecamatan_id: Number(data.kecamatan_id || data.kecamatan?.id) || 0,
                desa_id: Number(data.desa_id || data.desa?.id) || 0,
                kegiatan_id: Number(data.kegiatan_id || data.kegiatan?.id) || 0,
                pengawas_id: Number(data.pengawas_id || data.pengawas?.id) || 0,
                pendamping_id: Number(data.pendamping_id || data.pendamping?.id) || 0,
            });
            setSelectedTags(data.tags || []);
        }
    }, [pekerjaanRes]);

    // Ensure dependent fields are re-synced once lists are loaded
    useEffect(() => {
        if (!isEdit || !pekerjaanRes) return;

        const data = pekerjaanRes;
        
        // Sync Desa when list arrives
        if (desaList.length > 0) {
            const remoteId = Number(data.desa_id || data.desa?.id);
            if (remoteId && formData.desa_id !== remoteId) {
                setFormData(prev => ({ ...prev, desa_id: remoteId }));
            }
        }

        // Sync Kegiatan when list arrives
        if (kegiatanList.length > 0) {
            const remoteId = Number(data.kegiatan_id || data.kegiatan?.id);
            if (remoteId && formData.kegiatan_id !== remoteId) {
                setFormData(prev => ({ ...prev, kegiatan_id: remoteId }));
            }
        }

        // Sync Kecamatan when list arrives
        if (kecamatanList.length > 0) {
            const remoteId = Number(data.kecamatan_id || data.kecamatan?.id);
            if (remoteId && formData.kecamatan_id !== remoteId) {
                setFormData(prev => ({ ...prev, kecamatan_id: remoteId }));
            }
        }

        // Sync Pengawas when list arrives
        if (pengawasList.length > 0) {
            const remotePengawasId = Number(data.pengawas_id || data.pengawas?.id);
            const remotePendampingId = Number(data.pendamping_id || data.pendamping?.id);
            
            if (remotePengawasId && formData.pengawas_id !== remotePengawasId) {
                setFormData(prev => ({ ...prev, pengawas_id: remotePengawasId }));
            }
            if (remotePendampingId && formData.pendamping_id !== remotePendampingId) {
                setFormData(prev => ({ ...prev, pendamping_id: remotePendampingId }));
            }
        }
    }, [desaList, kegiatanList, kecamatanList, pengawasList, isEdit, pekerjaanRes]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'pagu' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
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

        if (!formData.nama_paket || !formData.pagu || !formData.kecamatan_id || !formData.desa_id) {
            toast.error('Harap isi semua field yang wajib');
            return;
        }

        const dataToSave = {
            ...formData,
            pengawas_id: formData.pengawas_id === 0 ? null : formData.pengawas_id,
            pendamping_id: formData.pendamping_id === 0 ? null : formData.pendamping_id,
            tag_ids: selectedTags.map(tag => tag.id)
        };

        mutation.mutate(dataToSave);
    };

    // Helper for Select values to avoid binding issues
    const getSelectValue = (val: number | undefined | null) => {
        return (val ?? 0).toString();
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

                                            <div className="space-y-2">
                                                <Label htmlFor="kegiatan_id" className="text-xs uppercase tracking-wider text-muted-foreground">Sub Kegiatan <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={getSelectValue(formData.kegiatan_id)}
                                                    onValueChange={(val) => handleSelectChange('kegiatan_id', val)}
                                                >
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Pilih Sub Kegiatan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {kegiatanList.map((keg) => (
                                                            <SelectItem key={keg.id} value={keg.id.toString()}>
                                                                {keg.nama_sub_kegiatan}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <MapPin className="w-5 h-5" />
                                            <CardTitle className="text-lg">Lokasi Pekerjaan</CardTitle>
                                        </div>
                                        <CardDescription>Tentukan wilayah administratif pekerjaan</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="kecamatan_id" className="text-xs uppercase tracking-wider text-muted-foreground">Kecamatan <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={getSelectValue(formData.kecamatan_id)}
                                                onValueChange={(val) => handleSelectChange('kecamatan_id', val)}
                                                disabled={mutation.isPending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Kecamatan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {kecamatanList.map((kec) => (
                                                        <SelectItem key={kec.id} value={kec.id.toString()}>
                                                            {kec.nama_kecamatan}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="desa_id" className="text-xs uppercase tracking-wider text-muted-foreground">Desa / Kelurahan <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={getSelectValue(formData.desa_id)}
                                                onValueChange={(val) => handleSelectChange('desa_id', val)}
                                                disabled={mutation.isPending || !formData.kecamatan_id}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Desa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {desaList.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground">
                                                            {formData.kecamatan_id ? 'Memuat desa...' : 'Pilih kecamatan dulu'}
                                                        </div>
                                                    ) : (
                                                        desaList.map((desa) => (
                                                            <SelectItem key={desa.id} value={desa.id.toString()}>
                                                                {desa.nama_desa}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

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
                                                value={getSelectValue(formData.pengawas_id)}
                                                onValueChange={(val) => handleSelectChange('pengawas_id', val)}
                                                disabled={mutation.isPending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Pengawas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0" className="text-muted-foreground italic">Belum ditentukan</SelectItem>
                                                    <Separator className="my-1" />
                                                    {pengawasList.map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
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
                                                value={getSelectValue(formData.pendamping_id)}
                                                onValueChange={(val) => handleSelectChange('pendamping_id', val)}
                                                disabled={mutation.isPending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Pendamping" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0" className="text-muted-foreground italic">Belum ditentukan</SelectItem>
                                                    <Separator className="my-1" />
                                                    {pengawasList.map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
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
                                        </div>
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
                                            <h4 className="font-semibold text-sm">Status Draft</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Data teknis kontrak, foto pekerjaan, dan progress dapat diinput setelah paket pekerjaan ini disimpan.
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
