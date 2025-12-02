import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createKegiatan, getKegiatanById, updateKegiatan } from '../api/kegiatan';
import type { Kegiatan } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function KegiatanForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<Kegiatan>>({
        nama_program: '',
        nama_kegiatan: '',
        nama_sub_kegiatan: '',
        tahun_anggaran: new Date().getFullYear().toString(),
        sumber_dana: '',
        pagu: 0,
        kode_rekening: [],
    });
    const [kodeRekeningInput, setKodeRekeningInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            const fetchKegiatan = async () => {
                try {
                    setLoading(true);
                    const response = await getKegiatanById(parseInt(id));
                    setFormData(response.data);
                    setKodeRekeningInput(response.data.kode_rekening ? response.data.kode_rekening.join(', ') : '');
                } catch (error) {
                    console.error('Failed to fetch kegiatan:', error);
                    toast.error('Gagal memuat data kegiatan');
                    navigate('/kegiatan');
                } finally {
                    setLoading(false);
                }
            };
            fetchKegiatan();
        }
    }, [isEdit, id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'pagu' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                kode_rekening: kodeRekeningInput.split(',').map((s) => s.trim()).filter(Boolean),
            } as Omit<Kegiatan, 'id' | 'created_at' | 'updated_at'>;

            if (isEdit && id) {
                await updateKegiatan(parseInt(id), payload);
                toast.success('Kegiatan berhasil diperbarui');
            } else {
                await createKegiatan(payload);
                toast.success('Kegiatan berhasil ditambahkan');
            }
            navigate('/kegiatan');
        } catch (error) {
            console.error('Failed to save kegiatan:', error);
            toast.error('Gagal menyimpan kegiatan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/kegiatan">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Form Kegiatan</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama_program">Nama Program</Label>
                            <Input
                                id="nama_program"
                                name="nama_program"
                                value={formData.nama_program}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Program Penunjang Urusan Pemerintahan Daerah"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nama_kegiatan">Nama Kegiatan</Label>
                            <Input
                                id="nama_kegiatan"
                                name="nama_kegiatan"
                                value={formData.nama_kegiatan}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Perencanaan, Penganggaran, dan Evaluasi Kinerja"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nama_sub_kegiatan">Nama Sub Kegiatan</Label>
                            <Input
                                id="nama_sub_kegiatan"
                                name="nama_sub_kegiatan"
                                value={formData.nama_sub_kegiatan}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Penyusunan Dokumen Perencanaan Perangkat Daerah"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tahun_anggaran">Tahun Anggaran</Label>
                                <Input
                                    id="tahun_anggaran"
                                    name="tahun_anggaran"
                                    type="number"
                                    value={formData.tahun_anggaran}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pagu">Pagu Anggaran</Label>
                                <Input
                                    id="pagu"
                                    name="pagu"
                                    type="number"
                                    value={formData.pagu}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sumber_dana">Sumber Dana</Label>
                            <Input
                                id="sumber_dana"
                                name="sumber_dana"
                                value={formData.sumber_dana}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: DAU"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kode_rekening">Kode Rekening (pisahkan dengan koma)</Label>
                            <Input
                                id="kode_rekening"
                                name="kode_rekening"
                                value={kodeRekeningInput}
                                onChange={(e) => setKodeRekeningInput(e.target.value)}
                                placeholder="Contoh: 5.1.02.01.01.0024, 5.1.02.01.01.0025"
                            />
                        </div>

                        <div className="pt-4 flex justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <Link to="/kegiatan">Batal</Link>
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
    );
}
