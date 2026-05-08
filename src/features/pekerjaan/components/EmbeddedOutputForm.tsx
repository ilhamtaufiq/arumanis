import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOutput, updateOutput } from '@/features/output/api/output';
import type { Output } from '@/features/output/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface EmbeddedOutputFormProps {
    pekerjaanId: number;
    onSuccess?: () => void;
    initialData?: Output | null;
    onCancel?: () => void;
}

export default function EmbeddedOutputForm({ pekerjaanId, onSuccess, initialData, onCancel }: EmbeddedOutputFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        pekerjaan_id: pekerjaanId,
        komponen: '',
        satuan: '',
        volume: 0,
        penerima_is_optional: false,
    });

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                pekerjaan_id: pekerjaanId,
                komponen: initialData.komponen,
                satuan: initialData.satuan,
                volume: initialData.volume,
                penerima_is_optional: initialData.penerima_is_optional,
            });
        } else {
            resetForm();
        }
    }, [initialData, pekerjaanId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'volume' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            penerima_is_optional: checked,
        }));
    };

    const resetForm = () => {
        setFormData({
            pekerjaan_id: pekerjaanId,
            komponen: '',
            satuan: '',
            volume: 0,
            penerima_is_optional: false,
        });
    };

    // Mutation for saving output
    const saveMutation = useMutation({
        mutationFn: (data: typeof formData) => {
            if (isEditing && initialData) {
                return updateOutput(initialData.id, data);
            }
            return createOutput(data);
        },
        onSuccess: () => {
            toast.success(isEditing ? 'Output berhasil diperbarui' : 'Output berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['output'] });
            resetForm();
            onSuccess?.();
        },
        onError: () => toast.error('Gagal menyimpan output'),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.komponen) {
            toast.error('Silakan isi komponen');
            return;
        }

        if (!formData.satuan) {
            toast.error('Silakan isi satuan');
            return;
        }

        saveMutation.mutate(formData);
    };

    return (
        <Card className={isEditing ? 'border-primary shadow-md' : ''}>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Output' : 'Tambah Output Baru'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="komponen">Komponen <span className="text-red-500">*</span></Label>
                        <Input
                            id="komponen"
                            name="komponen"
                            value={formData.komponen}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Pembangunan Jalan"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="satuan">Satuan <span className="text-red-500">*</span></Label>
                            <Input
                                id="satuan"
                                name="satuan"
                                value={formData.satuan}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Meter"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="volume">Volume <span className="text-red-500">*</span></Label>
                            <Input
                                id="volume"
                                name="volume"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.volume}
                                onChange={handleChange}
                                required
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="penerima_is_optional"
                            checked={formData.penerima_is_optional}
                            onCheckedChange={handleCheckboxChange}
                        />
                        <Label
                            htmlFor="penerima_is_optional"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            komponen Komunal
                        </Label>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={saveMutation.isPending}>
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={saveMutation.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {saveMutation.isPending ? 'Menyimpan...' : isEditing ? 'Update Output' : 'Simpan Output'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

