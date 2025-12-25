import { useState, useEffect } from 'react';
import { createTiket, updateTiket } from '../api/tiket';
import type { Tiket, TiketFormData, TiketAdminUpdateData, TiketKategori, TiketPrioritas, TiketStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, X, PlusCircle, MessageSquare } from 'lucide-react';

interface TicketFormProps {
    pekerjaanId?: number;
    initialData?: Tiket | null;
    onSuccess?: () => void;
    onCancel?: () => void;
    isAdmin?: boolean;
}

export default function TicketForm({ pekerjaanId, initialData, onSuccess, onCancel, isAdmin }: TicketFormProps) {
    const [formData, setFormData] = useState<TiketFormData>({
        subjek: '',
        deskripsi: '',
        kategori: 'other',
        prioritas: 'medium',
        pekerjaan_id: pekerjaanId || null,
    });

    const [adminData, setAdminData] = useState<TiketAdminUpdateData>({
        status: 'open',
        admin_notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                subjek: initialData.subjek,
                deskripsi: initialData.deskripsi,
                kategori: initialData.kategori,
                prioritas: initialData.prioritas,
                pekerjaan_id: initialData.pekerjaan_id,
            });
            setAdminData({
                status: initialData.status,
                admin_notes: initialData.admin_notes || '',
            });
            setFilePreview(initialData.image_url || null);
        } else {
            resetForm();
        }
    }, [initialData, pekerjaanId]);

    const resetForm = () => {
        setFormData({
            subjek: '',
            deskripsi: '',
            kategori: 'other',
            prioritas: 'medium',
            pekerjaan_id: pekerjaanId || null,
        });
        setAdminData({
            status: 'open',
            admin_notes: '',
        });
        setFile(null);
        setFilePreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFilePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();

        if (isAdmin) {
            if (!isEditing) return;
            setLoading(true);
            try {
                // For admin update, we only send status and notes, but let's use FormData just in case
                data.append('status', adminData.status || 'open');
                data.append('admin_notes', adminData.admin_notes || '');

                await updateTiket(initialData!.id, data);
                toast.success('Tiket berhasil diperbarui');
                onSuccess?.();
            } catch (error) {
                console.error('Failed to update ticket:', error);
                toast.error('Gagal memperbarui tiket');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Pengawas logic
        if (!formData.subjek || !formData.deskripsi) {
            toast.error('Silakan isi subjek dan deskripsi');
            return;
        }

        setLoading(true);

        try {
            data.append('subjek', formData.subjek);
            data.append('deskripsi', formData.deskripsi);
            data.append('kategori', formData.kategori);
            data.append('prioritas', formData.prioritas);
            if (pekerjaanId) data.append('pekerjaan_id', pekerjaanId.toString());
            if (file) data.append('attachment', file);

            if (isEditing && initialData) {
                await updateTiket(initialData.id, data);
                toast.success('Tiket berhasil diperbarui');
            } else {
                await createTiket(data);
                toast.success('Tiket berhasil diajukan');
            }
            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save ticket:', error);
            toast.error('Gagal menyimpan tiket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={isEditing ? 'border-primary/50 shadow-md bg-primary/5 dark:bg-primary/10' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    {isEditing ? <MessageSquare className="w-5 h-5 text-primary" /> : <PlusCircle className="w-5 h-5 text-primary" />}
                    <CardTitle className="text-lg">
                        {isAdmin ? 'Review Tiket' : isEditing ? 'Edit Tiket' : 'Buat Tiket Baru'}
                    </CardTitle>
                </div>
                <CardDescription>
                    {isAdmin
                        ? 'Berikan catatan admin dan ubah status tiket dari pengawas.'
                        : 'Laporkan kendala, bug, atau permintaan terkait pekerjaan ini.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isAdmin ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="subjek">Subjek <span className="text-red-500">*</span></Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {[
                                        'Nama Pekerjaan Belum Muncul',
                                        'Upload Foto Gagal',
                                        'Tidak Bisa Menambahkan Penerima',
                                        'Lokasi Desa/Kecamatan Tidak Muncul'
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            className="text-[10px] px-2 py-1 bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                                            onClick={() => setFormData(prev => ({ ...prev, subjek: suggestion }))}
                                            disabled={isEditing && initialData?.status !== 'open'}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    id="subjek"
                                    value={formData.subjek}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subjek: e.target.value }))}
                                    placeholder="Apa kendala Anda?"
                                    required
                                    disabled={isEditing && initialData?.status !== 'open'}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kategori">Kategori</Label>
                                    <Select
                                        value={formData.kategori}
                                        onValueChange={(v: TiketKategori) => setFormData(prev => ({ ...prev, kategori: v }))}
                                        disabled={isEditing && initialData?.status !== 'open'}
                                    >
                                        <SelectTrigger id="kategori">
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bug">Bug / Error Aplikasi</SelectItem>
                                            <SelectItem value="request">Permintaan Pekerjaan</SelectItem>
                                            <SelectItem value="other">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prioritas">Prioritas</Label>
                                    <Select
                                        value={formData.prioritas}
                                        onValueChange={(v: TiketPrioritas) => setFormData(prev => ({ ...prev, prioritas: v }))}
                                        disabled={isEditing && initialData?.status !== 'open'}
                                    >
                                        <SelectTrigger id="prioritas">
                                            <SelectValue placeholder="Pilih Prioritas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Rendah (Low)</SelectItem>
                                            <SelectItem value="medium">Sedang (Medium)</SelectItem>
                                            <SelectItem value="high">Tinggi (High)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi Detail <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                                    placeholder="Contoh: Nama Pekerjaan [Nama], Lokasi [Lokasi], Desa [Desa], Kecamatan [Kecamatan] belum muncul di sistem..."
                                    rows={4}
                                    required
                                    disabled={isEditing && initialData?.status !== 'open'}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attachment">Lampiran (Foto / Screenshot)</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isEditing && initialData?.status !== 'open'}
                                    className="cursor-pointer"
                                />
                                {filePreview && (
                                    <div className="relative mt-2 w-full max-w-[200px] h-32 rounded-md overflow-hidden border">
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        {!isAdmin && (!isEditing || initialData?.status === 'open') && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                                onClick={() => {
                                                    setFile(null);
                                                    setFilePreview(isEditing ? initialData?.image_url || null : null);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEditing && initialData?.admin_notes && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-md">
                                    <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 mb-1 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Catatan Admin:
                                    </p>
                                    <p className="text-sm italic text-yellow-700 dark:text-yellow-400">
                                        "{initialData.admin_notes}"
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-muted/50 p-3 rounded-md space-y-1">
                                    <p className="text-xs text-muted-foreground">Oleh: <span className="font-semibold text-foreground">{initialData?.user?.name}</span></p>
                                    <p className="text-xs text-muted-foreground">Kategori: <span className="font-semibold text-foreground uppercase">{initialData?.kategori}</span></p>
                                    <p className="text-sm font-bold mt-2">{initialData?.subjek}</p>
                                    <p className="text-xs italic text-muted-foreground mt-1">"{initialData?.deskripsi}"</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Update Status</Label>
                                    <Select
                                        value={adminData.status}
                                        onValueChange={(v: TiketStatus) => setAdminData(prev => ({ ...prev, status: v }))}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open (Menunggu)</SelectItem>
                                            <SelectItem value="pending">Pending (Dalam Proses)</SelectItem>
                                            <SelectItem value="closed">Closed (Selesai)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="admin_notes">Catatan Admin (Akan dilihat oleh pengawas)</Label>
                                <Textarea
                                    id="admin_notes"
                                    value={adminData.admin_notes}
                                    onChange={(e) => setAdminData(prev => ({ ...prev, admin_notes: e.target.value }))}
                                    placeholder="Berikan jawaban atau catatan untuk pengawas..."
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={loading} className={isEditing ? 'bg-primary hover:bg-primary/90' : ''}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Memproses...' : isAdmin ? 'Update Status & Catatan' : isEditing ? 'Update Tiket' : 'Kirim Tiket'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
