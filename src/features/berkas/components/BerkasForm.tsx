import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { createBerkas, updateBerkas, getBerkas } from '../api';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, FileText } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

export default function BerkasForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;

    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [pekerjaanId, setPekerjaanId] = useState<string>('');
    const [jenisDokumen, setJenisDokumen] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPekerjaan = async () => {
            try {
                const response = await getPekerjaan({ per_page: -1 });
                setPekerjaanList(response.data);

                // Auto-select pekerjaan from URL parameter if present and not in edit mode
                // @ts-ignore
                const pekerjaanIdParam = searchParams.pekerjaan_id;
                if (pekerjaanIdParam && !isEdit) {
                    setPekerjaanId(pekerjaanIdParam);
                }
            } catch (error) {
                console.error('Failed to fetch pekerjaan:', error);
                toast.error('Gagal memuat data pekerjaan');
            }
        };
        fetchPekerjaan();
    }, [searchParams, isEdit]);

    useEffect(() => {
        if (isEdit && id) {
            const fetchBerkas = async () => {
                try {
                    setLoading(true);
                    const response = await getBerkas(parseInt(id));
                    const data = response.data;
                    setPekerjaanId(data.pekerjaan_id.toString());
                    setJenisDokumen(data.jenis_dokumen);
                    setCurrentFileUrl(data.berkas_url);
                } catch (error) {
                    console.error('Failed to fetch berkas:', error);
                    toast.error('Gagal memuat data berkas');
                    navigate({ to: '..' });
                } finally {
                    setLoading(false);
                }
            };
            fetchBerkas();
        }
    }, [isEdit, id, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pekerjaanId) {
            toast.error('Silakan pilih pekerjaan');
            return;
        }

        if (!jenisDokumen) {
            toast.error('Silakan isi jenis dokumen');
            return;
        }

        if (!isEdit && !file) {
            toast.error('Silakan pilih file');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId);
            formData.append('jenis_dokumen', jenisDokumen);
            if (file) {
                formData.append('file', file);
            }

            if (isEdit && id) {
                await updateBerkas({ id: parseInt(id), data: formData });
                toast.success('Berkas berhasil diperbarui');
            } else {
                await createBerkas(formData);
                toast.success('Berkas berhasil ditambahkan');
            }
            navigate({ to: '..' });
        } catch (error: any) {
            console.error('Failed to save berkas:', error);
            const message = error.response?.data?.message || 'Gagal menyimpan berkas';
            toast.error(message);
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
                        {isEdit ? 'Edit Berkas' : 'Upload Berkas Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Berkas</CardTitle>
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
                                <Label htmlFor="jenis_dokumen">Jenis Dokumen</Label>
                                <Input
                                    id="jenis_dokumen"
                                    value={jenisDokumen}
                                    onChange={(e) => setJenisDokumen(e.target.value)}
                                    placeholder="Contoh: RAB, Kontrak, SPK, dll"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">File Dokumen</Label>

                                {currentFileUrl && !file && (
                                    <div className="mb-2 p-3 bg-muted rounded-md flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span className="text-sm">File aktif tersedia</span>
                                        </div>
                                        <a
                                            href={currentFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Lihat
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="file"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    >
                                        {file ? (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileText className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    PDF, DOC, DOCX, XLS, XLSX (MAX. 10MB)
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            id="file"
                                            type="file"
                                            className="hidden"
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
