import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useDesaDetail, useCreateDesa, useUpdateDesa } from '../hooks/useDesa';
import { useKecamatanList } from '@/features/kecamatan/hooks/useKecamatan';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { FormPageLayout } from '@/components/shared/FormPageLayout';
import { FormActions } from '@/components/shared/FormActions';

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

    const { data: kecamatanRes, isError: isKecamatanError } = useKecamatanList();
    const kecamatanList = kecamatanRes?.data || [];

    const { data: desaRes, isLoading: loadingDetail, isError: isDesaError } = useDesaDetail(parseInt(id || '0'), isEdit && !!id);
    const createMutation = useCreateDesa();
    const updateMutation = useUpdateDesa();

    useEffect(() => {
        if (!isEdit || !desaRes) return;

        const data = (desaRes as { data: { nama_desa: string; luas: number; jumlah_penduduk: number; kecamatan_id: number } }).data;
        setFormData({
            nama_desa: data.nama_desa,
            luas: data.luas,
            jumlah_penduduk: data.jumlah_penduduk,
            kecamatan_id: data.kecamatan_id,
        });
    }, [isEdit, desaRes]);

    useEffect(() => {
        if (isKecamatanError) {
            toast.error('Gagal memuat data kecamatan');
        }
    }, [isKecamatanError]);

    useEffect(() => {
        if (isDesaError) {
            toast.error('Gagal memuat data desa');
            navigate({ to: '/desa' });
        }
    }, [isDesaError, navigate]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kecamatan_id) {
            toast.error('Silakan pilih kecamatan');
            return;
        }

        const payload = {
            nama_desa: formData.nama_desa,
            luas: formData.luas,
            jumlah_penduduk: formData.jumlah_penduduk,
            kecamatan_id: formData.kecamatan_id,
        };

        if (isEdit && id) {
            updateMutation.mutate(
                { id: parseInt(id), data: payload },
                { onSuccess: () => navigate({ to: '/desa' }) },
            );
            return;
        }

        createMutation.mutate(payload, {
            onSuccess: () => navigate({ to: '/desa' }),
        });
    };

    return (
        <FormPageLayout
            backTo="/desa"
            title={isEdit ? 'Edit Desa' : 'Tambah Desa Baru'}
            cardTitle="Form Desa"
            isLoadingDetail={isEdit && loadingDetail}
            loadingMessage="Memuat data desa..."
        >
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

                <FormActions cancelTo="/desa" isSubmitting={isSubmitting} />
            </form>
        </FormPageLayout>
    );
}