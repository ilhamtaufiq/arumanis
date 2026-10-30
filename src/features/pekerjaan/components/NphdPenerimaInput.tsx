import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    id: string;
    value: string[];
    onChange: (next: string[]) => void;
};

/** Daftar nama penerima manfaat: satu isian per orang, bisa ditambah dan dihapus. */
export function NphdPenerimaInput({ id, value, onChange }: Props) {
    const daftar = value.length > 0 ? value : [''];

    const ubah = (index: number, nama: string) =>
        onChange(daftar.map((item, i) => (i === index ? nama : item)));

    const hapus = (index: number) => {
        const sisa = daftar.filter((_, i) => i !== index);
        onChange(sisa.length > 0 ? sisa : ['']);
    };

    return (
        <div className="space-y-2">
            {daftar.map((nama, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input
                        id={index === 0 ? id : `${id}-${index}`}
                        placeholder={`Nama penerima ${index + 1}`}
                        value={nama}
                        onChange={(e) => ubah(index, e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Hapus penerima ${index + 1}`}
                        onClick={() => hapus(index)}
                        disabled={daftar.length === 1 && nama === ''}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onChange([...daftar, ''])}>
                <Plus className="h-4 w-4" />
                Tambah penerima
            </Button>
        </div>
    );
}
