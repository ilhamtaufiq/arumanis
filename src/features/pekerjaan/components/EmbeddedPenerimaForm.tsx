import { useState, useEffect } from 'react';
import { createPenerima, updatePenerima } from '@/features/penerima/api';
import type { Penerima } from '@/features/penerima/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';

interface EmbeddedPenerimaFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
    initialData?: Penerima | null;
    onCancel?: () => void;
}

export default function EmbeddedPenerimaForm({ pekerjaanId, onSuccess, initialData, onCancel }: EmbeddedPenerimaFormProps) {
    const [formData, setFormData] = useState({
        pekerjaan_id: pekerjaanId,
        nama: '',
        jumlah_jiwa: 1,
        nik: '',
        alamat: '',
        is_komunal: false,
    });
    const [loading, setLoading] = useState(false);

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                pekerjaan_id: pekerjaanId,
                nama: initialData.nama,
                jumlah_jiwa: initialData.jumlah_jiwa,
                nik: initialData.nik || '',
                alamat: initialData.alamat || '',
                is_komunal: initialData.is_komunal,
            });
        } else {
            resetForm();
        }
    }, [initialData, pekerjaanId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'jumlah_jiwa' ? parseInt(value) || 0 : value,
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
            if (isEditing && initialData) {
                await updatePenerima({ id: initialData.id, data: formData });
                toast.success('Penerima berhasil diperbarui');
            } else {
                await createPenerima(formData);
                toast.success('Penerima berhasil ditambahkan');
            }
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
        <Card className={isEditing ? 'border-primary shadow-md' : ''}>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Penerima' : 'Tambah Penerima Baru'}</CardTitle>
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

                        {/* <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="is_komunal"
                                checked={formData.is_komunal}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <Label htmlFor="is_komunal">Komunal (untuk kelompok/masyarakat)</Label>
                        </div> */}
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : isEditing ? 'Update Penerima' : 'Simpan Penerima'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

