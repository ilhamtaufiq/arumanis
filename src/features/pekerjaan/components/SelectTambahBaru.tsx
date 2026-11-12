import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OPSI_TAMBAH = '__tambah__';

/**
 * Daftar opsi untuk dropdown: pilihan bawaan, nilai yang sedang dipilih (walau tidak ada di bawaan),
 * dan nilai tambahan yang dibuat selama form terbuka. Urutan dan duplikasi dijaga.
 */
export function gabungOpsi(bawaan: string[], terpilih: string, tambahan: string[]): string[] {
    const semua = [...bawaan, ...tambahan];
    if (terpilih && !semua.includes(terpilih)) semua.push(terpilih);
    return semua.filter((nilai, i) => semua.indexOf(nilai) === i);
}

interface Props {
    id: string;
    value: string;
    onChange: (value: string) => void;
    bawaan: string[];
    placeholder: string;
    /** Teks pilihan terakhir di dropdown, mis. "Tambah komponen lain". */
    labelTambah: string;
    /** Placeholder kolom isian saat menambah. */
    placeholderTambah: string;
}

/** Dropdown dengan pilihan "tambah baru". Dipakai untuk komponen dan satuan output. */
export function SelectTambahBaru({ id, value, onChange, bawaan, placeholder, labelTambah, placeholderTambah }: Props) {
    const [tambahan, setTambahan] = useState<string[]>([]);
    const [menambah, setMenambah] = useState(false);
    const [teks, setTeks] = useState('');
    const opsi = useMemo(() => gabungOpsi(bawaan, value, tambahan), [bawaan, value, tambahan]);

    const simpanBaru = () => {
        const nilai = teks.trim();
        if (!nilai) return;
        if (!tambahan.includes(nilai) && !bawaan.includes(nilai)) setTambahan((prev) => [...prev, nilai]);
        onChange(nilai);
        setTeks('');
        setMenambah(false);
    };

    if (menambah) {
        return (
            <div className="flex gap-2">
                <Input
                    id={id}
                    autoFocus
                    value={teks}
                    maxLength={100}
                    placeholder={placeholderTambah}
                    onChange={(e) => setTeks(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            simpanBaru();
                        } else if (e.key === 'Escape') {
                            setMenambah(false);
                            setTeks('');
                        }
                    }}
                />
                <Button type="button" size="sm" onClick={simpanBaru} disabled={!teks.trim()}>
                    Simpan
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        setMenambah(false);
                        setTeks('');
                    }}
                >
                    Batal
                </Button>
            </div>
        );
    }

    return (
        <Select
            value={value}
            onValueChange={(nilai) => {
                if (nilai === OPSI_TAMBAH) {
                    setMenambah(true);
                    return;
                }
                onChange(nilai);
            }}
        >
            <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {opsi.map((nilai) => (
                    <SelectItem key={nilai} value={nilai}>
                        {nilai}
                    </SelectItem>
                ))}
                <SelectItem value={OPSI_TAMBAH}>{labelTambah}</SelectItem>
            </SelectContent>
        </Select>
    );
}
