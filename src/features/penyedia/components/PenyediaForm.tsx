import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createPenyedia, getPenyediaById, updatePenyedia } from '../api/penyedia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, Plus, FileText, Trash2, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import type { PenyediaDto, DokumenMedia } from '../types';

export default function PenyediaForm() {
    const params = useParams({ strict: false }) as any;
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id && id !== 'new';

    const [formData, setFormData] = useState<Partial<PenyediaDto>>({
        nama: '',
        direktur: '',
        no_akta: '',
        notaris: '',
        tanggal_akta: '',
        alamat: '',
        bank: '',
        norek: '',
    });

    const [dokumenFiles, setDokumenFiles] = useState<File[]>([]);
    const [existingDokumen, setExistingDokumen] = useState<DokumenMedia[]>([]);
    const [deletedDokumenIds, setDeletedDokumenIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit && id) {
            const fetchPenyedia = async () => {
                setLoading(true);
                try {
                    console.log('Fetching penyedia with ID:', id);
                    const response = await getPenyediaById(Number(id)) as any;
                    console.log('Penyedia response:', response);
                    
                    // Robust extraction for Laravel resources
                    // Can be { data: { id, nama, ... } } or { data: { data: { id, nama, ... } } } or raw { id, nama, ... }
                    let penyedia = response;
                    if (response?.data && typeof response.data === 'object') {
                        if (response.data.data) {
                            penyedia = response.data.data;
                        } else {
                            penyedia = response.data;
                        }
                    } else if (response?.data === undefined && response?.id !== undefined) {
                        // Raw response
                        penyedia = response;
                    }

                    if (penyedia && (penyedia.nama !== undefined || penyedia.id !== undefined)) {
                        console.log('Setting form data with:', penyedia);
                        setFormData({
                            nama: penyedia.nama || '',
                            direktur: penyedia.direktur || '',
                            no_akta: penyedia.no_akta || '',
                            notaris: penyedia.notaris || '',
                            tanggal_akta: penyedia.tanggal_akta || '',
                            alamat: penyedia.alamat || '',
                            bank: penyedia.bank || '',
                            norek: penyedia.norek || '',
                        });

                        if (penyedia.dokumen) {
                            setExistingDokumen(penyedia.dokumen);
                        }
                    } else {
                        console.error('Penyedia data structure mismatch. Received:', response);
                        toast.error('Format data penyedia tidak dikenali');
                    }
                } catch (error) {
                    console.error('Failed to fetch penyedia:', error);
                    toast.error('Gagal memuat data penyedia');
                    navigate({ to: '/penyedia' });
                } finally {
                    setLoading(false);
                }
            };
            fetchPenyedia();
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: PenyediaDto = {
                ...(formData as PenyediaDto),
                dokumen: dokumenFiles.length > 0 ? dokumenFiles : undefined,
                delete_dokumen: deletedDokumenIds.length > 0 ? deletedDokumenIds : undefined,
            };

            if (isEdit && id) {
                await updatePenyedia(parseInt(id), payload);
                toast.success('Penyedia berhasil diperbarui');
            } else {
                await createPenyedia(payload);
                toast.success('Penyedia berhasil ditambahkan');
            }
            navigate({ to: '/penyedia' });
        } catch (error) {
            toast.error(isEdit ? 'Gagal memperbarui penyedia' : 'Gagal menambahkan penyedia');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setDokumenFiles([...dokumenFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...dokumenFiles];
        newFiles.splice(index, 1);
        setDokumenFiles(newFiles);
    };

    const removeExistingFile = (docId: number) => {
        setDeletedDokumenIds([...deletedDokumenIds, docId]);
        setExistingDokumen(existingDokumen.filter(doc => doc.id !== docId));
    };

    return (
        <>
            <Header />

            <Main>
                <div className="w-full space-y-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/penyedia">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEdit ? 'Edit Penyedia' : 'Tambah Penyedia Baru'}
                        </h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Form Penyedia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading && isEdit ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="text-muted-foreground animate-pulse">Memuat data penyedia...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama">Nama Penyedia</Label>
                                            <Input
                                                id="nama"
                                                name="nama"
                                                value={formData.nama}
                                                onChange={handleChange}
                                                required
                                                placeholder="PT. Bina Mulya"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="direktur">Direktur</Label>
                                            <Input
                                                id="direktur"
                                                name="direktur"
                                                value={formData.direktur}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nama Direktur"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="no_akta">No Akta</Label>
                                            <Input
                                                id="no_akta"
                                                name="no_akta"
                                                value={formData.no_akta}
                                                onChange={handleChange}
                                                required
                                                placeholder="AHU-00123.AH.01.02.Tahun 2024"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notaris">Nama Notaris</Label>
                                            <Input
                                                id="notaris"
                                                name="notaris"
                                                value={formData.notaris}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nama Notaris, SH, M.Kn"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_akta">Tanggal Akta</Label>
                                            <Input
                                                id="tanggal_akta"
                                                name="tanggal_akta"
                                                type="date"
                                                value={formData.tanggal_akta}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="alamat">Alamat</Label>
                                            <Input
                                                id="alamat"
                                                name="alamat"
                                                value={formData.alamat}
                                                onChange={handleChange}
                                                required
                                                placeholder="Jl. Raya Contoh No. 123"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bank">Nama Bank</Label>
                                            <Input
                                                id="bank"
                                                name="bank"
                                                value={formData.bank}
                                                onChange={handleChange}
                                                placeholder="BJB"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="norek">Nomor Rekening</Label>
                                            <Input
                                                id="norek"
                                                name="norek"
                                                value={formData.norek}
                                                onChange={handleChange}
                                                placeholder="1234567890"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 shadow-sm border rounded-lg p-5 bg-muted/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label className="text-base font-semibold">Dokumen Lampiran</Label>
                                            <div>
                                                <Label htmlFor="dokumen_upload" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md inline-flex items-center text-sm">
                                                    <Plus className="w-4 h-4 mr-1" /> Tambah Dokumen
                                                </Label>
                                                <Input
                                                    id="dokumen_upload"
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            {/* Existing Documents */}
                                            {existingDokumen.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                                                        <div className="overflow-hidden">
                                                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-medium truncate flex-1 hover:underline text-primary">
                                                                {doc.name}
                                                            </a>
                                                            <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB (Tersimpan)</p>
                                                        </div>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExistingFile(doc.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {/* New Selected Files */}
                                            {dokumenFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border border-primary/30 rounded-md bg-primary/5">
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <FileText className="w-8 h-8 text-green-500 shrink-0" />
                                                        <div className="overflow-hidden">
                                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB (Baru)</p>
                                                        </div>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {existingDokumen.length === 0 && dokumenFiles.length === 0 && (
                                                <div className="col-span-full py-8 text-center border-2 border-dashed rounded-lg bg-background text-muted-foreground">
                                                    Belum ada dokumen yang dilampirkan
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end space-x-2">
                                        <Button variant="outline" type="button" asChild>
                                            <Link to="/penyedia">Batal</Link>
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {loading ? 'Menyimpan...' : 'Simpan Penyedia'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    );
}
