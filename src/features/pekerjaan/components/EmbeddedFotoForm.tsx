import { useEffect, useState } from 'react';
import { createFoto } from '@/features/foto/api';
import { getOutput } from '@/features/output/api/output';
import { getPenerimaList } from '@/features/penerima/api';
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
import { Save, Upload, MapPin } from 'lucide-react';

interface EmbeddedFotoFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
}

export default function EmbeddedFotoForm({ pekerjaanId, onSuccess }: EmbeddedFotoFormProps) {
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

    // Get selected output to check penerima_is_optional
    const selectedOutput = outputList.find(o => o.id.toString() === komponenId);
    const showPenerimaDropdown = selectedOutput && !selectedOutput.penerima_is_optional;

    // Fetch output list
    useEffect(() => {
        const fetchOutput = async () => {
            try {
                const response = await getOutput({ pekerjaan_id: pekerjaanId });
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
                const response = await getPenerimaList({ pekerjaan_id: pekerjaanId });
                setPenerimaList(response.data);
            } catch (error) {
                console.error('Failed to fetch penerima:', error);
                toast.error('Gagal memuat data penerima');
            }
        };
        fetchPenerima();
    }, [pekerjaanId]);

    // Reset penerima when komponen changes and penerima is optional
    useEffect(() => {
        if (selectedOutput?.penerima_is_optional) {
            setPenerimaId('');
        }
    }, [komponenId, selectedOutput?.penerima_is_optional]);

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

        if (!file) {
            toast.error('Silakan pilih foto');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId.toString());
            formData.append('komponen_id', komponenId);
            formData.append('keterangan', keterangan);
            formData.append('koordinat', koordinat);
            if (penerimaId) {
                formData.append('penerima_id', penerimaId);
            }
            formData.append('file', file);

            await createFoto(formData);
            toast.success('Foto berhasil ditambahkan');
            resetForm();
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
        <Card>
            <CardHeader>
                <CardTitle>Upload Foto Baru</CardTitle>
            </CardHeader>
            <CardContent>
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Foto <span className="text-red-500">*</span></Label>
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
                            {loading ? 'Menyimpan...' : 'Upload Foto'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
