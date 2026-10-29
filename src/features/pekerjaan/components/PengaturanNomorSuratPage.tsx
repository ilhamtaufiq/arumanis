import { useState } from 'react';
import { Loader2, Pencil, PlusCircle, Save, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useCreateDocumentType,
    useDeleteDocumentType,
    useDocumentTypes,
    useUpdateDocumentType,
} from '../hooks/useDocumentRegister';
import { getRegisterApiErrorMessage as getApiErrorMessage } from '../lib/register-dokumen';
import type { DocumentType } from '../types';

const FORM_KOSONG = { name: '', code: '', format_template: '' };
const TEMPLATE_DEFAULT = '{sequence}/{code}-AMIS/{month}/{year}';

/** Tag yang bisa dipakai di template, dengan contoh nilainya untuk pratinjau. */
const PLACEHOLDERS: { tag: string; desc: string; contoh: string }[] = [
    { tag: '{sequence}', desc: 'Nomor urut 3 digit', contoh: '001' },
    { tag: '{nomor_urut_surat}', desc: 'Nomor urut tanpa nol', contoh: '1' },
    { tag: '{code}', desc: 'Kode singkat tipe', contoh: 'BA' },
    { tag: '{year}', desc: 'Tahun dokumen', contoh: '2026' },
    { tag: '{tahun}', desc: 'Alias tahun', contoh: '2026' },
    { tag: '{month}', desc: 'Bulan dalam angka romawi', contoh: 'X' },
    { tag: '{day}', desc: 'Tanggal', contoh: '28' },
    { tag: '{kontrak_id}', desc: 'ID kontrak', contoh: '123' },
    { tag: '{id_pekerjaan}', desc: 'ID pekerjaan', contoh: '45' },
];

/** Pratinjau template dengan contoh nilai, supaya format yang dihasilkan terlihat sebelum disimpan. */
function pratinjauTemplate(template: string): string {
    const isi = template.trim() || TEMPLATE_DEFAULT;
    return PLACEHOLDERS.reduce((hasil, p) => hasil.split(p.tag).join(p.contoh), isi);
}

export default function PengaturanNomorSuratPage() {
    const { data: docTypes = [], isLoading } = useDocumentTypes();
    const createTypeMutation = useCreateDocumentType();
    const updateTypeMutation = useUpdateDocumentType();
    const deleteTypeMutation = useDeleteDocumentType();

    const [editingType, setEditingType] = useState<DocumentType | null>(null);
    const [typeForm, setTypeForm] = useState(FORM_KOSONG);
    const [idHapus, setIdHapus] = useState<number | null>(null);

    const sedangSimpan = createTypeMutation.isPending || updateTypeMutation.isPending;

    const resetForm = () => {
        setEditingType(null);
        setTypeForm(FORM_KOSONG);
    };

    const mulaiEdit = (type: DocumentType) => {
        setEditingType(type);
        setTypeForm({
            name: type.name,
            code: type.code,
            format_template: type.format_template || '',
        });
    };

    const handleSimpan = () => {
        if (!typeForm.name || !typeForm.code) {
            toast.error('Nama dan Kode tipe wajib diisi');
            return;
        }

        if (editingType) {
            updateTypeMutation.mutate(
                { id: editingType.id, data: typeForm },
                {
                    onSuccess: () => {
                        toast.success('Tipe dokumen berhasil diperbarui');
                        resetForm();
                    },
                    onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal memperbarui tipe dokumen')),
                },
            );
            return;
        }

        createTypeMutation.mutate(typeForm, {
            onSuccess: () => {
                toast.success('Tipe dokumen berhasil ditambahkan');
                resetForm();
            },
            onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal menambahkan tipe dokumen')),
        });
    };

    const handleHapus = () => {
        if (idHapus === null) return;
        deleteTypeMutation.mutate(idHapus, {
            onSuccess: () => {
                toast.success('Tipe dokumen berhasil dihapus');
                setIdHapus(null);
            },
            onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal menghapus tipe dokumen')),
        });
    };

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 space-y-1">
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Settings2 className="h-6 w-6 text-primary" />
                        Pengaturan Nomor Surat
                    </h1>
                    <p className="text-muted-foreground">
                        Atur tipe dokumen dan format nomor yang dipakai di Register Penomoran Dokumen.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle>Tipe Dokumen</CardTitle>
                            <CardDescription>
                                {docTypes.length} tipe terdaftar. Tipe yang sudah dipakai di register tidak dapat dihapus.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="min-w-[160px]">Nama Tipe</TableHead>
                                            <TableHead className="w-[90px]">Kode</TableHead>
                                            <TableHead className="min-w-[220px]">Format</TableHead>
                                            <TableHead className="w-[96px] text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-16 text-center text-sm text-muted-foreground">
                                                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                                </TableCell>
                                            </TableRow>
                                        ) : docTypes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-16 text-center text-sm italic text-muted-foreground">
                                                    Belum ada tipe dokumen. Tambahkan lewat form di samping.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            docTypes.map((type) => (
                                                <TableRow
                                                    key={type.id}
                                                    data-state={editingType?.id === type.id ? 'selected' : undefined}
                                                >
                                                    <TableCell className="font-medium">{type.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{type.code}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="break-all font-mono text-xs text-muted-foreground">
                                                            {type.format_template || TEMPLATE_DEFAULT}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                aria-label={`Edit ${type.name}`}
                                                                onClick={() => mulaiEdit(type)}
                                                            >
                                                                <Pencil size={14} className="text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive"
                                                                aria-label={`Hapus ${type.name}`}
                                                                onClick={() => setIdHapus(type.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0 xl:sticky xl:top-20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {editingType ? (
                                    <Pencil className="h-4 w-4 text-blue-600" />
                                ) : (
                                    <PlusCircle className="h-4 w-4 text-emerald-600" />
                                )}
                                {editingType ? 'Edit Tipe Dokumen' : 'Tambah Tipe Baru'}
                            </CardTitle>
                            <CardDescription>
                                {editingType
                                    ? `Mengubah tipe "${editingType.name}".`
                                    : 'Isi nama, kode, dan format nomor untuk tipe baru.'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[1fr_110px] gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="tipe-nama">Nama Dokumen</Label>
                                    <Input
                                        id="tipe-nama"
                                        placeholder="Contoh: Berita Acara NPHD"
                                        value={typeForm.name}
                                        onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipe-kode">Kode</Label>
                                    <Input
                                        id="tipe-kode"
                                        placeholder="BA"
                                        value={typeForm.code}
                                        onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipe-template">Format Template</Label>
                                <Input
                                    id="tipe-template"
                                    placeholder={TEMPLATE_DEFAULT}
                                    value={typeForm.format_template}
                                    onChange={(e) => setTypeForm({ ...typeForm, format_template: e.target.value })}
                                    className="font-mono text-sm"
                                />
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {PLACEHOLDERS.map((p) => (
                                        <Badge
                                            key={p.tag}
                                            variant="secondary"
                                            className="h-5 cursor-pointer font-mono text-[10px] transition-colors hover:bg-primary hover:text-primary-foreground"
                                            title={p.desc}
                                            onClick={() =>
                                                setTypeForm((f) => ({ ...f, format_template: f.format_template + p.tag }))
                                            }
                                        >
                                            {p.tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1 rounded-lg border border-dashed bg-muted/30 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Pratinjau
                                </p>
                                <p className="break-all font-mono text-sm font-semibold">
                                    {pratinjauTemplate(typeForm.format_template)}
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="justify-end gap-2 border-t pt-4">
                            {editingType && (
                                <Button variant="ghost" size="sm" onClick={resetForm}>
                                    Batal
                                </Button>
                            )}
                            <Button size="sm" onClick={handleSimpan} disabled={sedangSimpan} className="gap-1.5">
                                {sedangSimpan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save size={14} />}
                                {editingType ? 'Simpan Perubahan' : 'Tambah Tipe'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </Main>

            <ConfirmDialog
                open={idHapus !== null}
                onOpenChange={(open) => {
                    if (!open) setIdHapus(null);
                }}
                title="Hapus tipe dokumen?"
                desc="Tipe dokumen yang sudah dipakai di register tidak dapat dihapus."
                destructive
                confirmText="Hapus"
                handleConfirm={handleHapus}
                isLoading={deleteTypeMutation.isPending}
            />
        </>
    );
}
