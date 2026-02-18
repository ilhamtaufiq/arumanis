import { useEffect, useState } from 'react';
import { createFoto, updateFoto } from '@/features/foto/api';
import { getOutput } from '@/features/output/api/output';
import { getPenerimaList } from '@/features/penerima/api';
import type { Output } from '@/features/output/types';
import type { Penerima } from '@/features/penerima/types';
import type { Foto } from '@/features/foto/types';
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
import { Save, Upload, MapPin, Camera, AlertTriangle, CloudOff } from 'lucide-react';
import { getKecamatanGeoJson, validatePointInFeature } from '@/lib/geo-utils';
import { addPhotoWatermark } from '@/lib/image-utils';
import { useUploadQueue } from '@/stores/upload-queue-store';
import type { Pekerjaan } from '@/features/pekerjaan/types';

interface EmbeddedFotoFormProps {
    pekerjaanId: number;
    pekerjaan?: Pekerjaan;
    onSuccess?: () => void;
    foto?: Foto; // Optional prop for editing
    preFill?: {
        komponenId?: string;
        penerimaId?: string;
        keterangan?: string;
    };
}

export default function EmbeddedFotoForm({ pekerjaanId, pekerjaan, onSuccess, foto, preFill }: EmbeddedFotoFormProps) {
    const [outputList, setOutputList] = useState<Output[]>([]);
    const [penerimaList, setPenerimaList] = useState<Penerima[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [komponenId, setKomponenId] = useState<string>('');
    const [penerimaId, setPenerimaId] = useState<string>('');
    const [keterangan, setKeterangan] = useState<string>('0%');
    const [koordinat, setKoordinat] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [geoValidation, setGeoValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const addToQueue = useUploadQueue(state => state.addToQueue);

    const isEditMode = !!foto;

    // Initialize form with foto data if in edit mode
    useEffect(() => {
        if (foto) {
            setKomponenId(foto.komponen_id?.toString() || '');
            setPenerimaId(foto.penerima_id?.toString() || '');
            setKeterangan(foto.keterangan || '0%');
            setKoordinat(foto.koordinat || '');
            setPreviewUrl(foto.foto_url || null);
        } else if (preFill) {
            if (preFill.komponenId) setKomponenId(preFill.komponenId);
            if (preFill.penerimaId) setPenerimaId(preFill.penerimaId);
            if (preFill.keterangan) setKeterangan(preFill.keterangan);
        }
    }, [foto, preFill]);

    // Get selected output to check penerima_is_optional
    const selectedOutput = outputList.find(o => o.id.toString() === komponenId);
    const showPenerimaDropdown = selectedOutput && !selectedOutput.penerima_is_optional;

    // Fetch output list
    useEffect(() => {
        const fetchOutput = async () => {
            try {
                const response = await getOutput({
                    pekerjaan_id: pekerjaanId,
                    per_page: -1
                });
                setOutputList(response.data);
            } catch (error) {
                console.error('Failed to fetch output:', error);
                toast.error('Gagal memuat data komponen');
            }
        };
        fetchOutput();
    }, [pekerjaanId]);

    // Fetch penerima list
    useEffect(() => {
        const fetchPenerima = async () => {
            try {
                const response = await getPenerimaList({
                    pekerjaan_id: pekerjaanId,
                    per_page: -1
                });
                setPenerimaList(response.data);
            } catch (error) {
                console.error('Failed to fetch penerima:', error);
                toast.error('Gagal memuat data penerima');
            }
        };
        fetchPenerima();
    }, [pekerjaanId]);

    // Reset penerima when komponen changes and penerima is optional
    // Only if NOT in edit mode or if the user manually changed the component
    useEffect(() => {
        if (selectedOutput?.penerima_is_optional && !foto) {
            setPenerimaId('');
        }
    }, [komponenId, selectedOutput?.penerima_is_optional, foto]);

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
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setKoordinat(`${latitude}, ${longitude}`);
                    toast.success('Lokasi berhasil didapatkan');

                    // Trigger Geo-fencing validation
                    if (pekerjaan?.kecamatan?.nama_kecamatan && pekerjaan?.desa?.nama_desa) {
                        const geoJson = await getKecamatanGeoJson(pekerjaan.kecamatan.nama_kecamatan);
                        if (geoJson) {
                            const desaFeature = geoJson.features.find((f: any) =>
                                f.properties.village.toLowerCase().replace(/\s+/g, '') ===
                                pekerjaan.desa?.nama_desa.toLowerCase().replace(/\s+/g, '')
                            );

                            if (desaFeature) {
                                const isValid = validatePointInFeature(latitude, longitude, desaFeature);
                                setGeoValidation({
                                    isValid,
                                    message: isValid ? 'Lokasi sesuai dengan area proyek' : 'Peringatan: Lokasi diluar batas desa proyek'
                                });
                                if (!isValid) {
                                    toast.warning('Lokasi diluar batas desa proyek', { duration: 5000 });
                                }
                            }
                        }
                    }
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

    const resetForm = () => {
        setKomponenId('');
        setPenerimaId('');
        setKeterangan('0%');
        setKoordinat('');
        setFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!komponenId) {
            toast.error('Silakan pilih komponen');
            return;
        }

        // Validate penerima if required
        if (showPenerimaDropdown && !penerimaId) {
            toast.error('Silakan pilih penerima manfaat');
            return;
        }

        if (!file && !isEditMode) {
            toast.error('Silakan pilih foto');
            return;
        }

        setLoading(true);

        try {
            let fileToUpload = file;

            // Apply Watermark if file exists
            if (file && !isEditMode) {
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
            formData.append('pekerjaan_id', pekerjaanId.toString());
            formData.append('komponen_id', komponenId);
            formData.append('keterangan', keterangan);
            formData.append('koordinat', koordinat);

            // Add validation results to formData
            if (geoValidation) {
                formData.append('validasi_koordinat', geoValidation.isValid ? '1' : '0');
                formData.append('validasi_koordinat_message', geoValidation.message);
            }

            if (penerimaId) {
                formData.append('penerima_id', penerimaId);
            }
            if (fileToUpload) {
                formData.append('file', fileToUpload);
            }

            if (isEditMode && foto) {
                await updateFoto({ id: foto.id, data: formData });
                toast.success('Foto berhasil diperbarui');
            } else {
                try {
                    await createFoto(formData);
                    toast.success('Foto berhasil ditambahkan');
                    resetForm();
                } catch (netError: any) {
                    // Check if it's a network error (offline)
                    if (!window.navigator.onLine || netError.message === 'Network Error' || netError.code === 'ERR_NETWORK') {
                        if (fileToUpload) {
                            addToQueue({
                                pekerjaanId,
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
                            resetForm();
                        }
                    } else {
                        throw netError;
                    }
                }
            }

            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to save foto:', error);
            const message = error.response?.data?.message || 'Gagal menyimpan foto';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={isEditMode ? "border-0 shadow-none" : ""}>
            {!isEditMode && (
                <CardHeader>
                    <CardTitle>Upload Foto Baru</CardTitle>
                </CardHeader>
            )}
            <CardContent className={isEditMode ? "p-0" : ""}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="komponen_id">Komponen <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                options={outputList.map((output) => ({
                                    value: output.id.toString(),
                                    label: `${output.komponen} (${output.volume} ${output.satuan})`,
                                }))}
                                value={komponenId}
                                onValueChange={setKomponenId}
                                placeholder={outputList.length === 0 ? "Tidak ada komponen tersedia" : "Pilih Komponen"}
                                searchPlaceholder="Cari komponen..."
                                emptyMessage="Komponen tidak ditemukan."
                                disabled={outputList.length === 0}
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
                                    GPS
                                </Button>
                            </div>
                            {geoValidation && (
                                <p className={`text-xs mt-1 flex items-center gap-1 ${geoValidation.isValid ? 'text-green-600' : 'text-amber-600 font-medium'}`}>
                                    {geoValidation.isValid ? (
                                        <MapPin className="h-3 w-3" />
                                    ) : (
                                        <AlertTriangle className="h-3 w-3" />
                                    )}
                                    {geoValidation.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Foto {!isEditMode && <span className="text-red-500">*</span>}</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="embedded-file"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <div className="flex gap-2 mb-4">
                                            <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                            <Camera className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Klik untuk Ambil Foto</span> atau upload
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            JPG, PNG (MAX. 5MB)
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="embedded-file"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Upload Foto')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
