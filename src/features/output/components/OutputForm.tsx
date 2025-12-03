import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { createOutput, getOutputById, updateOutput } from '../api/output';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { Checkbox } from '@/components/ui/checkbox';

export default function OutputForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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
                const response = await getPekerjaan();
                setPekerjaanList(response.data);

                // Auto-select pekerjaan from URL parameter if present and not in edit mode
                const pekerjaanIdParam = searchParams.get('pekerjaan_id');
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
                    navigate('/output');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.pekerjaan_id) {
            toast.error('Silakan pilih pekerjaan');
            return;
        }

        setLoading(true);

        try {
            if (isEdit && id) {
                await updateOutput(parseInt(id), formData);
                toast.success('Output berhasil diperbarui');
            } else {
                await createOutput(formData);
                toast.success('Output berhasil ditambahkan');
            }
            navigate('/output');
        } catch (error) {
            console.error('Failed to save output:', error);
            toast.error('Gagal menyimpan output');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/output">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
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
                                <Select
                                    value={formData.pekerjaan_id ? formData.pekerjaan_id.toString() : ''}
                                    onValueChange={(val) => handleSelectChange('pekerjaan_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Pekerjaan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pekerjaanList.map((pek) => (
                                            <SelectItem key={pek.id} value={pek.id.toString()}>
                                                {pek.nama_paket}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    Penerima adalah optional
                                </Label>
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/output">Batal</Link>
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
