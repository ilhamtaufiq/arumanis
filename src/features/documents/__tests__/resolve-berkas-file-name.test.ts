import { describe, expect, it } from 'vitest';
import { namaUnduhBerkas } from '../lib/resolve-berkas-file-name';

const dasar = { id: 7, berkas_url: '/storage/12/3f2a-uuid.pdf', jenis_dokumen: 'BASTP' };

describe('namaUnduhBerkas', () => {
    it('menambahkan ekstensi dari file_name bila original_name tanpa ekstensi', () => {
        expect(namaUnduhBerkas({ ...dasar, original_name: 'Berita Acara', file_name: '3f2a-uuid.pdf' })).toBe(
            'Berita Acara.pdf',
        );
    })
    it('tidak menambah ekstensi kedua bila sudah ada', () => {
        expect(namaUnduhBerkas({ ...dasar, original_name: 'Berita Acara.pdf', file_name: '3f2a-uuid.pdf' })).toBe(
            'Berita Acara.pdf',
        );
    })
    it('mempertahankan titik di dalam nama', () => {
        expect(namaUnduhBerkas({ ...dasar, original_name: 'Foto Lapangan.v2', file_name: '3f2a-uuid.pdf' })).toBe(
            'Foto Lapangan.v2.pdf',
        );
    })
    it('memakai URL bila file_name kosong', () => {
        expect(namaUnduhBerkas({ ...dasar, original_name: 'Surat', file_name: null })).toBe('Surat.pdf');
    })
    it('memakai nama dari URL bila original_name kosong', () => {
        expect(namaUnduhBerkas({ ...dasar, original_name: null })).toBe('3f2a-uuid.pdf');
    })
})
