import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useKecamatanDetail, useCreateKecamatan, useUpdateKecamatan } from '../hooks/useKecamatan';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FormPageLayout } from '@/components/shared/FormPageLayout';
import { FormActions } from '@/components/shared/FormActions';

export default function KecamatanForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        n_kec: '',
    });

    const { data: kecamatanRes, isLoading: loadingDetail, isError } = useKecamatanDetail(parseInt(id || '0'), isEdit && !!id);
    const createMutation = useCreateKecamatan();
    const updateMutation = useUpdateKecamatan();

    useEffect(() => {
        if (!isEdit || !kecamatanRes) return;

        const data = (kecamatanRes as { data: { nama_kecamatan: string } }).data;
        setFormData({ n_kec: data.nama_kecamatan });
    }, [isEdit, kecamatanRes]);

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data kecamatan');
            navigate({ to: '/kecamatan' });
        }
    }, [isError, navigate]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && id) {
            updateMutation.mutate(
                { id: parseInt(id), data: formData },
                { onSuccess: () => navigate({ to: '/kecamatan' }) },
            );
            return;
        }

        createMutation.mutate(formData, {
            onSuccess: () => navigate({ to: '/kecamatan' }),
        });
    };

    return (
        <FormPageLayout
            backTo="/kecamatan"
            title={isEdit ? 'Edit Kecamatan' : 'Tambah Kecamatan Baru'}
            cardTitle="Form Kecamatan"
            isLoadingDetail={isEdit && loadingDetail}
            loadingMessage="Memuat data kecamatan..."
        >
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

                <FormActions cancelTo="/kecamatan" isSubmitting={isSubmitting} />
            </form>
        </FormPageLayout>
    );
}