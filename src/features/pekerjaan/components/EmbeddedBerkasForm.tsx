import { useState, useEffect } from 'react';
import { createBerkas, updateBerkas } from '@/features/berkas/api';
import type { Berkas } from '@/features/berkas/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Upload, FileText, X } from 'lucide-react';

interface EmbeddedBerkasFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
    initialData?: Berkas | null;
    onCancel?: () => void;
}

export default function EmbeddedBerkasForm({ pekerjaanId, onSuccess, initialData, onCancel }: EmbeddedBerkasFormProps) {
    const [jenisDokumen, setJenisDokumen] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setJenisDokumen(initialData.jenis_dokumen);
            setFile(null); // Reset file selection when editing new item
        } else {
            resetForm();
        }
    }, [initialData, pekerjaanId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const resetForm = () => {
        setJenisDokumen('');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('embedded-berkas-file') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!jenisDokumen) {
            toast.error('Silakan isi jenis dokumen');
            return;
        }

        if (!isEditing && !file) {
            toast.error('Silakan pilih file');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId.toString());
            formData.append('jenis_dokumen', jenisDokumen);
            if (file) {
                formData.append('file', file);
            }

            if (isEditing && initialData) {
                await updateBerkas({ id: initialData.id, data: formData });
                toast.success('Berkas berhasil diperbarui');
            } else {
                await createBerkas(formData);
                toast.success('Berkas berhasil ditambahkan');
            }
            resetForm();
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to save berkas:', error);
            const message = error.response?.data?.message || 'Gagal menyimpan berkas';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={isEditing ? 'border-primary shadow-md' : ''}>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Berkas' : 'Upload Berkas Baru'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="jenis_dokumen">Jenis Dokumen <span className="text-red-500">*</span></Label>
                        <Input
                            id="jenis_dokumen"
                            value={jenisDokumen}
                            onChange={(e) => setJenisDokumen(e.target.value)}
                            placeholder="Contoh: RAB, Kontrak, SPK, dll"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="embedded-berkas-file">
                            File Dokumen {isEditing ? '(Optional)' : <span className="text-red-500">*</span>}
                        </Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="embedded-berkas-file"
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
                                ) : isEditing ? (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-400">Klik untuk mengganti file yang sudah ada</p>
                                        <p className="text-xs text-gray-400">Kosongkan jika tidak ingin mengganti file</p>
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
                                    id="embedded-berkas-file"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Menyimpan...' : isEditing ? 'Update Berkas' : 'Upload Berkas'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

