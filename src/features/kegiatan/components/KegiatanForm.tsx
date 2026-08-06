import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useKegiatanDetail, useCreateKegiatan, useUpdateKegiatan } from '../hooks/useKegiatan';
import { SUMBER_DANA_OPTIONS, type Kegiatan } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { FormPageLayout } from '@/components/shared/FormPageLayout';
import { FormActions } from '@/components/shared/FormActions';

const SUB_BIDANG_OPTIONS = ['Air Minum', 'Sanitasi'] as const;

export default function KegiatanForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<Kegiatan>>({
        nama_program: '',
        sub_bidang: '',
        nama_kegiatan: '',
        nama_sub_kegiatan: '',
        tahun_anggaran: new Date().getFullYear().toString(),
        sumber_dana: '',
        pagu: 0,
        kode_rekening: [],
        nama_pptk: '',
        nip_pptk: '',
    });
    const [kodeRekeningInput, setKodeRekeningInput] = useState('');

    const { data: kegiatanRes, isLoading: loadingDetail, isError } = useKegiatanDetail(parseInt(id || '0'), isEdit && !!id);
    const createMutation = useCreateKegiatan();
    const updateMutation = useUpdateKegiatan();

    // Normalisasi sebelum set ke state.
    // DB bisa menyimpan 'air minum'/'sanitasi' lowercase (enum usulan_kegiatan),
    // sementara Select memakai 'Air Minum'/'Sanitasi' — match case-insensitive.
    // pagu mungkin datang sebagai string (kolom decimal) — konversi Number.
    const normalizeKegiatanData = useCallback((data: Kegiatan): Partial<Kegiatan> => {
        const subRaw = (data.sub_bidang ?? '').trim();
        const subMatch = SUB_BIDANG_OPTIONS.find((o) => o.toLowerCase() === subRaw.toLowerCase());
        const pagu = Number(data.pagu);
        return {
            nama_program: data.nama_program ?? '',
            sub_bidang: subMatch ?? subRaw,
            nama_kegiatan: data.nama_kegiatan ?? '',
            nama_sub_kegiatan: data.nama_sub_kegiatan ?? '',
            tahun_anggaran: data.tahun_anggaran ?? new Date().getFullYear().toString(),
            sumber_dana: data.sumber_dana ?? '',
            pagu: Number.isFinite(pagu) ? pagu : 0,
            kode_rekening: Array.isArray(data.kode_rekening) ? data.kode_rekening : [],
            nama_pptk: data.nama_pptk ?? '',
            nip_pptk: data.nip_pptk ?? '',
        };
    }, []);

    useEffect(() => {
        if (!isEdit || !kegiatanRes) return;
        const data = (kegiatanRes as { data: Kegiatan }).data;
        setFormData(normalizeKegiatanData(data));
        setKodeRekeningInput(data.kode_rekening ? data.kode_rekening.join(', ') : '');
    }, [isEdit, kegiatanRes, normalizeKegiatanData]);

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data kegiatan');
            navigate({ to: '/kegiatan' });
        }
    }, [isError, navigate]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'pagu' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.sumber_dana || !SUMBER_DANA_OPTIONS.some((option) => option === formData.sumber_dana)) {
            toast.error('Silakan pilih sumber dana dari daftar');
            return;
        }

        const payload = {
            ...formData,
            kode_rekening: kodeRekeningInput.split(',').map((s) => s.trim()).filter(Boolean),
        } as Omit<Kegiatan, 'id' | 'created_at' | 'updated_at'>;

        if (isEdit && id) {
            updateMutation.mutate(
                { id: parseInt(id), data: payload },
                { onSuccess: () => navigate({ to: '/kegiatan' }) },
            );
            return;
        }

        createMutation.mutate(payload, {
            onSuccess: () => navigate({ to: '/kegiatan' }),
        });
    };

    return (
        <FormPageLayout
            backTo="/kegiatan"
            title={isEdit ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
            cardTitle="Form Kegiatan"
            isLoadingDetail={isEdit && loadingDetail}
            loadingMessage="Memuat data kegiatan..."
        >
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
                    <Label htmlFor="sub_bidang">Sub Bidang</Label>
                    <Select
                        value={formData.sub_bidang || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sub_bidang: value }))}
                    >
                        <SelectTrigger id="sub_bidang">
                            <SelectValue placeholder="Pilih Sub Bidang" />
                        </SelectTrigger>
                        <SelectContent>
                            {SUB_BIDANG_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                        <CurrencyInput
                            id="pagu"
                            name="pagu"
                            value={formData.pagu || 0}
                            onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sumber_dana">Sumber Dana</Label>
                    <Select
                        value={formData.sumber_dana || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sumber_dana: value }))}
                    >
                        <SelectTrigger id="sumber_dana">
                            <SelectValue placeholder="Pilih Sumber Dana" />
                        </SelectTrigger>
                        <SelectContent>
                            {SUMBER_DANA_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

                <div className="rounded-lg border p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold">Pejabat Pelaksana Teknis Kegiatan (PPTK)</h3>
                        <p className="text-xs text-muted-foreground">
                            Dipakai otomatis saat ekspor dokumen kontrak untuk pekerjaan di sub kegiatan ini.
                            Kosongkan untuk memakai nilai default dari Pengaturan Dokumen Kontrak.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nama_pptk">Nama PPTK</Label>
                            <Input
                                id="nama_pptk"
                                name="nama_pptk"
                                value={formData.nama_pptk || ''}
                                onChange={handleChange}
                                placeholder="Nama pejabat PPTK sub kegiatan"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nip_pptk">NIP PPTK</Label>
                            <Input
                                id="nip_pptk"
                                name="nip_pptk"
                                value={formData.nip_pptk || ''}
                                onChange={handleChange}
                                placeholder="NIP PPTK"
                            />
                        </div>
                    </div>
                </div>

                <FormActions cancelTo="/kegiatan" isSubmitting={isSubmitting} />
            </form>
        </FormPageLayout>
    );
}