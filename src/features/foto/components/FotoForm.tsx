import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { createFoto, updateFoto, getFoto } from '../api';
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
import { ArrowLeft, Save, Upload, MapPin } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';

export default function FotoForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = !!id;

    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [pekerjaanId, setPekerjaanId] = useState<string>('');
    const [keterangan, setKeterangan] = useState<string>('0%');
    const [koordinat, setKoordinat] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPekerjaan = async () => {
            try {
                const response = await getPekerjaan();
                setPekerjaanList(response.data);

                // Auto-select pekerjaan from URL parameter if present and not in edit mode
                const pekerjaanIdParam = searchParams.get('pekerjaan_id');
                if (pekerjaanIdParam && !isEdit) {
                    setPekerjaanId(pekerjaanIdParam);
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
            const fetchFoto = async () => {
                try {
                    setLoading(true);
                    const response = await getFoto(parseInt(id));
                    const data = response.data;
                    setPekerjaanId(data.pekerjaan_id.toString());
                    setKeterangan(data.keterangan);
                    setKoordinat(data.koordinat);
                    setPreviewUrl(data.foto_url);
                } catch (error) {
                    console.error('Failed to fetch foto:', error);
                    toast.error('Gagal memuat data foto');
                    navigate('/foto');
                } finally {
                    setLoading(false);
                }
            };
            fetchFoto();
        }
    }, [isEdit, id, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setKoordinat(`${latitude}, ${longitude}`);
                    toast.success('Lokasi berhasil didapatkan');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
                }
            );
        } else {
            toast.error('Browser tidak mendukung geolocation');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pekerjaanId) {
            toast.error('Silakan pilih pekerjaan');
            return;
        }

        if (!isEdit && !file) {
            toast.error('Silakan pilih foto');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId);
            formData.append('komponen_id', '0'); // Default 0 as per requirement/schema
            formData.append('keterangan', keterangan);
            formData.append('koordinat', koordinat);
            if (file) {
                formData.append('file', file);
            }

            if (isEdit && id) {
                await updateFoto({ id: parseInt(id), data: formData });
                toast.success('Foto berhasil diperbarui');
            } else {
                await createFoto(formData);
                toast.success('Foto berhasil ditambahkan');
            }
            navigate('/foto');
        } catch (error: any) {
            console.error('Failed to save foto:', error);
            const message = error.response?.data?.message || 'Gagal menyimpan foto';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/foto">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Foto' : 'Upload Foto Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Foto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pekerjaan_id">Pekerjaan</Label>
                                <Select
                                    value={pekerjaanId}
                                    onValueChange={setPekerjaanId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Pekerjaan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pekerjaanList.map((job) => (
                                            <SelectItem key={job.id} value={job.id.toString()}>
                                                {job.nama_paket}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Progress Fisik</Label>
                                <Select
                                    value={keterangan}
                                    onValueChange={setKeterangan}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Progress" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0%">0%</SelectItem>
                                        <SelectItem value="25%">25%</SelectItem>
                                        <SelectItem value="50%">50%</SelectItem>
                                        <SelectItem value="75%">75%</SelectItem>
                                        <SelectItem value="100%">100%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="koordinat">Koordinat</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="koordinat"
                                        value={koordinat}
                                        onChange={(e) => setKoordinat(e.target.value)}
                                        placeholder="-6.123456, 106.123456"
                                        required
                                    />
                                    <Button type="button" variant="outline" onClick={handleGetLocation}>
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Lokasi Saya
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">Foto</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="file"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    JPG, PNG (MAX. 5MB)
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            id="file"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link to="/foto">Batal</Link>
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
