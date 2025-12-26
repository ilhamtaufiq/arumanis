import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createPekerjaan, getPekerjaanById, updatePekerjaan } from '../api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import { getDesaByKecamatan } from '@/features/desa/api/desa';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
import type { Kecamatan } from '@/features/kecamatan/types';
import type { Desa } from '@/features/desa/types';
import type { Kegiatan } from '@/features/kegiatan/types';
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
import { ArrowLeft, Save } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function PekerjaanForm() {
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
    });
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [desaList, setDesaList] = useState<Desa[]>([]);
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch basic lists
                const [kecamatanRes, kegiatanRes] = await Promise.all([
                    getKecamatan(),
                    getKegiatan({ tahun: tahunAnggaran })
                ]);

                setKecamatanList(kecamatanRes.data);
                setKegiatanList(kegiatanRes.data);

                // If editing, fetch pekerjaan and its specific desa list
                if (isEdit && id) {
                    const pekerjaanRes = await getPekerjaanById(parseInt(id));
                    const data = pekerjaanRes.data;

                    // Fetch desa list for the kecamatan in the pekerjaan
                    if (data.kecamatan_id) {
                        const desaRes = await getDesaByKecamatan(data.kecamatan_id);
                        setDesaList(desaRes.data);
                    }

                    setFormData({
                        kode_rekening: data.kode_rekening || '',
                        nama_paket: data.nama_paket,
                        pagu: data.pagu,
                        kecamatan_id: data.kecamatan_id,
                        desa_id: data.desa_id,
                        kegiatan_id: data.kegiatan_id || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast.error('Gagal memuat data awal');
                if (isEdit) navigate({ to: '/pekerjaan' });
            } finally {
                setLoading(false);
            }
        };

        if (tahunAnggaran) {
            fetchInitialData();
        }
    }, [isEdit, id, navigate, tahunAnggaran]);

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
            // Reset desa if kecamatan changes
            ...(name === 'kecamatan_id' ? { desa_id: 0 } : {}),
        }));

        // Fetch desa list immediately when kecamatan changes
        if (name === 'kecamatan_id' && idValue) {
            getDesaByKecamatan(idValue).then(res => setDesaList(res.data));
        } else if (name === 'kecamatan_id') {
            setDesaList([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kecamatan_id || !formData.desa_id || !formData.kegiatan_id) {
            toast.error('Silakan lengkapi data (Kecamatan, Desa, & Kegiatan)');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                // Ensure IDs are valid or null
                kegiatan_id: formData.kegiatan_id || null,
            };

            if (isEdit && id) {
                await updatePekerjaan(parseInt(id), payload);
                toast.success('Pekerjaan berhasil diperbarui');
            } else {
                await createPekerjaan(payload);
                toast.success('Pekerjaan berhasil ditambahkan');
            }
            navigate({ to: '/pekerjaan' });
        } catch (error) {
            console.error('Failed to save pekerjaan:', error);
            toast.error('Gagal menyimpan pekerjaan');
        } finally {
            setLoading(false);
        }
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
                                        <SelectValue placeholder={loading ? "Memuat kegiatan..." : "Pilih Kegiatan"} />
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
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={loading ? "Memuat..." : "Pilih Kecamatan"} />
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
                                        disabled={loading || !formData.kecamatan_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={loading ? "Memuat..." : "Pilih Desa"} />
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

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/pekerjaan">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
