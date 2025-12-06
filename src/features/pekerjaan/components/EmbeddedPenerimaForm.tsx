import { useState } from 'react';
import { createPenerima } from '@/features/penerima/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

interface EmbeddedPenerimaFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
}

export default function EmbeddedPenerimaForm({ pekerjaanId, onSuccess }: EmbeddedPenerimaFormProps) {
    const [formData, setFormData] = useState({
        pekerjaan_id: pekerjaanId,
        nama: '',
        jumlah_jiwa: 1,
        nik: '',
        alamat: '',
        is_komunal: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'jumlah_jiwa' ? parseInt(value) || 0 : value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            is_komunal: checked,
        }));
    };

    const resetForm = () => {
        setFormData({
            pekerjaan_id: pekerjaanId,
            nama: '',
            jumlah_jiwa: 1,
            nik: '',
            alamat: '',
            is_komunal: false,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama) {
            toast.error('Silakan isi nama penerima');
            return;
        }

        setLoading(true);

        try {
            await createPenerima(formData);
            toast.success('Penerima berhasil ditambahkan');
            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save penerima:', error);
            toast.error('Gagal menyimpan penerima');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tambah Penerima Baru</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Penerima <span className="text-red-500">*</span></Label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jumlah_jiwa">Jumlah Jiwa <span className="text-red-500">*</span></Label>
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
                            <Label htmlFor="is_komunal">Komunal (untuk kelompok/masyarakat)</Label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : 'Simpan Penerima'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
