import { useQuery } from '@tanstack/react-query';
import { createFoto, updateFoto, getFoto } from '../api';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { getOutput } from '@/features/output/api/output';
import { getPenerimaList } from '@/features/penerima/api';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import type { Output } from '@/features/output/types';
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
import { ArrowLeft, Save, Upload, MapPin } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useUploadQueue } from '../../../stores/upload-queue-store';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';

export default function FotoForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;
    const addToQueue = useUploadQueue((state: any) => state.addToQueue);

    const [loading, setLoading] = useState(false);

    // Form states
    const [pekerjaanId, setPekerjaanId] = useState<string>('');
    const [komponenId, setKomponenId] = useState<string>('');
    const [penerimaId, setPenerimaId] = useState<string>('');
    const [keterangan, setKeterangan] = useState<string>('0%');
    const [koordinat, setKoordinat] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [unitIndex, setUnitIndex] = useState<string>('');

    // Fetch Pekerjaan List
    const { data: pekerjaanList = [] } = useQuery({
        queryKey: ['pekerjaan', { per_page: -1 }],
        queryFn: () => getPekerjaan({ per_page: -1 }).then(res => res.data),
    });

    // Fetch Output List
    const { data: outputList = [] } = useQuery({
        queryKey: ['output', { pekerjaan_id: pekerjaanId }],
        queryFn: () => getOutput({ pekerjaan_id: parseInt(pekerjaanId) }).then(res => res.data),
        enabled: !!pekerjaanId,
    });

    // Fetch Penerima List
    const { data: penerimaList = [] } = useQuery({
        queryKey: ['penerima', { pekerjaan_id: pekerjaanId }],
        queryFn: () => getPenerimaList({ pekerjaan_id: parseInt(pekerjaanId) }).then(res => res.data),
        enabled: !!pekerjaanId,
    });

    // Fetch Foto Data for Edit Mode
    const { data: fotoData } = useQuery({
        queryKey: ['foto', id],
        queryFn: () => getFoto(parseInt(id!)).then(res => res.data),
        enabled: isEdit && !!id,
    });

    // Sync form with fotoData in edit mode
    useEffect(() => {
        if (fotoData) {
            setPekerjaanId(fotoData.pekerjaan_id.toString());
            setKomponenId(fotoData.komponen_id?.toString() || '');
            setPenerimaId(fotoData.penerima_id?.toString() || '');
            setKeterangan(fotoData.keterangan);
            setKoordinat(fotoData.koordinat);
            setPreviewUrl(fotoData.foto_url);
        }
    }, [fotoData]);

    // Handle auto-selection from URL
    useEffect(() => {
        // @ts-ignore
        const pekerjaanIdParam = searchParams.pekerjaan_id;
        if (pekerjaanIdParam && !isEdit && pekerjaanList.length > 0) {
            const exists = pekerjaanList.some((p: Pekerjaan) => p.id.toString() === pekerjaanIdParam);
            if (exists) {
                setPekerjaanId(pekerjaanIdParam);
            }
        }
    }, [searchParams, isEdit, pekerjaanList]);

    // Get selected output to check penerima_is_optional
    const selectedOutput = outputList.find((o: Output) => o.id.toString() === komponenId);
    const showPenerimaDropdown = selectedOutput && !selectedOutput.penerima_is_optional;

    // Reset penerima and handle unit auto-selection from preFill
    useEffect(() => {
        if (selectedOutput?.penerima_is_optional) {
            setPenerimaId('');
            // @ts-ignore
            if (searchParams.unit_index) {
                // @ts-ignore
                setUnitIndex(searchParams.unit_index);
            }
        }
    }, [komponenId, selectedOutput?.penerima_is_optional, searchParams]);

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
            // Check if offline
            if (!navigator.onLine && !isEdit) {
                if (file) {
                    addToQueue({
                        pekerjaanId: parseInt(pekerjaanId),
                        komponenId: komponenId ? parseInt(komponenId) : null,
                        penerimaId: penerimaId ? parseInt(penerimaId) : null,
                        keterangan,
                        unit_index: unitIndex ? parseInt(unitIndex) : null,
                        koordinat,
                        fileName: file.name,
                        fileBlob: file
                    });
                    toast.success('Offline: Foto ditambahkan ke antrean upload');
                    navigate({ to: '..' });
                    return;
                }
            }

            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId);
            formData.append('komponen_id', komponenId);
            formData.append('keterangan', keterangan);
            if (unitIndex) {
                formData.append('unit_index', unitIndex);
            }
            formData.append('koordinat', koordinat);
            if (penerimaId) {
                formData.append('penerima_id', penerimaId);
            }
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
            navigate({ to: '..' });
        } catch (error: any) {
            console.error('Failed to save foto:', error);

            // Handle network error by queuing if not already done
            if (!isEdit && file && (error.message === 'Network Error' || !navigator.onLine)) {
                addToQueue({
                    pekerjaanId: parseInt(pekerjaanId),
                    komponenId: komponenId ? parseInt(komponenId) : null,
                    penerimaId: penerimaId ? parseInt(penerimaId) : null,
                    keterangan,
                    unit_index: unitIndex ? parseInt(unitIndex) : null,
                    koordinat,
                    fileName: file.name,
                    fileBlob: file
                });
                toast.success('Koneksi bermasalah: Foto ditambahkan ke antrean upload');
                navigate({ to: '..' });
                return;
            }

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

                            {selectedOutput?.penerima_is_optional && selectedOutput.volume > 1 && (
                                <div className="space-y-2">
                                    <Label htmlFor="unit_index">Nomor Unit <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={unitIndex}
                                        onValueChange={setUnitIndex}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Nomor Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: selectedOutput.volume }).map((_, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                    Unit {i + 1}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground italic">
                                        Pilih unit yang sedang didokumentasikan untuk komponen ini.
                                    </p>
                                </div>
                            )}

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
