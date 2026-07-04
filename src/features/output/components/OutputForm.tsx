import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { createOutput, updateOutput } from '../api/output';
import { useOutputDetail } from '../hooks/useOutput';
import { usePekerjaanList } from '@/features/pekerjaan/hooks/usePekerjaan';
import type { Output } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';

export default function OutputForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as { pekerjaan_id?: string | number };
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        pekerjaan_id: 0,
        komponen: '',
        satuan: '',
        volume: 0,
        penerima_is_optional: false,
    });
    const { data: pekerjaanRes, isError: pekerjaanError } = usePekerjaanList({ per_page: -1 });
    const pekerjaanList = pekerjaanRes?.data ?? [];

    const { data: outputRes, isLoading: loadingDetail, isError: outputError } = useOutputDetail(parseInt(id || '0'), isEdit && !!id);

    useEffect(() => {
        const pekerjaanIdParam = searchParams.pekerjaan_id;
        if (pekerjaanIdParam && !isEdit) {
            setFormData(prev => ({
                ...prev,
                pekerjaan_id: Number(pekerjaanIdParam)
            }));
        }
    }, [searchParams, isEdit]);

    useEffect(() => {
        if (pekerjaanError) {
            console.error('Failed to fetch pekerjaan');
            toast.error('Gagal memuat data pekerjaan');
        }
    }, [pekerjaanError]);

    useEffect(() => {
        if (!isEdit || !outputRes) return;

        const response = outputRes as { data: Output };
        setFormData({
            pekerjaan_id: response.data.pekerjaan_id,
            komponen: response.data.komponen,
            satuan: response.data.satuan,
            volume: response.data.volume,
            penerima_is_optional: response.data.penerima_is_optional,
        });
    }, [isEdit, outputRes]);

    useEffect(() => {
        if (outputError) {
            console.error('Failed to fetch output');
            toast.error('Gagal memuat data output');
            navigate({ to: '..' });
        }
    }, [outputError, navigate]);

    const loading = isEdit && loadingDetail;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'volume' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: parseInt(value),
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            penerima_is_optional: checked,
        }));
    };

    const createMutation = useMutation({
        mutationKey: ['output', 'create'],
        mutationFn: createOutput,
        onSuccess: () => {
            toast.success('Output berhasil ditambahkan');
            navigate({ to: '..' });
        },
        onError: () => toast.error('Gagal menambahkan output')
    });

    const updateMutation = useMutation({
        mutationKey: ['output', 'update'],
        mutationFn: ({ id, data }: { id: number; data: typeof formData }) => updateOutput(id, data),
        onSuccess: () => {
            toast.success('Output berhasil diperbarui');
            navigate({ to: '..' });
        },
        onError: () => toast.error('Gagal memperbarui output')
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.pekerjaan_id) {
            toast.error('Silakan pilih pekerjaan');
            return;
        }

        if (isEdit && id) {
            updateMutation.mutate({ id: parseInt(id), data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <PageContainer>
            <div className="w-full space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Output' : 'Tambah Output Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pekerjaan_id">Pekerjaan *</Label>
                                <SearchableSelect
                                    options={pekerjaanList.map((pek) => ({
                                        value: pek.id.toString(),
                                        label: pek.nama_paket,
                                    }))}
                                    value={formData.pekerjaan_id ? formData.pekerjaan_id.toString() : ''}
                                    onValueChange={(val) => handleSelectChange('pekerjaan_id', val)}
                                    placeholder="Pilih Pekerjaan"
                                    searchPlaceholder="Cari pekerjaan..."
                                    emptyMessage="Pekerjaan tidak ditemukan."
                                    disabled={!!searchParams.pekerjaan_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="komponen">Komponen *</Label>
                                <Select
                                    value={formData.komponen}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, komponen: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih komponen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sambungan Rumah">Sambungan Rumah</SelectItem>
                                        <SelectItem value="MCK">MCK</SelectItem>
                                        <SelectItem value="MCK Individu">MCK Individu</SelectItem>
                                        <SelectItem value="MCK Komunal">MCK Komunal</SelectItem>
                                        <SelectItem value="Pipa">Pipa</SelectItem>
                                        <SelectItem value="Kran Umum">Kran Umum</SelectItem>
                                        <SelectItem value="Hidran Umum">Hidran Umum</SelectItem>
                                        <SelectItem value="Broncaptering">Broncaptering</SelectItem>
                                        <SelectItem value="Reservoir">Reservoir</SelectItem>
                                        <SelectItem value="Tangki Septik Individu">Tangki Septik Individu</SelectItem>
                                        <SelectItem value="Tangki Septik Komunal">Tangki Septik Komunal</SelectItem>
                                        <SelectItem value="Sumur Bor">Sumur Bor</SelectItem>
                                        <SelectItem value="Pompa">Pompa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="satuan">Satuan *</Label>
                                    <Select
                                        value={formData.satuan}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, satuan: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih satuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unit">Unit</SelectItem>
                                            <SelectItem value="Meter">Meter</SelectItem>
                                            <SelectItem value="Meter Persegi">Meter Persegi</SelectItem>
                                            <SelectItem value="Meter Kubik">Meter Kubik</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="volume">Volume *</Label>
                                    <Input
                                        id="volume"
                                        name="volume"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.volume}
                                        onChange={handleChange}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="penerima_is_optional"
                                    checked={formData.penerima_is_optional}
                                    onCheckedChange={handleCheckboxChange}
                                />
                                <Label
                                    htmlFor="penerima_is_optional"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Komponen Komunal
                                </Label>
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={loading || createMutation.isPending || updateMutation.isPending}>
                                    {(loading || createMutation.isPending || updateMutation.isPending) ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {(loading || createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
