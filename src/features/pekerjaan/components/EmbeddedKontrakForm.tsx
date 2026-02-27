import { useEffect, useState } from 'react';
import { createKontrak, getPenyedia, generateKontrakNumber } from '@/features/kontrak/api/kontrak';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
import type { Kegiatan } from '@/features/kegiatan/types';
import type { Penyedia } from '@/features/kontrak/types';
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
import { Save, Sparkles, Loader2 } from 'lucide-react';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

interface EmbeddedKontrakFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
}

export default function EmbeddedKontrakForm({ pekerjaanId, onSuccess }: EmbeddedKontrakFormProps) {
    const { tahunAnggaran } = useAppSettingsValues();

    const [formData, setFormData] = useState({
        kode_rup: '',
        kode_paket: '',
        nomor_penawaran: '',
        tanggal_penawaran: '',
        nilai_kontrak: 0,
        tgl_sppbj: '',
        tgl_spk: '',
        tgl_spmk: '',
        tgl_selesai: '',
        sppbj: '',
        spk: '',
        spmk: '',
        id_kegiatan: 0,
        id_pekerjaan: pekerjaanId,
        id_penyedia: 0,
    });
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null);

    // Fetch penyedia (no tahun filter needed)
    useEffect(() => {
        const fetchPenyedia = async () => {
            try {
                const penyediaRes = await getPenyedia();
                setPenyediaList(penyediaRes.data);
            } catch (error) {
                console.error('Failed to fetch penyedia:', error);
            }
        };
        fetchPenyedia();
    }, []);

    // Fetch kegiatan filtered by tahun_anggaran
    useEffect(() => {
        const fetchKegiatan = async () => {
            try {
                const kegiatanRes = await getKegiatan({ tahun: tahunAnggaran });
                setKegiatanList(kegiatanRes.data);
            } catch (error) {
                console.error('Failed to fetch kegiatan:', error);
                toast.error('Gagal memuat data kegiatan');
            }
        };
        if (tahunAnggaran) {
            fetchKegiatan();
        }
    }, [tahunAnggaran]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'nilai_kontrak' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }));
    };

    const handleGenerate = async (type: 'sppbj' | 'spk' | 'spmk') => {
        try {
            setGenerating(type);
            const dateKey = `tgl_${type}` as keyof typeof formData;
            const year = formData[dateKey] ? new Date(formData[dateKey] as string).getFullYear() : (tahunAnggaran ? parseInt(tahunAnggaran) : new Date().getFullYear());

            const res = await generateKontrakNumber({
                type,
                pekerjaan_id: pekerjaanId,
                year
            });

            setFormData(prev => ({ ...prev, [type]: res.nomor }));
            toast.success(`Nomor ${type.toUpperCase()} berhasil digenerate`);
        } catch (error) {
            console.error(`Failed to generate ${type}:`, error);
            toast.error(`Gagal generate nomor ${type.toUpperCase()}`);
        } finally {
            setGenerating(null);
        }
    };

    const resetForm = () => {
        setFormData({
            kode_rup: '',
            kode_paket: '',
            nomor_penawaran: '',
            tanggal_penawaran: '',
            nilai_kontrak: 0,
            tgl_sppbj: '',
            tgl_spk: '',
            tgl_spmk: '',
            tgl_selesai: '',
            sppbj: '',
            spk: '',
            spmk: '',
            id_kegiatan: 0,
            id_pekerjaan: pekerjaanId,
            id_penyedia: 0,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.id_penyedia) {
            toast.error('Penyedia harus dipilih');
            return;
        }

        setLoading(true);

        try {
            await createKontrak(formData);
            toast.success('Kontrak berhasil ditambahkan');
            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save kontrak:', error);
            toast.error('Gagal menyimpan kontrak');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tambah Kontrak Baru</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Identitas Kontrak */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="kode_rup">Kode RUP</Label>
                            <Input
                                id="kode_rup"
                                name="kode_rup"
                                value={formData.kode_rup}
                                onChange={handleChange}
                                placeholder="Kode RUP"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kode_paket">Kode Paket</Label>
                            <Input
                                id="kode_paket"
                                name="kode_paket"
                                value={formData.kode_paket}
                                onChange={handleChange}
                                placeholder="Kode Paket"
                            />
                        </div>
                    </div>

                    {/* Penawaran */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nomor_penawaran">Nomor Penawaran</Label>
                            <Input
                                id="nomor_penawaran"
                                name="nomor_penawaran"
                                value={formData.nomor_penawaran}
                                onChange={handleChange}
                                placeholder="Nomor Penawaran"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tanggal_penawaran">Tanggal Penawaran</Label>
                            <Input
                                id="tanggal_penawaran"
                                name="tanggal_penawaran"
                                type="date"
                                value={formData.tanggal_penawaran}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Nilai Kontrak */}
                    <div className="space-y-2">
                        <Label htmlFor="nilai_kontrak">Nilai Kontrak (Rp)</Label>
                        <Input
                            id="nilai_kontrak"
                            name="nilai_kontrak"
                            type="number"
                            min="0"
                            value={formData.nilai_kontrak}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    {/* Relasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="id_kegiatan">Kegiatan</Label>
                            <Select
                                value={formData.id_kegiatan ? formData.id_kegiatan.toString() : '0'}
                                onValueChange={(val) => handleSelectChange('id_kegiatan', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kegiatan (Opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Tanpa Kegiatan</SelectItem>
                                    {kegiatanList.map((keg) => (
                                        <SelectItem key={keg.id} value={keg.id.toString()}>
                                            {keg.nama_sub_kegiatan} ({keg.tahun_anggaran})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="id_penyedia">Penyedia <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                options={penyediaList.map((pen) => ({
                                    value: pen.id.toString(),
                                    label: pen.nama,
                                }))}
                                value={formData.id_penyedia ? formData.id_penyedia.toString() : ''}
                                onValueChange={(val) => handleSelectChange('id_penyedia', val)}
                                placeholder="Pilih Penyedia"
                                searchPlaceholder="Cari penyedia..."
                                emptyMessage="Penyedia tidak ditemukan."
                            />
                        </div>
                    </div>

                    {/* Tanggal-tanggal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tgl_sppbj">Tanggal SPPBJ</Label>
                            <Input
                                id="tgl_sppbj"
                                name="tgl_sppbj"
                                type="date"
                                value={formData.tgl_sppbj}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tgl_spk">Tanggal SPK</Label>
                            <Input
                                id="tgl_spk"
                                name="tgl_spk"
                                type="date"
                                value={formData.tgl_spk}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tgl_spmk">Tanggal SPMK</Label>
                            <Input
                                id="tgl_spmk"
                                name="tgl_spmk"
                                type="date"
                                value={formData.tgl_spmk}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tgl_selesai">Tanggal Selesai</Label>
                            <Input
                                id="tgl_selesai"
                                name="tgl_selesai"
                                type="date"
                                value={formData.tgl_selesai}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Dokumen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sppbj">SPPBJ</Label>
                            <div className="flex gap-1">
                                <Input
                                    id="sppbj"
                                    name="sppbj"
                                    value={formData.sppbj}
                                    onChange={handleChange}
                                    placeholder="Nomor/Kode SPPBJ"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => handleGenerate('sppbj')}
                                    disabled={generating === 'sppbj'}
                                    title="Generate Nomor Otomatis"
                                >
                                    {generating === 'sppbj' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="spk">SPK</Label>
                            <div className="flex gap-1">
                                <Input
                                    id="spk"
                                    name="spk"
                                    value={formData.spk}
                                    onChange={handleChange}
                                    placeholder="Nomor/Kode SPK"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => handleGenerate('spk')}
                                    disabled={generating === 'spk'}
                                    title="Generate Nomor Otomatis"
                                >
                                    {generating === 'spk' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="spmk">SPMK</Label>
                            <div className="flex gap-1">
                                <Input
                                    id="spmk"
                                    name="spmk"
                                    value={formData.spmk}
                                    onChange={handleChange}
                                    placeholder="Nomor/Kode SPMK"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => handleGenerate('spmk')}
                                    disabled={generating === 'spmk'}
                                    title="Generate Nomor Otomatis"
                                >
                                    {generating === 'spmk' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : 'Simpan Kontrak'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
