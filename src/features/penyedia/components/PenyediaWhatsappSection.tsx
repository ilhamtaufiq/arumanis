import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { addPenyediaWhatsapp, deletePenyediaWhatsapp, getPenyediaWhatsapp } from '../api/penyedia'

interface PenyediaWhatsappSectionProps {
    penyediaId: number;
}

/** Nomor WhatsApp penyedia. Satu penyedia boleh punya banyak nomor. Setiap perubahan langsung disimpan. */
export default function PenyediaWhatsappSection({ penyediaId }: PenyediaWhatsappSectionProps) {
    const queryClient = useQueryClient();
    const queryKey = ['penyedia-whatsapp', penyediaId];
    const [nomor, setNomor] = useState('');
    const [label, setLabel] = useState('');

    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: async () => (await getPenyediaWhatsapp(penyediaId)).data,
        enabled: penyediaId > 0,
    });

    const tambah = useMutation({
        mutationFn: () => addPenyediaWhatsapp(penyediaId, { nomor: nomor.trim(), label: label.trim() || undefined }),
        onSuccess: () => {
            setNomor('');
            setLabel('');
            void queryClient.invalidateQueries({ queryKey });
            toast.success('Nomor WhatsApp ditambahkan');
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal menambah nomor WhatsApp')),
    });

    const hapus = useMutation({
        mutationFn: (waId: number) => deletePenyediaWhatsapp(penyediaId, waId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey });
            toast.success('Nomor WhatsApp dihapus');
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal menghapus nomor WhatsApp')),
    });

    const daftar = data ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Nomor WhatsApp
                </CardTitle>
                <CardDescription>Satu penyedia boleh punya lebih dari satu nomor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Memuat nomor…</p>
                ) : daftar.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada nomor WhatsApp.</p>
                ) : (
                    <ul className="divide-y rounded-md border">
                        {daftar.map((w) => (
                            <li key={w.id} className="flex items-center justify-between gap-3 px-3 py-2">
                                <div className="min-w-0">
                                    <a
                                        href={`https://wa.me/${w.nomor}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        {formatNomorWhatsapp(w.nomor)}
                                    </a>
                                    {w.label && <p className="truncate text-xs text-muted-foreground">{w.label}</p>}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => hapus.mutate(w.id)}
                                    disabled={hapus.isPending}
                                    aria-label={`Hapus nomor ${formatNomorWhatsapp(w.nomor)}`}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                <form
                    className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (nomor.trim()) tambah.mutate();
                    }}
                >
                    <div className="space-y-1.5">
                        <Label htmlFor="wa-nomor">Nomor</Label>
                        <Input
                            id="wa-nomor"
                            type="tel"
                            inputMode="tel"
                            value={nomor}
                            onChange={(e) => setNomor(e.target.value)}
                            maxLength={20}
                            placeholder="081234567890 atau +62 812-3456-7890"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="wa-label">Keterangan (opsional)</Label>
                        <Input
                            id="wa-label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            maxLength={100}
                            placeholder="mis. Direktur, Kantor"
                        />
                    </div>
                    <Button type="submit" disabled={tambah.isPending || !nomor.trim()}>
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                        Tambah
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
