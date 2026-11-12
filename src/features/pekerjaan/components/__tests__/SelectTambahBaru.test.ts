import { describe, expect, it } from 'vitest';
import { gabungOpsi } from '../SelectTambahBaru';

describe('gabungOpsi', () => {
    it('menjaga urutan bawaan lalu tambahan, tanpa duplikat', () => {
        expect(gabungOpsi(['MCK', 'Pipa'], 'Pipa', ['Kran Baru', 'MCK'])).toEqual(['MCK', 'Pipa', 'Kran Baru']);
    });

    it('menampilkan nilai terpilih yang tidak ada di bawaan, misalnya dari data lama', () => {
        expect(gabungOpsi(['Unit'], 'Sumur Lama', [])).toEqual(['Unit', 'Sumur Lama']);
    });

    it('nilai kosong tidak ikut ditambahkan', () => {
        expect(gabungOpsi(['Unit'], '', [])).toEqual(['Unit']);
    });
});
