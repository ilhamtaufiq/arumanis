import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createDesa, getDesaById, updateDesa } from '../api/desa';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import type { Kecamatan } from '@/features/kecamatan/types';
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

export default function DesaForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        nama_desa: '',
        luas: 0,
        jumlah_penduduk: 0,
        kecamatan_id: 0,
    });
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchKecamatan = async () => {
            try {
                const response = await getKecamatan();
                setKecamatanList(response.data);
            } catch (error) {
                console.error('Failed to fetch kecamatan:', error);
                toast.error('Gagal memuat data kecamatan');
            }
        };
        fetchKecamatan();
    }, []);

    useEffect(() => {
        if (isEdit && id) {
            const fetchDesa = async () => {
                try {
                    setLoading(true);
                    const response = await getDesaById(parseInt(id));
                    setFormData({
                        nama_desa: response.data.nama_desa,
                        luas: response.data.luas,
                        jumlah_penduduk: response.data.jumlah_penduduk,
                        kecamatan_id: response.data.kecamatan_id,
                    });
                } catch (error) {
                    console.error('Failed to fetch desa:', error);
                    toast.error('Gagal memuat data desa');
                    navigate({ to: '/desa' });
                } finally {
                    setLoading(false);
                }
            };
            fetchDesa();
        }
    }, [isEdit, id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'luas' || name === 'jumlah_penduduk' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleKecamatanChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            kecamatan_id: parseInt(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kecamatan_id) {
            toast.error('Silakan pilih kecamatan');
            return;
        }

        setLoading(true);

        try {
            if (isEdit && id) {
                await updateDesa(parseInt(id), formData);
                toast.success('Desa berhasil diperbarui');
            } else {
                await createDesa(formData);
                toast.success('Desa berhasil ditambahkan');
            }
            navigate({ to: '/desa' });
        } catch (error) {
            console.error('Failed to save desa:', error);
            toast.error('Gagal menyimpan desa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/desa">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Desa' : 'Tambah Desa Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Desa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_desa">Nama Desa</Label>
                                <Input
                                    id="nama_desa"
                                    name="nama_desa"
                                    value={formData.nama_desa}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Desa Sejahtera"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kecamatan_id">Kecamatan</Label>
                                <Select
                                    value={formData.kecamatan_id ? formData.kecamatan_id.toString() : ''}
                                    onValueChange={handleKecamatanChange}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="luas">Luas (Ha)</Label>
                                    <Input
                                        id="luas"
                                        name="luas"
                                        type="number"
                                        step="0.01"
                                        value={formData.luas}
                                        onChange={handleChange}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_penduduk">Jumlah Penduduk</Label>
                                    <Input
                                        id="jumlah_penduduk"
                                        name="jumlah_penduduk"
                                        type="number"
                                        value={formData.jumlah_penduduk}
                                        onChange={handleChange}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/desa">Batal</Link>
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
