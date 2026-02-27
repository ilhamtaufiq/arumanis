import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Save, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BeritaAcara, BeritaAcaraData, BeritaAcaraEntry } from '../types';

interface BeritaAcaraTabContentProps {
    pekerjaanId: number;
}

const BA_TYPES: { key: keyof BeritaAcaraData; label: string }[] = [
    { key: 'ba_lpp', label: 'Berita Acara Laporan Pelaksanaan Pekerjaan (BA LPP)' },
    { key: 'serah_terima_pertama', label: 'Serah Terima Pekerjaan Pertama' },
    { key: 'ba_php', label: 'Berita Acara Pemeriksaan Hasil Pekerjaan (BA PHP)' },
    { key: 'ba_stp', label: 'Berita Acara Serah Terima Pekerjaan (BA STP)' },
];

const getDefaultData = (): BeritaAcaraData => ({
    ba_lpp: [],
    serah_terima_pertama: [],
    ba_php: [],
    ba_stp: [],
});

export default function BeritaAcaraTabContent({ pekerjaanId }: BeritaAcaraTabContentProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null); // key-index
    const [data, setData] = useState<BeritaAcaraData>(getDefaultData());
    const [hasChanges, setHasChanges] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const beritaAcara = await api.get<BeritaAcara | null>(`/berita-acara/pekerjaan/${pekerjaanId}`);
            setData(beritaAcara?.data ?? getDefaultData());
        } catch (error) {
            console.error('Failed to fetch berita acara:', error);
            toast.error('Gagal memuat data berita acara');
        } finally {
            setLoading(false);
        }
    }, [pekerjaanId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddEntry = (type: keyof BeritaAcaraData) => {
        setData(prev => ({
            ...prev,
            [type]: [...prev[type], { nomor: '', tanggal: '' }]
        }));
        setHasChanges(true);
    };

    const handleRemoveEntry = (type: keyof BeritaAcaraData, index: number) => {
        setData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
        setHasChanges(true);
    };

    const handleEntryChange = (
        type: keyof BeritaAcaraData,
        index: number,
        field: keyof BeritaAcaraEntry,
        value: string
    ) => {
        setData(prev => ({
            ...prev,
            [type]: prev[type].map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry
            )
        }));
        setHasChanges(true);
    };

    const handleGenerate = async (type: string, index: number, key: keyof BeritaAcaraData) => {
        try {
            setGenerating(`${key}-${index}`);
            const entry = data[key][index];
            const year = entry.tanggal ? new Date(entry.tanggal).getFullYear() : new Date().getFullYear();

            const res = await api.get<{ nomor: string }>('/berita-acara/generate-number', {
                params: { type, year, pekerjaan_id: pekerjaanId }
            });

            handleEntryChange(key, index, 'nomor', res.nomor);
            toast.success('Nomor berhasil digenerate');
        } catch (error) {
            console.error('Failed to generate number:', error);
            toast.error('Gagal generate nomor');
        } finally {
            setGenerating(null);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.post(`/berita-acara/pekerjaan/${pekerjaanId}`, { data });
            toast.success('Berita acara berhasil disimpan');
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save berita acara:', error);
            toast.error('Gagal menyimpan berita acara');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Penomoran Berita Acara</h3>
                    <p className="text-sm text-muted-foreground">
                        Kelola nomor-nomor berita acara untuk pekerjaan ini
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || !hasChanges}>
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Simpan
                </Button>
            </div>

            {BA_TYPES.map(({ key, label }) => (
                <Card key={key}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {label}
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddEntry(key)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Tambah
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data[key].length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Belum ada data. Klik "Tambah" untuk menambahkan.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data[key].map((entry, index) => (
                                    <div key={index} className="flex flex-col md:flex-row md:items-end gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="w-full md:flex-1">
                                            <Label className="text-xs">Nomor</Label>
                                            <div className="flex gap-1">
                                                <Input
                                                    value={entry.nomor}
                                                    onChange={(e) => handleEntryChange(key, index, 'nomor', e.target.value)}
                                                    placeholder="Contoh: 001/BA-LPP/2025"
                                                    className="flex-1"
                                                />
                                                {key === 'serah_terima_pertama' ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="shrink-0"
                                                                disabled={generating === `${key}-${index}`}
                                                                title="Generate Nomor Otomatis"
                                                            >
                                                                {generating === `${key}-${index}` ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleGenerate('stp_a', index, key)}>
                                                                BA STP (600/01/Disperkim)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleGenerate('stp_b', index, key)}>
                                                                BA PPHP (600/PPHP.01/Disperkim)
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0"
                                                        onClick={() => handleGenerate(key, index, key)}
                                                        disabled={generating === `${key}-${index}`}
                                                        title="Generate Nomor Otomatis"
                                                    >
                                                        {generating === `${key}-${index}` ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full md:w-48">
                                            <Label className="text-xs">Tanggal</Label>
                                            <Input
                                                type="date"
                                                value={entry.tanggal}
                                                onChange={(e) => handleEntryChange(key, index, 'tanggal', e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive w-full md:w-auto flex justify-center mt-2 md:mt-0"
                                            onClick={() => handleRemoveEntry(key, index)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2 md:mr-0" />
                                            <span className="md:hidden">Hapus</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
