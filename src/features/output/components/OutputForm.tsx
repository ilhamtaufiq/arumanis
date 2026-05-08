import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { getOutputById } from '../api/output';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        pekerjaan_id: 0,
        komponen: '',
        satuan: '',
        volume: 0,
        penerima_is_optional: false,
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
            const fetchOutput = async () => {
                try {
                    setLoading(true);
                    const response = await getOutputById(parseInt(id));
                    setFormData({
                        pekerjaan_id: response.data.pekerjaan_id,
                        komponen: response.data.komponen,
                        satuan: response.data.satuan,
                        volume: response.data.volume,
                        penerima_is_optional: response.data.penerima_is_optional,
                    });
                } catch (error) {
                    console.error('Failed to fetch output:', error);
                    toast.error('Gagal memuat data output');
                    navigate({ to: '..' });
                } finally {
                    setLoading(false);
                }
            };
            fetchOutput();
        }
    }, [isEdit, id, navigate]);

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

    const createMutation = useMutation<any, any, any>({
        mutationKey: ['output', 'create'],
        onSuccess: () => {
            toast.success('Output berhasil ditambahkan');
            navigate({ to: '..' });
        },
        onError: () => toast.error('Gagal menambahkan output')
    });

    const updateMutation = useMutation<any, any, { id: number, data: any }>({
        mutationKey: ['output', 'update'],
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
                                    // @ts-ignore
                                    disabled={!!searchParams.pekerjaan_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="komponen">Komponen *</Label>
                                <Input
                                    id="komponen"
                                    name="komponen"
                                    value={formData.komponen}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Pembangunan Jalan"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="satuan">Satuan *</Label>
                                    <Input
                                        id="satuan"
                                        name="satuan"
                                        value={formData.satuan}
                                        onChange={handleChange}
                                        required
                                        placeholder="Contoh: Meter"
                                    />
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
