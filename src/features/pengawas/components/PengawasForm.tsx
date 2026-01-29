import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Pengawas, PengawasDTO } from '../types';
import { useCreatePengawas, useUpdatePengawas } from '../api/pengawas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const pengawasSchema = z.object({
    nama: z.string().min(1, 'Nama wajib diisi'),
    nip: z.string().optional(),
    jabatan: z.string().optional(),
    telepon: z.string().optional(),
});

type PengawasFormValues = z.infer<typeof pengawasSchema>;

interface PengawasFormProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPengawas: Pengawas | null;
}

export function PengawasForm({ isOpen, onClose, selectedPengawas }: PengawasFormProps) {
    const createMutation = useCreatePengawas();
    const updateMutation = useUpdatePengawas();

    const form = useForm<PengawasFormValues>({
        resolver: zodResolver(pengawasSchema),
        defaultValues: {
            nama: '',
            nip: '',
            jabatan: '',
            telepon: '',
        },
    });

    useEffect(() => {
        if (selectedPengawas) {
            form.reset({
                nama: selectedPengawas.nama,
                nip: selectedPengawas.nip || '',
                jabatan: selectedPengawas.jabatan || '',
                telepon: selectedPengawas.telepon || '',
            });
        } else {
            form.reset({
                nama: '',
                nip: '',
                jabatan: '',
                telepon: '',
            });
        }
    }, [selectedPengawas, form, isOpen]);

    const onSubmit = async (values: PengawasFormValues) => {
        try {
            if (selectedPengawas) {
                await updateMutation.mutateAsync({
                    id: selectedPengawas.id,
                    data: values
                });
                toast.success('Pengawas berhasil diperbarui');
            } else {
                await createMutation.mutateAsync(values as PengawasDTO);
                toast.success('Pengawas berhasil ditambahkan');
            }
            onClose();
        } catch (error) {
            console.error('Failed to save pengawas:', error);
            toast.error('Gagal menyimpan pengawas');
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {selectedPengawas ? 'Edit Pengawas' : 'Tambah Pengawas'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan nama lengkap" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nip"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan NIP (opsional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="jabatan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jabatan</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan jabatan (opsional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telepon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomor Telepon</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan nomor telepon (opsional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
