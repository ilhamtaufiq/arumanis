import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { createFoto, updateFoto, getFoto } from '../api';
import { getPekerjaan, getPekerjaanById } from '@/features/pekerjaan/api/pekerjaan';
import { getOutput } from '@/features/output/api/output';
import { getPenerimaList } from '@/features/penerima/api';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import type { Output } from '@/features/output/types';
import type { Penerima } from '@/features/penerima/types';
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, MapPin, CloudOff } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useUploadQueue } from '@/stores/upload-queue-store';
import { addPhotoWatermark } from '@/lib/image-utils';

export default function FotoForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;

    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [outputList, setOutputList] = useState<Output[]>([]);
    const [penerimaList, setPenerimaList] = useState<Penerima[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [pekerjaanId, setPekerjaanId] = useState<string>('');
    const [komponenId, setKomponenId] = useState<string>('');
    const [penerimaId, setPenerimaId] = useState<string>('');
    const [keterangan, setKeterangan] = useState<string>('0%');
    const [koordinat, setKoordinat] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const addToQueue = useUploadQueue(state => state.addToQueue);

    // Get selected output to check penerima_is_optional
    const selectedOutput = outputList.find(o => o.id.toString() === komponenId);
    const showPenerimaDropdown = selectedOutput && !selectedOutput.penerima_is_optional;

    useEffect(() => {
        const fetchPekerjaan = async () => {
            try {
                const response = await getPekerjaan({ per_page: -1 });
                let pekerjaanData = response.data;

                // Auto-select pekerjaan from URL parameter if present and not in edit mode
                // @ts-ignore
                const pekerjaanIdParam = searchParams.pekerjaan_id;
                if (pekerjaanIdParam && !isEdit) {
                    // Check if the pekerjaan exists in the list
                    const exists = pekerjaanData.some((p: Pekerjaan) => p.id.toString() === pekerjaanIdParam);
                    if (exists) {
                        setPekerjaanId(pekerjaanIdParam);
                    } else {
                        // Fetch the specific pekerjaan if not found in paginated list
                        try {
                            const specificPekerjaan = await getPekerjaanById(parseInt(pekerjaanIdParam));
                            // Add the specific pekerjaan to the list
                            pekerjaanData = [specificPekerjaan.data, ...pekerjaanData];
                            setPekerjaanId(pekerjaanIdParam);
                        } catch (err) {
                            console.error('Pekerjaan not found:', err);
                        }
                    }
                }

                setPekerjaanList(pekerjaanData);
            } catch (error) {
                console.error('Failed to fetch pekerjaan:', error);
                toast.error('Gagal memuat data pekerjaan');
            }
        };
        fetchPekerjaan();
    }, [searchParams, isEdit]);

    // Fetch output list when pekerjaan changes
    useEffect(() => {
        if (pekerjaanId) {
            const fetchOutput = async () => {
                try {
                    const response = await getOutput({ pekerjaan_id: parseInt(pekerjaanId) });
                    setOutputList(response.data);
                } catch (error) {
                    console.error('Failed to fetch output:', error);
                    toast.error('Gagal memuat data komponen');
                }
            };
            fetchOutput();
        } else {
            setOutputList([]);
            setKomponenId('');
        }
    }, [pekerjaanId]);

    // Fetch penerima list when pekerjaan changes
    useEffect(() => {
        if (pekerjaanId) {
            const fetchPenerima = async () => {
                try {
                    const response = await getPenerimaList({ pekerjaan_id: parseInt(pekerjaanId) });
                    setPenerimaList(response.data);
                } catch (error) {
                    console.error('Failed to fetch penerima:', error);
                    toast.error('Gagal memuat data penerima');
                }
            };
            fetchPenerima();
        } else {
            setPenerimaList([]);
            setPenerimaId('');
        }
    }, [pekerjaanId]);

    // Reset penerima when komponen changes and penerima is optional
    useEffect(() => {
        if (selectedOutput?.penerima_is_optional) {
            setPenerimaId('');
        }
    }, [komponenId, selectedOutput?.penerima_is_optional]);

    useEffect(() => {
        if (isEdit && id) {
            const fetchFoto = async () => {
                try {
                    setLoading(true);
                    const response = await getFoto(parseInt(id));
                    const data = response.data;
                    setPekerjaanId(data.pekerjaan_id.toString());
                    setKomponenId(data.komponen_id?.toString() || '');
                    setPenerimaId(data.penerima_id?.toString() || '');
                    setKeterangan(data.keterangan);
                    setKoordinat(data.koordinat);
                    setPreviewUrl(data.foto_url);
                } catch (error) {
                    console.error('Failed to fetch foto:', error);
                    toast.error('Gagal memuat data foto');
                    navigate({ to: '..' });
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

        if (!komponenId) {
            toast.error('Silakan pilih komponen');
            return;
        }

        // Validate penerima if required
        if (showPenerimaDropdown && !penerimaId) {
            toast.error('Silakan pilih penerima manfaat');
            return;
        }

        if (!isEdit && !file) {
            toast.error('Silakan pilih foto');
            return;
        }

        setLoading(true);

        try {
            let fileToUpload = file;

            // Apply Watermark if file exists and not editing
            if (file && !isEdit) {
                try {
                    const dateStr = new Date().toLocaleString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                    });
                    const coordStr = koordinat || 'Koordinat tidak tersedia';

                    const watermarkedBlob = await addPhotoWatermark(file, {
                        date: dateStr,
                        coordinates: coordStr
                    });

                    fileToUpload = new File([watermarkedBlob], file.name, { type: 'image/jpeg' });
                } catch (wmError) {
                    console.error('Watermark error:', wmError);
                    // Continue without watermark if it fails
                }
            }

            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId);
            formData.append('komponen_id', komponenId);
            formData.append('keterangan', keterangan);
            formData.append('koordinat', koordinat);
            if (penerimaId) {
                formData.append('penerima_id', penerimaId);
            }
            if (fileToUpload) {
                formData.append('file', fileToUpload);
            }

            if (isEdit && id) {
                await updateFoto({ id: parseInt(id), data: formData });
                toast.success('Foto berhasil diperbarui');
            } else {
                try {
                    await createFoto(formData);
                    toast.success('Foto berhasil ditambahkan');
                } catch (netError: any) {
                    // Check if it's a network error (offline)
                    if (!window.navigator.onLine || netError.message === 'Network Error' || netError.code === 'ERR_NETWORK') {
                        if (fileToUpload) {
                            addToQueue({
                                pekerjaanId: parseInt(pekerjaanId),
                                komponenId: parseInt(komponenId),
                                penerimaId: penerimaId ? parseInt(penerimaId) : null,
                                keterangan,
                                koordinat,
                                fileName: fileToUpload.name,
                                fileBlob: fileToUpload
                            });
                            toast.warning('Offline: Foto disimpan ke antrean upload', {
                                icon: <CloudOff className="h-4 w-4" />
                            });
                        }
                    } else {
                        throw netError;
                    }
                }
            }
            navigate({ to: '..' });
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
            <div className="w-full space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
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
                                <SearchableSelect
                                    options={pekerjaanList.map((job) => ({
                                        value: job.id.toString(),
                                        label: job.nama_paket,
                                    }))}
                                    value={pekerjaanId}
                                    onValueChange={setPekerjaanId}
                                    placeholder="Pilih Pekerjaan"
                                    searchPlaceholder="Cari pekerjaan..."
                                    emptyMessage="Pekerjaan tidak ditemukan."
                                    // @ts-ignore
                                    disabled={!!searchParams.pekerjaan_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="komponen_id">Komponen <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={outputList.map((output) => ({
                                        value: output.id.toString(),
                                        label: `${output.komponen} (${output.volume} ${output.satuan})`,
                                    }))}
                                    value={komponenId}
                                    onValueChange={setKomponenId}
                                    placeholder={!pekerjaanId ? "Pilih pekerjaan terlebih dahulu" : outputList.length === 0 ? "Tidak ada komponen tersedia" : "Pilih Komponen"}
                                    searchPlaceholder="Cari komponen..."
                                    emptyMessage="Komponen tidak ditemukan."
                                    disabled={!pekerjaanId || outputList.length === 0}
                                />
                            </div>

                            {showPenerimaDropdown && (
                                <div className="space-y-2">
                                    <Label htmlFor="penerima_id">Penerima Manfaat <span className="text-red-500">*</span></Label>
                                    <SearchableSelect
                                        options={penerimaList.map((penerima) => ({
                                            value: penerima.id.toString(),
                                            label: `${penerima.nama}${penerima.is_komunal ? ' (Komunal)' : ''}`,
                                        }))}
                                        value={penerimaId}
                                        onValueChange={setPenerimaId}
                                        placeholder={penerimaList.length === 0 ? "Tidak ada penerima tersedia" : "Pilih Penerima Manfaat"}
                                        searchPlaceholder="Cari penerima..."
                                        emptyMessage="Penerima tidak ditemukan."
                                        disabled={penerimaList.length === 0}
                                    />
                                </div>
                            )}

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
                                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                    Batal
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
