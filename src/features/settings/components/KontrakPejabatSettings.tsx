import { useEffect, useState } from 'react';
import { Building2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api-error-message';
import { getSettingValue, useAppSettings, useUpdateAppSettings } from '../api';
import {
    DEFAULT_KONTRAK_SKPD,
    KONTRAK_CARA_PEMBAYARAN_OPTIONS,
    type KontrakCaraPembayaran,
} from '../constants/kontrak-document-settings';

export default function KontrakPejabatSettings() {
    const { data, isLoading, error } = useAppSettings();
    const updateMutation = useUpdateAppSettings();

    const [namaPpk, setNamaPpk] = useState('');
    const [nipPpk, setNipPpk] = useState('');
    const [namaPptk, setNamaPptk] = useState('');
    const [nipPptk, setNipPptk] = useState('');
    const [masaPemeliharaanHari, setMasaPemeliharaanHari] = useState('180');
    const [skpd, setSkpd] = useState(DEFAULT_KONTRAK_SKPD);
    const [nomorDpa, setNomorDpa] = useState('');
    const [tanggalDpa, setTanggalDpa] = useState('');
    const [caraPembayaran, setCaraPembayaran] = useState<KontrakCaraPembayaran>('sekaligus');

    useEffect(() => {
        if (!data?.data) return;

        setNamaPpk(getSettingValue(data.data, 'kontrak_nama_ppk'));
        setNipPpk(getSettingValue(data.data, 'kontrak_nip_ppk'));
        setNamaPptk(getSettingValue(data.data, 'kontrak_nama_pptk'));
        setNipPptk(getSettingValue(data.data, 'kontrak_nip_pptk'));
        setMasaPemeliharaanHari(getSettingValue(data.data, 'kontrak_masa_pemeliharaan_hari') || '180');
        setSkpd(getSettingValue(data.data, 'kontrak_skpd') || DEFAULT_KONTRAK_SKPD);
        setNomorDpa(getSettingValue(data.data, 'kontrak_nomor_dpa'));
        setTanggalDpa(getSettingValue(data.data, 'kontrak_tanggal_dpa'));

        const storedCara = getSettingValue(data.data, 'kontrak_cara_pembayaran');
        if (storedCara === 'sekaligus' || storedCara === 'termin' || storedCara === 'bulan') {
            setCaraPembayaran(storedCara);
        }
    }, [data]);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                kontrak_nama_ppk: namaPpk.trim(),
                kontrak_nip_ppk: nipPpk.trim(),
                kontrak_nama_pptk: namaPptk.trim(),
                kontrak_nip_pptk: nipPptk.trim(),
                kontrak_masa_pemeliharaan_hari: masaPemeliharaanHari.trim() || '180',
                kontrak_skpd: skpd.trim(),
                kontrak_nomor_dpa: nomorDpa.trim(),
                kontrak_tanggal_dpa: tanggalDpa.trim(),
                kontrak_cara_pembayaran: caraPembayaran,
            });
            toast.success('Pengaturan dokumen kontrak berhasil disimpan');
        } catch (saveError) {
            toast.error(getApiErrorMessage(saveError, 'Gagal menyimpan pengaturan dokumen kontrak'));
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-destructive">
                    Gagal memuat pengaturan dokumen kontrak: {error.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Pengaturan Dokumen Kontrak
                </CardTitle>
                <CardDescription>
                    Data ini dipakai placeholder di template ringkasan, SPK, cover, dan BAP. PPK memakai default SPSE
                    jika kosong. PPTK di sini hanya fallback — prioritas utama diambil dari data PPTK per sub kegiatan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <section className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold">Pejabat</h3>
                        <p className="text-xs text-muted-foreground">
                            Placeholder: {'{nama_ppk}'}, {'{nip_ppk}'}, {'{nama_pptk}'}, {'{nip_pptk}'}. PPTK diambil
                            dari sub kegiatan terkait pekerjaan; field di bawah dipakai jika sub kegiatan belum diisi.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_nama_ppk">Nama PPK</Label>
                            <Input
                                id="kontrak_nama_ppk"
                                value={namaPpk}
                                onChange={(e) => setNamaPpk(e.target.value)}
                                placeholder="Contoh: AGUNG DELI SAHPUTRA, S.T."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_nip_ppk">NIP PPK</Label>
                            <Input
                                id="kontrak_nip_ppk"
                                value={nipPpk}
                                onChange={(e) => setNipPpk(e.target.value)}
                                placeholder="Contoh: 197711212006041010"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_nama_pptk">Nama PPTK (fallback default)</Label>
                            <Input
                                id="kontrak_nama_pptk"
                                value={namaPptk}
                                onChange={(e) => setNamaPptk(e.target.value)}
                                placeholder="Nama Pejabat Pelaksana Teknis Kegiatan"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_nip_pptk">NIP PPTK</Label>
                            <Input
                                id="kontrak_nip_pptk"
                                value={nipPptk}
                                onChange={(e) => setNipPptk(e.target.value)}
                                placeholder="NIP PPTK"
                            />
                        </div>
                    </div>
                </section>

                <Separator />

                <section className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold">Instansi & DPA</h3>
                        <p className="text-xs text-muted-foreground">
                            Placeholder: {'{skpd}'}, {'{nomor_dpa}'}, {'{tanggal_dpa}'}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="kontrak_skpd">SKPD</Label>
                            <Input
                                id="kontrak_skpd"
                                value={skpd}
                                onChange={(e) => setSkpd(e.target.value)}
                                placeholder={DEFAULT_KONTRAK_SKPD}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_nomor_dpa">Nomor DPA / DPPA SKPD</Label>
                            <Input
                                id="kontrak_nomor_dpa"
                                value={nomorDpa}
                                onChange={(e) => setNomorDpa(e.target.value)}
                                placeholder="Contoh: 900/Kep.09/BKAD/2/2026"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_tanggal_dpa">Tanggal DPA / DPPA</Label>
                            <Input
                                id="kontrak_tanggal_dpa"
                                value={tanggalDpa}
                                onChange={(e) => setTanggalDpa(e.target.value)}
                                placeholder="Contoh: 03 Februari 2026"
                            />
                        </div>
                    </div>
                </section>

                <Separator />

                <section className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold">Pembayaran & Pemeliharaan</h3>
                        <p className="text-xs text-muted-foreground">
                            Placeholder: {'{check_pembayaran_sekaligus}'}, {'{check_pembayaran_termin}'},{' '}
                            {'{check_pembayaran_bulan}'}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_cara_pembayaran">Tata cara pembayaran</Label>
                            <Select
                                value={caraPembayaran}
                                onValueChange={(value) => setCaraPembayaran(value as KontrakCaraPembayaran)}
                            >
                                <SelectTrigger id="kontrak_cara_pembayaran">
                                    <SelectValue placeholder="Pilih cara pembayaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {KONTRAK_CARA_PEMBAYARAN_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kontrak_masa_pemeliharaan_hari">Masa pemeliharaan (hari)</Label>
                            <Input
                                id="kontrak_masa_pemeliharaan_hari"
                                type="number"
                                min={1}
                                max={3650}
                                value={masaPemeliharaanHari}
                                onChange={(e) => setMasaPemeliharaanHari(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <Button type="button" onClick={() => void handleSave()} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan Pengaturan
                </Button>
            </CardContent>
        </Card>
    );
}