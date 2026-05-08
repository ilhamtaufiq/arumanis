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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import TagInput from './TagInput';
import type { Tag } from '../types';

export default function PekerjaanForm() {
    const queryClient = useQueryClient();
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;
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

    const { data: pekerjaanRes } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: () => getPekerjaanById(Number(id)),
        enabled: isEdit && !!id,
    });

    const { data: desaRes } = useQuery({
        queryKey: ['desa', formData.kecamatan_id],
        queryFn: () => getDesaByKecamatan(formData.kecamatan_id),
        enabled: !!formData.kecamatan_id,
    });
    const desaList = desaRes?.data || [];

    // Sync form data when pekerjaan is loaded
    useEffect(() => {
        if (pekerjaanRes?.data) {
            const data = pekerjaanRes.data;
            setFormData({
                kode_rekening: data.kode_rekening || '',
                nama_paket: data.nama_paket,
                pagu: data.pagu,
                kecamatan_id: data.kecamatan_id,
                desa_id: data.desa_id,
                kegiatan_id: data.kegiatan_id || 0,
                pengawas_id: data.pengawas_id || 0,
                pendamping_id: data.pendamping_id || 0,
            });
            setSelectedTags(data.tags || []);
        }
    }, [pekerjaanRes]);

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
            ...(name === 'kecamatan_id' ? { desa_id: 0 } : {}),
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
            tag_ids: selectedTags.map(tag => tag.id)
        };

        mutation.mutate(dataToSave);
    };

    return (
        <PageContainer>
            <div className="w-full space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/pekerjaan">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Pekerjaan' : 'Tambah Pekerjaan Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Pekerjaan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_paket">Nama Paket Pekerjaan</Label>
                                <Input
                                    id="nama_paket"
                                    name="nama_paket"
                                    value={formData.nama_paket}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Pembangunan Saluran Air"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kode_rekening">Kode Rekening</Label>
                                <Input
                                    id="kode_rekening"
                                    name="kode_rekening"
                                    value={formData.kode_rekening}
                                    onChange={handleChange}
                                    placeholder="Contoh: 1.2.03.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kegiatan_id">Kegiatan</Label>
                                <Select
                                    value={formData.kegiatan_id ? formData.kegiatan_id.toString() : ''}
                                    onValueChange={(val) => handleSelectChange('kegiatan_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kegiatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kegiatanList.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">Tidak ada kegiatan di tahun ini</div>
                                        ) : (
                                            kegiatanList.map((keg) => (
                                                <SelectItem key={keg.id} value={keg.id.toString()}>
                                                    {keg.nama_sub_kegiatan} ({keg.tahun_anggaran})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kecamatan_id">Kecamatan</Label>
                                    <Select
                                        value={formData.kecamatan_id ? formData.kecamatan_id.toString() : ''}
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
                                    <Label htmlFor="desa_id">Desa</Label>
                                    <Select
                                        value={formData.desa_id ? formData.desa_id.toString() : ''}
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pengawas_id">Pengawas</Label>
                                    <Select
                                        value={(formData.pengawas_id || 0).toString()}
                                        onValueChange={(val) => handleSelectChange('pengawas_id', val)}
                                        disabled={mutation.isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Pengawas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Tidak Ada</SelectItem>
                                            {pengawasList.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.nama} {p.nip ? `(NIP: ${p.nip})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pendamping_id">Pendamping</Label>
                                    <Select
                                        value={(formData.pendamping_id || 0).toString()}
                                        onValueChange={(val) => handleSelectChange('pendamping_id', val)}
                                        disabled={mutation.isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Pendamping" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Tidak Ada</SelectItem>
                                            {pengawasList.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.nama} {p.nip ? `(NIP: ${p.nip})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pagu">Pagu Anggaran (Rp)</Label>
                                <Input
                                    id="pagu"
                                    name="pagu"
                                    type="number"
                                    min="0"
                                    value={formData.pagu}
                                    onChange={handleChange}
                                    required
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <TagInput
                                    selectedTags={selectedTags}
                                    onTagsChange={setSelectedTags}
                                    disabled={mutation.isPending}
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/pekerjaan">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
