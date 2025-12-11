import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { createPenerima, updatePenerima, getPenerima } from '../api';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Checkbox } from "@/components/ui/checkbox";

export default function PenerimaForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        pekerjaan_id: 0,
        nama: '',
        jumlah_jiwa: 0,
        nik: '',
        alamat: '',
        is_komunal: false,
    });
    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPekerjaan = async () => {
            try {
                const response = await getPekerjaan({ per_page: -1 });
                setPekerjaanList(response.data);

                // Auto-select pekerjaan from URL parameter if present and not in edit mode
                // @ts-ignore
                const pekerjaanIdParam = searchParams.pekerjaan_id;
                if (pekerjaanIdParam && !isEdit) {
                    setFormData(prev => ({
                        ...prev,
                        pekerjaan_id: parseInt(pekerjaanIdParam)
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch pekerjaan:', error);
                toast.error('Gagal memuat data pekerjaan');
            }
        };
        fetchPekerjaan();
    }, [searchParams, isEdit]);

    useEffect(() => {
        if (isEdit && id) {
            const fetchPenerima = async () => {
                try {
                    setLoading(true);
                    const response = await getPenerima(parseInt(id));
                    setFormData({
                        pekerjaan_id: response.data.pekerjaan_id,
                        nama: response.data.nama,
                        jumlah_jiwa: response.data.jumlah_jiwa,
                        nik: response.data.nik || '',
                        alamat: response.data.alamat || '',
                        is_komunal: response.data.is_komunal,
                    });
                } catch (error) {
                    console.error('Failed to fetch penerima:', error);
                    toast.error('Gagal memuat data penerima');
                    navigate({ to: '..' });
                } finally {
                    setLoading(false);
                }
            };
            fetchPenerima();
        }
    }, [isEdit, id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'jumlah_jiwa' ? parseInt(value) || 0 : value,
        }));
    };

    const handlePekerjaanChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            pekerjaan_id: parseInt(value),
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            is_komunal: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.pekerjaan_id) {
            toast.error('Silakan pilih pekerjaan');
            return;
        }

        setLoading(true);

        try {
            if (isEdit && id) {
                await updatePenerima({ id: parseInt(id), data: formData });
                toast.success('Penerima berhasil diperbarui');
            } else {
                await createPenerima(formData);
                toast.success('Penerima berhasil ditambahkan');
            }
            navigate({ to: '..' });
        } catch (error) {
            console.error('Failed to save penerima:', error);
            toast.error('Gagal menyimpan penerima');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Penerima' : 'Tambah Penerima Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Penerima</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pekerjaan_id">Pekerjaan</Label>
                                <SearchableSelect
                                    options={pekerjaanList.map((job) => ({
                                        value: job.id.toString(),
                                        label: job.nama_paket,
                                    }))}
                                    value={formData.pekerjaan_id ? formData.pekerjaan_id.toString() : ''}
                                    onValueChange={handlePekerjaanChange}
                                    placeholder="Pilih Pekerjaan"
                                    searchPlaceholder="Cari pekerjaan..."
                                    emptyMessage="Pekerjaan tidak ditemukan."
                                    // @ts-ignore
                                    disabled={!!searchParams.pekerjaan_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Penerima</Label>
                                <Input
                                    id="nama"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nama Lengkap"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nik">NIK</Label>
                                <Input
                                    id="nik"
                                    name="nik"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    placeholder="Nomor Induk Kependudukan"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Input
                                    id="alamat"
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleChange}
                                    placeholder="Alamat Lengkap"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_jiwa">Jumlah Jiwa</Label>
                                    <Input
                                        id="jumlah_jiwa"
                                        name="jumlah_jiwa"
                                        type="number"
                                        min="1"
                                        value={formData.jumlah_jiwa}
                                        onChange={handleChange}
                                        required
                                        placeholder="1"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox
                                        id="is_komunal"
                                        checked={formData.is_komunal}
                                        onCheckedChange={handleCheckboxChange}
                                    />
                                    <Label htmlFor="is_komunal">Komunal</Label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                    Batal
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
