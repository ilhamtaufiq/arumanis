import { useEffect, useState } from 'react';
import { createKontrak, getPenyedia } from '@/features/kontrak/api/kontrak';
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
import { Save } from 'lucide-react';

interface EmbeddedKontrakFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
}

export default function EmbeddedKontrakForm({ pekerjaanId, onSuccess }: EmbeddedKontrakFormProps) {
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

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [kegiatanRes, penyediaRes] = await Promise.all([
                    getKegiatan(),
                    getPenyedia()
                ]);
                setKegiatanList(kegiatanRes.data);
                setPenyediaList(penyediaRes.data);
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast.error('Gagal memuat data referensi');
            }
        };
        fetchInitialData();
    }, []);

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            {keg.nama_kegiatan}
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

                    {/* Tanggal-tanggal */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tgl_sppbj">Tgl SPPBJ</Label>
                            <Input
                                id="tgl_sppbj"
                                name="tgl_sppbj"
                                type="date"
                                value={formData.tgl_sppbj}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tgl_spk">Tgl SPK</Label>
                            <Input
                                id="tgl_spk"
                                name="tgl_spk"
                                type="date"
                                value={formData.tgl_spk}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tgl_spmk">Tgl SPMK</Label>
                            <Input
                                id="tgl_spmk"
                                name="tgl_spmk"
                                type="date"
                                value={formData.tgl_spmk}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tgl_selesai">Tgl Selesai</Label>
                            <Input
                                id="tgl_selesai"
                                name="tgl_selesai"
                                type="date"
                                value={formData.tgl_selesai}
                                onChange={handleChange}
                            />
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
