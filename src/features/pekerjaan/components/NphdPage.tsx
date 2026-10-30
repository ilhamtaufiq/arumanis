import { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import PageContainer from '@/components/layout/page-container';
import { downloadBlob } from '@/lib/download-file';
import { useAuthStore } from '@/stores/auth-stores';
import { getPekerjaanById } from '../api/pekerjaan';
import { exportNphd } from '../api/nphd';
import { getOutput } from '@/features/output/api/output';
import type { Output } from '@/features/output/types';
import { useCreateDocumentRegister, useDocumentTypes } from '../hooks/useDocumentRegister';
import { getPrimaryKontrak, getRegisterApiErrorMessage } from '../lib/register-dokumen';
import type { Pekerjaan } from '../types';

const TIPE_KODE = 'NPHD';

const OBJEK_AWAL = '1 Paket Pembangunan (MCK 2 unit/pintu dan Tangki Septik 2 unit)';
const PENGELOLA_AWAL = 'Pengelola';

type FormState = {
    tanggal: string;
    pengelola: string;
    ketua: string;
    objek: string;
    nilai: number;
};

/** Objek hibah dari output pekerjaan, misalnya "1 paket MCK 2 unit/pintu; 2 unit Tangki Septik". */
function objekDariOutput(outputs: Output[]): string {
    return outputs
        .map((o) => `${o.volume} ${o.satuan} ${o.komponen}`.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('; ');
}

const formAwal = (): FormState => ({
    tanggal: new Date().toISOString().split('T')[0],
    pengelola: PENGELOLA_AWAL,
    ketua: '',
    objek: OBJEK_AWAL,
    nilai: 0,
});

/**
 * Halaman pembuatan NPHD dan BA serah terima untuk satu pekerjaan. Nomor dicatat dulu di Register Dokumen
 * (tipe NPHD), lalu dokumen diunduh dengan nomor itu.
 */
export default function NphdPage() {
    const params = useParams({ strict: false });
    const id = params.id;
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') ?? false;

    const { data: pekerjaan, isLoading, isError } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => (await getPekerjaanById(Number(id))).data,
        enabled: !!id,
    });

    const backTo = (
        <Button variant="ghost" asChild className="mb-2">
            <Link to="/pekerjaan/$id" params={{ id: id! }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke detail pekerjaan
            </Link>
        </Button>
    );

    if (isLoading) {
        return (
            <PageContainer>
                <Skeleton className="h-8 w-64 mb-6" />
                <Skeleton className="h-96 w-full" />
            </PageContainer>
        );
    }

    if (isError || !pekerjaan) {
        return (
            <PageContainer>
                {backTo}
                <p className="text-destructive">Pekerjaan tidak ditemukan atau gagal dimuat.</p>
            </PageContainer>
        );
    }

    if (!isAdmin) {
        return (
            <PageContainer>
                {backTo}
                <p className="text-muted-foreground">Hanya admin yang bisa membuat NPHD.</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    {backTo}
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
                        <FileText className="h-6 w-6 text-primary" />
                        Buat NPHD
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Nomor NPHD dicatat di Register Dokumen saat tombol ditekan. Dokumen NPHD dan BA serah terima
                        diunduh sebagai satu berkas .docx.
                    </p>
                </div>

                <NphdForm pekerjaan={pekerjaan} />
            </div>
        </PageContainer>
    );
}

function NphdForm({ pekerjaan }: { pekerjaan: Pekerjaan }) {
    const [form, setForm] = useState<FormState>(formAwal);
    const [busy, setBusy] = useState(false);
    const [objekDiedit, setObjekDiedit] = useState(false);
    const { data: docTypes = [] } = useDocumentTypes(true);
    const createRegister = useCreateDocumentRegister();
    const { data: outputs } = useQuery({
        queryKey: ['nphd', 'output', pekerjaan.id],
        queryFn: async () => (await getOutput({ pekerjaan_id: pekerjaan.id, per_page: 100 })).data,
    });
    const teksOutput = outputs ? objekDariOutput(outputs) : '';

    // Isi objek dari output selama admin belum mengedit sendiri.
    useEffect(() => {
        if (!objekDiedit && teksOutput) setForm((f) => ({ ...f, objek: teksOutput }));
    }, [objekDiedit, teksOutput]);

    const tipe = docTypes.find((t) => t.code.trim().toUpperCase() === TIPE_KODE);
    const kontrak = getPrimaryKontrak(pekerjaan);

    // Nilai aset diisi dari nilai kontrak selama admin belum mengubahnya sendiri.
    const [nilaiDiedit, setNilaiDiedit] = useState(false);
    const nilaiKontrak = kontrak?.nilai_kontrak ?? 0;
    useEffect(() => {
        if (!nilaiDiedit && nilaiKontrak > 0) setForm((f) => ({ ...f, nilai: nilaiKontrak }));
    }, [nilaiDiedit, nilaiKontrak]);

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const muatObjekDariOutput = () => {
        setObjekDiedit(false);
        if (teksOutput) setForm((f) => ({ ...f, objek: teksOutput }));
    };

    const handleSubmit = async () => {
        if (!kontrak) {
            toast.error('Pekerjaan ini belum punya kontrak.');
            return;
        }
        if (!tipe) {
            toast.error('Tipe dokumen NPHD belum ada. Tambahkan dulu di Pengaturan Nomor Surat.');
            return;
        }
        const nilai = form.nilai;
        if (!form.objek.trim() || !(nilai > 0)) {
            toast.error('Objek hibah dan nilai aset wajib diisi.');
            return;
        }

        setBusy(true);
        try {
            const register = await createRegister.mutateAsync({
                kontrak_id: kontrak.id,
                type_id: tipe.id,
                tanggal: form.tanggal,
                description: 'NPHD',
            });
            const blob = await exportNphd(pekerjaan.id, {
                nomor: register.nomor,
                tanggal: form.tanggal,
                objek: form.objek.trim(),
                nilai,
                pengelola_label: form.pengelola.trim() || PENGELOLA_AWAL,
                ketua: form.ketua.trim(),
            });
            downloadBlob(blob, `NPHD_${register.nomor.replace(/[^A-Za-z0-9]+/g, '_')}.docx`);
            toast.success(`NPHD ${register.nomor} dibuat dan diunduh.`);
            setForm(formAwal());
        } catch (err) {
            toast.error(getRegisterApiErrorMessage(err, 'Gagal membuat NPHD'));
        } finally {
            setBusy(false);
        }
    };

    const dapatDibuat = !!kontrak && !!tipe && !busy;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{pekerjaan.nama_paket}</CardTitle>
                {!kontrak && <CardDescription className="text-destructive">Pekerjaan ini belum punya kontrak.</CardDescription>}
                {kontrak && !tipe && (
                    <CardDescription className="text-destructive">
                        Tipe dokumen NPHD belum ada. Tambahkan dulu di Pengaturan Nomor Surat.
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nphd-tanggal">Tanggal NPHD</Label>
                        <Input id="nphd-tanggal" type="date" value={form.tanggal} onChange={set('tanggal')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nphd-nilai">Nilai aset bangunan (Rp)</Label>
                        <CurrencyInput
                            id="nphd-nilai"
                            name="nilai"
                            placeholder="49.501.500"
                            value={form.nilai}
                            onChange={(_, nilai) => {
                                setNilaiDiedit(true);
                                setForm((f) => ({ ...f, nilai }));
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            {nilaiKontrak > 0
                                ? 'Diisi dari nilai kontrak. Boleh diubah sebelum membuat NPHD.'
                                : 'Kontrak belum punya nilai. Isi nilai aset secara manual.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nphd-pengelola">Sebutan pengelola</Label>
                        <Input id="nphd-pengelola" value={form.pengelola} onChange={set('pengelola')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nphd-ketua">Nama ketua pengelola</Label>
                        <Input id="nphd-ketua" value={form.ketua} onChange={set('ketua')} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor="nphd-objek">Objek hibah</Label>
                        {teksOutput ? (
                            <Button type="button" variant="ghost" size="sm" onClick={muatObjekDariOutput}>
                                Muat dari output pekerjaan
                            </Button>
                        ) : null}
                    </div>
                    <Textarea
                        id="nphd-objek"
                        className="min-h-[72px]"
                        value={form.objek}
                        onChange={(e) => {
                            setObjekDiedit(true);
                            setForm((f) => ({ ...f, objek: e.target.value }));
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        {teksOutput
                            ? 'Diisi dari output pekerjaan. Boleh diubah sebelum membuat NPHD.'
                            : 'Pekerjaan ini belum punya output. Isi objek hibah secara manual.'}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button onClick={handleSubmit} disabled={!dapatDibuat} className="gap-1.5">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Buat & unduh NPHD
                </Button>
            </CardFooter>
        </Card>
    );
}
