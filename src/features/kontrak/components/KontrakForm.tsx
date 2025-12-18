import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { createKontrak, getKontrakById, updateKontrak, getPenyedia } from '../api/kontrak';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Kegiatan } from '@/features/kegiatan/types';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import type { Penyedia } from '../types';
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
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function KontrakForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;
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
        id_pekerjaan: 0,
        id_penyedia: 0,
    });
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
    const [selectedPekerjaanLabel, setSelectedPekerjaanLabel] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Consolidated data fetching for edit mode to ensure dropdowns are populated before form data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Fetch all dropdown data first
                // Pekerjaan: load first 10 filtered by tahun
                const [penyediaRes, kegiatanRes, pekerjaanRes] = await Promise.all([
                    getPenyedia(),
                    getKegiatan(isEdit ? {} : { tahun: tahunAnggaran }),
                    getPekerjaan({ per_page: 10, tahun: tahunAnggaran }),
                ]);

                setPenyediaList(penyediaRes.data);
                setKegiatanList(kegiatanRes.data);
                setPekerjaanList(pekerjaanRes.data);

                // If in edit mode, fetch kontrak data AFTER dropdown data is set
                if (isEdit && id) {
                    const response = await getKontrakById(parseInt(id));

                    // Ensure current pekerjaan is in the list (in case it's not in first 10)
                    if (response.data.pekerjaan) {
                        const currentPekerjaanId = response.data.pekerjaan.id;
                        const pekerjaanExists = pekerjaanRes.data.some((p: Pekerjaan) => p.id === currentPekerjaanId);
                        if (!pekerjaanExists) {
                            setPekerjaanList([response.data.pekerjaan, ...pekerjaanRes.data]);
                        }
                        // Set the label for display
                        setSelectedPekerjaanLabel(response.data.pekerjaan.nama_paket);
                    }

                    setFormData({
                        kode_rup: response.data.kode_rup || '',
                        kode_paket: response.data.kode_paket || '',
                        nomor_penawaran: response.data.nomor_penawaran || '',
                        tanggal_penawaran: response.data.tanggal_penawaran || '',
                        nilai_kontrak: response.data.nilai_kontrak || 0,
                        tgl_sppbj: response.data.tgl_sppbj || '',
                        tgl_spk: response.data.tgl_spk || '',
                        tgl_spmk: response.data.tgl_spmk || '',
                        tgl_selesai: response.data.tgl_selesai || '',
                        sppbj: response.data.sppbj || '',
                        spk: response.data.spk || '',
                        spmk: response.data.spmk || '',
                        id_kegiatan: response.data.kegiatan?.id || 0,
                        id_pekerjaan: response.data.pekerjaan?.id || 0,
                        id_penyedia: response.data.penyedia?.id || 0,
                    });
                } else {
                    // Auto-select pekerjaan from URL parameter if present and not in edit mode
                    // @ts-ignore
                    const pekerjaanIdParam = searchParams.pekerjaan_id;
                    if (pekerjaanIdParam) {
                        setFormData(prev => ({
                            ...prev,
                            id_pekerjaan: parseInt(pekerjaanIdParam)
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Gagal memuat data');
                if (isEdit) {
                    navigate({ to: '..' });
                }
            } finally {
                setLoading(false);
            }
        };

        // In edit mode, don't wait for tahunAnggaran
        if (isEdit || tahunAnggaran) {
            fetchAllData();
        }
    }, [isEdit, id, tahunAnggaran, searchParams, navigate]);

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

    // Server-side search for pekerjaan
    const searchPekerjaan = async (query: string) => {
        try {
            const response = await getPekerjaan({
                per_page: 20,
                tahun: tahunAnggaran,
                search: query
            });
            return response.data.map((pek: Pekerjaan) => ({
                value: pek.id.toString(),
                label: pek.nama_paket,
            }));
        } catch (error) {
            console.error('Search pekerjaan error:', error);
            return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.id_pekerjaan || !formData.id_penyedia) {
            toast.error('Pekerjaan dan Penyedia harus dipilih');
            return;
        }

        setLoading(true);

        try {
            if (isEdit && id) {
                await updateKontrak(parseInt(id), formData);
                toast.success('Kontrak berhasil diperbarui');
            } else {
                await createKontrak(formData);
                toast.success('Kontrak berhasil ditambahkan');
            }
            navigate({ to: '..' });
        } catch (error) {
            console.error('Failed to save kontrak:', error);
            toast.error('Gagal menyimpan kontrak');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Kontrak' : 'Tambah Kontrak Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Kontrak</CardTitle>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id_pekerjaan">Pekerjaan *</Label>
                                    <AsyncSearchableSelect
                                        initialOptions={pekerjaanList.map((pek) => ({
                                            value: pek.id.toString(),
                                            label: pek.nama_paket,
                                        }))}
                                        onSearch={searchPekerjaan}
                                        value={formData.id_pekerjaan ? formData.id_pekerjaan.toString() : ''}
                                        selectedLabel={selectedPekerjaanLabel}
                                        onValueChange={(val) => {
                                            handleSelectChange('id_pekerjaan', val);
                                            // Update label from options
                                            const option = pekerjaanList.find(p => p.id.toString() === val);
                                            if (option) setSelectedPekerjaanLabel(option.nama_paket);
                                        }}
                                        placeholder="Pilih Pekerjaan"
                                        searchPlaceholder="Cari pekerjaan..."
                                        emptyMessage="Pekerjaan tidak ditemukan."
                                        // @ts-ignore
                                        disabled={!!searchParams.pekerjaan_id}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="id_penyedia">Penyedia *</Label>
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
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sppbj">SPPBJ</Label>
                                    <Input
                                        id="sppbj"
                                        name="sppbj"
                                        value={formData.sppbj}
                                        onChange={handleChange}
                                        placeholder="Nomor/Kode SPPBJ"
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
                                    />
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
