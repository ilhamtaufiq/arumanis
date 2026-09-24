import { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const OPTIONS = ['Air Minum', 'Sanitasi'];

/** Meniru pola KegiatanForm: value diisi async dari fetch detail. */
function Harness({ fetched }: { fetched: string | undefined }) {
    const [value, setValue] = useState('');
    useEffect(() => {
        if (fetched) setValue(fetched);
    }, [fetched]);

    return (
        <Select value={value || ''} onValueChange={setValue}>
            <SelectTrigger data-testid="trigger">
                <SelectValue placeholder="Pilih Sub Bidang" />
            </SelectTrigger>
            <SelectContent>
                {OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

describe('Radix Select dengan value async', () => {
    it('menampilkan label terpilih tanpa membuka dropdown', async () => {
        render(<Harness fetched="Air Minum" />);
        await waitFor(() => {
            expect(screen.getByTestId('trigger')).toHaveTextContent('Air Minum');
        });
    });
});
