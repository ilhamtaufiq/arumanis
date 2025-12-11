import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createKecamatan, getKecamatanById, updateKecamatan } from '../api/kecamatan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

export default function KecamatanForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        n_kec: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            const fetchKecamatan = async () => {
                try {
                    setLoading(true);
                    const response = await getKecamatanById(parseInt(id));
                    setFormData({ n_kec: response.data.nama_kecamatan });
                } catch (error) {
                    console.error('Failed to fetch kecamatan:', error);
                    toast.error('Gagal memuat data kecamatan');
                    navigate({ to: '/kecamatan' });
                } finally {
                    setLoading(false);
                }
            };
            fetchKecamatan();
        }
    }, [isEdit, id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && id) {
                await updateKecamatan(parseInt(id), formData);
                toast.success('Kecamatan berhasil diperbarui');
            } else {
                await createKecamatan(formData);
                toast.success('Kecamatan berhasil ditambahkan');
            }
            navigate({ to: '/kecamatan' });
        } catch (error) {
            console.error('Failed to save kecamatan:', error);
            toast.error('Gagal menyimpan kecamatan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/kecamatan">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Kecamatan' : 'Tambah Kecamatan Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Kecamatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="n_kec">Nama Kecamatan</Label>
                                <Input
                                    id="n_kec"
                                    name="n_kec"
                                    value={formData.n_kec}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Kecamatan Pusat"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/kecamatan">Batal</Link>
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
