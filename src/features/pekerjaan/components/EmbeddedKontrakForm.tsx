import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createKontrak, getPenyedia } from '@/features/kontrak/api/kontrak';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
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
import { useAppSettingsValues } from '@/hooks/use-app-settings';

interface EmbeddedKontrakFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
}

export default function EmbeddedKontrakForm({ pekerjaanId, onSuccess }: EmbeddedKontrakFormProps) {
    const queryClient = useQueryClient();
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
        is_checklist_complete: false,
    });
    
    // Fetch penyedia
    const { data: penyediaResponse } = useQuery({
        queryKey: ['penyedia'],
        queryFn: () => getPenyedia(),
    });
    const penyediaList = penyediaResponse?.data || [];

    // Fetch kegiatan
    const { data: kegiatanResponse } = useQuery({
        queryKey: ['kegiatan', { tahun: tahunAnggaran }],
        queryFn: () => getKegiatan({ tahun: tahunAnggaran }),
        enabled: !!tahunAnggaran,
    });
    const kegiatanList = kegiatanResponse?.data || [];

    // Mutation for creating kontrak
    const createMutation = useMutation({
        mutationFn: createKontrak,
        onSuccess: () => {
            toast.success('Kontrak berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['kontrak'] });
            resetForm();
            onSuccess?.();
        },
        onError: () => toast.error('Gagal menyimpan kontrak'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({
            ...prev,
            [name]: name === 'nilai_kontrak' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: typeof formData) => ({
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
            is_checklist_complete: false,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.id_penyedia) {
            toast.error('Penyedia harus dipilih');
            return;
        }

        createMutation.mutate(formData);
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
                            <Input
                                id="sppbj"
                                name="sppbj"
                                value={formData.sppbj}
                                onChange={handleChange}
                                placeholder="Nomor/Kode SPPBJ"
                                className="flex-1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="spk">SPK</Label>
                            <Input
                                id="spk"
                                name="spk"
                                value={formData.spk}
                                onChange={handleChange}
                                placeholder="Nomor/Kode SPK"
                                className="flex-1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="spmk">SPMK</Label>
                            <Input
                                id="spmk"
                                name="spmk"
                                value={formData.spmk}
                                onChange={handleChange}
                                placeholder="Nomor/Kode SPMK"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={createMutation.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {createMutation.isPending ? 'Menyimpan...' : 'Simpan Kontrak'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
