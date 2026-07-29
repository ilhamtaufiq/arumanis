import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-stores';
import { useCreateUsulanKegiatan, useUpdateUsulanKegiatan } from '../hooks/useUsulanKegiatan';
import { useKecamatanList } from '@/features/kecamatan/hooks/useKecamatan';
import { useDesaByKecamatan } from '@/features/desa/hooks/useDesa';
import type { UsulanKegiatan, UsulanKegiatanFormData } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, X, PlusCircle, Pencil, FileUp } from 'lucide-react';

interface UsulanKegiatanFormProps {
    initialData?: UsulanKegiatan | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function UsulanKegiatanForm({ initialData, onSuccess, onCancel }: UsulanKegiatanFormProps) {
    const { auth } = useAuthStore();
    const [formData, setFormData] = useState<UsulanKegiatanFormData>({
        sub_bidang: 'air minum',
        nama_pengusul: auth.user?.name || '',
        kecamatan_id: 0,
        desa_id: 0,
        perihal: '',
        ringkasan: '',
    });

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewName, setFilePreviewName] = useState<string | null>(null);
    const isEditing = !!initialData && !!initialData.id;

    // Fetch kecamatan options
    const { data: kecamatanData } = useKecamatanList();
    const kecamatans = kecamatanData?.data || [];

    // Fetch desa options based on kecamatan selection
    const { data: desaData, refetch: refetchDesa } = useDesaByKecamatan(formData.kecamatan_id, formData.kecamatan_id > 0);
    const desas = desaData?.data || [];

    const createMutation = useCreateUsulanKegiatan();
    const updateMutation = useUpdateUsulanKegiatan();

    useEffect(() => {
        if (initialData) {
            setFormData({
                sub_bidang: initialData.sub_bidang || 'air minum',
                nama_pengusul: initialData.nama_pengusul || '',
                kecamatan_id: initialData.kecamatan_id || 0,
                desa_id: initialData.desa_id || 0,
                perihal: initialData.perihal || '',
                ringkasan: initialData.ringkasan || '',
            });
            setFilePreviewName(initialData.dokumen_url ? 'Dokumen Terupload' : null);
        } else {
            resetForm();
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.kecamatan_id > 0) {
            refetchDesa();
        }
    }, [formData.kecamatan_id]);

    const resetForm = () => {
        setFormData({
            sub_bidang: 'air minum',
            nama_pengusul: auth.user?.name || '',
            kecamatan_id: 0,
            desa_id: 0,
            perihal: '',
            ringkasan: '',
        });
        setFile(null);
        setFilePreviewName(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFilePreviewName(selectedFile.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama_pengusul || !formData.kecamatan_id || !formData.desa_id || !formData.perihal || !formData.ringkasan) {
            toast.error('Silakan isi seluruh field wajib');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('sub_bidang', formData.sub_bidang);
        data.append('nama_pengusul', formData.nama_pengusul);
        data.append('kecamatan_id', formData.kecamatan_id.toString());
        data.append('desa_id', formData.desa_id.toString());
        data.append('perihal', formData.perihal);
        data.append('ringkasan', formData.ringkasan);
        if (file) {
            data.append('dokumen', file);
        }

        try {
            if (isEditing && initialData) {
                await updateMutation.mutateAsync({ id: initialData.id, data });
                toast.success('Usulan kegiatan berhasil diperbarui');
            } else {
                await createMutation.mutateAsync(data);
                toast.success('Usulan kegiatan berhasil diajukan');
            }
            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save usulan:', error);
            toast.error('Gagal menyimpan usulan kegiatan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={isEditing ? 'border-primary/50 shadow-md bg-primary/5 dark:bg-primary/10' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    {isEditing ? <Pencil className="w-5 h-5 text-primary" /> : <PlusCircle className="w-5 h-5 text-primary" />}
                    <CardTitle className="text-lg">
                        {isEditing ? 'Edit Usulan Kegiatan' : 'Ajukan Usulan Baru'}
                    </CardTitle>
                </div>
                <CardDescription>
                    Masukkan detail usulan kegiatan baru untuk sub bidang air minum atau sanitasi.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sub_bidang">Sub Bidang <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.sub_bidang}
                            onValueChange={(val: 'air minum' | 'sanitasi') => setFormData(prev => ({ ...prev, sub_bidang: val }))}
                        >
                            <SelectTrigger id="sub_bidang">
                                <SelectValue placeholder="Pilih Sub Bidang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="air minum">Air Minum</SelectItem>
                                <SelectItem value="sanitasi">Sanitasi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nama_pengusul">Nama Pengusul <span className="text-red-500">*</span></Label>
                        <Input
                            id="nama_pengusul"
                            value={formData.nama_pengusul}
                            onChange={(e) => setFormData(prev => ({ ...prev, nama_pengusul: e.target.value }))}
                            placeholder="Nama instansi atau perorangan"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="kecamatan">Kecamatan <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.kecamatan_id.toString()}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, kecamatan_id: parseInt(val), desa_id: 0 }))}
                            >
                                <SelectTrigger id="kecamatan">
                                    <SelectValue placeholder="Pilih Kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kecamatans.map((kec) => (
                                        <SelectItem key={kec.id} value={kec.id.toString()}>
                                            {kec.nama_kecamatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desa">Desa <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.desa_id.toString()}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, desa_id: parseInt(val) }))}
                                disabled={!formData.kecamatan_id}
                            >
                                <SelectTrigger id="desa">
                                    <SelectValue placeholder={formData.kecamatan_id ? "Pilih Desa" : "Pilih Kecamatan Dahulu"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {desas.map((desa) => (
                                        <SelectItem key={desa.id} value={desa.id.toString()}>
                                            {desa.nama_desa}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="perihal">Perihal / Judul Usulan <span className="text-red-500">*</span></Label>
                        <Input
                            id="perihal"
                            value={formData.perihal}
                            onChange={(e) => setFormData(prev => ({ ...prev, perihal: e.target.value }))}
                            placeholder="Misal: Pembangunan SPAM Jaringan Perpipaan"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ringkasan">Ringkasan Kegiatan <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="ringkasan"
                            value={formData.ringkasan}
                            onChange={(e) => setFormData(prev => ({ ...prev, ringkasan: e.target.value }))}
                            placeholder="Tuliskan latar belakang, tujuan, dan rincian usulan kegiatan..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dokumen">Upload Dokumen Usulan (PDF/Doc/Xls/Gambar)</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="dokumen"
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 border-dashed py-6"
                                onClick={() => document.getElementById('dokumen')?.click()}
                            >
                                <FileUp className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {filePreviewName ? filePreviewName : 'Pilih File (Max 10MB)'}
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                                <X className="w-4 h-4 mr-2" /> Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
                            {loading ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Simpan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
