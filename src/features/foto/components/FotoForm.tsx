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
import { ArrowLeft, Save, Upload, MapPin, AlertTriangle } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { extractFormattedCoordinates } from '@/lib/image-gps-utils';
import { formatKoordinat } from '@/lib/koordinat-utils';
import { useKoordinatValidation } from '@/hooks/use-koordinat-validation';
import { ApiError } from '@/lib/api-client';

const PROGRESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%'] as const;

function normalizeProgress(value?: string | null): string {
    if (!value) return '0%';
    // Support legacy "50%|Unit 2"
    const trimmed = String(value).split('|')[0].trim();
    if ((PROGRESS_OPTIONS as readonly string[]).includes(trimmed)) {
        return trimmed;
    }
    if ((PROGRESS_OPTIONS as readonly string[]).includes(`${trimmed}%`)) {
        return `${trimmed}%`;
    }
    return '0%';
}

function resolveUnitIndexFromFoto(foto: {
    unit_index?: number | null;
    keterangan?: string | null;
}): string {
    if (foto.unit_index != null && Number(foto.unit_index) > 0) {
        return String(foto.unit_index);
    }
    const match = String(foto.keterangan || '').match(/\|?\s*Unit\s+(\d+)/i);
    return match?.[1] || '';
}

export default function FotoForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;

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
    const parsedPekerjaanId = pekerjaanId ? Number.parseInt(pekerjaanId, 10) : undefined;
    const geoValidation = useKoordinatValidation(
        parsedPekerjaanId && Number.isFinite(parsedPekerjaanId) ? parsedPekerjaanId : undefined,
        koordinat,
    );

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
            setKeterangan(normalizeProgress(fotoData.keterangan));
            setKoordinat(fotoData.koordinat || '');
            setPreviewUrl(fotoData.foto_url);
            setUnitIndex(resolveUnitIndexFromFoto(fotoData));
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

    // Reset penerima and handle unit auto-selection from URL (create only)
    useEffect(() => {
        if (isEdit) return;
        if (selectedOutput?.penerima_is_optional) {
            setPenerimaId('');
            // @ts-ignore
            if (searchParams.unit_index) {
                // @ts-ignore
                setUnitIndex(String(searchParams.unit_index));
            }
        }
    }, [komponenId, selectedOutput?.penerima_is_optional, searchParams, isEdit]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));

            const extractionToast = toast.loading('Mencoba mengekstrak koordinat dari foto...');
            try {
                const coords = await extractFormattedCoordinates(selectedFile);
                if (coords) {
                    setKoordinat(coords);
                    toast.success('Koordinat berhasil diekstrak dari foto', { id: extractionToast });
                } else {
                    toast.info('Tidak ada koordinat yang ditemukan pada foto.', { id: extractionToast });
                }
            } catch (err) {
                console.error('Extraction failed:', err);
                toast.error('Gagal mengekstrak koordinat', { id: extractionToast });
            }
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setKoordinat(formatKoordinat(latitude, longitude));
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

        const requiresUnitIndex = Boolean(
            selectedOutput?.penerima_is_optional && Number(selectedOutput.volume) > 1,
        );
        if (requiresUnitIndex && !unitIndex) {
            toast.error('Silakan pilih nomor unit');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId);
            formData.append('komponen_id', komponenId);
            formData.append('keterangan', normalizeProgress(keterangan));
            if (unitIndex) {
                formData.append('unit_index', unitIndex);
            }
            formData.append('koordinat', koordinat);
            if (geoValidation && !geoValidation.loading) {
                formData.append('validasi_koordinat', geoValidation.isValid ? '1' : '0');
                formData.append('validasi_koordinat_message', geoValidation.message || '');
            }
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
        } catch (error: unknown) {
            console.error('Failed to save foto:', error);
            const message = error instanceof ApiError
                ? error.message
                : (error as { message?: string })?.message || 'Gagal menyimpan foto';
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
                                    value={normalizeProgress(keterangan)}
                                    onValueChange={setKeterangan}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Progress" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROGRESS_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedOutput?.penerima_is_optional && Number(selectedOutput.volume) > 1 && (
                                <div className="space-y-2">
                                    <Label htmlFor="unit_index">Nomor Unit <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={unitIndex || undefined}
                                        onValueChange={setUnitIndex}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Nomor Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: Number(selectedOutput.volume) }).map((_, i) => (
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
                                {geoValidation && (
                                    <p className={`text-xs mt-1 flex items-center gap-1 ${geoValidation.loading ? 'text-muted-foreground' : geoValidation.isValid ? 'text-green-600' : 'text-amber-600 font-medium'}`}>
                                        {!geoValidation.loading && (
                                            geoValidation.isValid ? (
                                                <MapPin className="h-3 w-3" />
                                            ) : (
                                                <AlertTriangle className="h-3 w-3" />
                                            )
                                        )}
                                        {geoValidation.message}
                                    </p>
                                )}
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
                                                    JPG, PNG (MAX. 50MB)
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
