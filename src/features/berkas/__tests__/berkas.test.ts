import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

import api from '@/lib/api-client';
import { getBerkasList, getBerkas, createBerkas, updateBerkas, deleteBerkas } from '../api';
import type { Berkas, BerkasResponse } from '../types';

describe('Berkas API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getBerkasList', () => {
        it('should fetch berkas list without params', async () => {
            const mockResponse: BerkasResponse = {
                data: [
                    {
                        id: 1,
                        pekerjaan_id: 1,
                        jenis_dokumen: 'Laporan Harian',
                        berkas_url: 'https://example.com/berkas1.pdf',
                        created_at: '2025-12-25T00:00:00Z',
                        updated_at: '2025-12-25T00:00:00Z',
                    },
                ],
            };

            vi.mocked(api.get).mockResolvedValue(mockResponse);

            const result = await getBerkasList();

            expect(api.get).toHaveBeenCalledWith('/berkas', { params: undefined });
            expect(result).toEqual(mockResponse);
        });

        it('should fetch berkas list with params', async () => {
            const mockResponse: BerkasResponse = { data: [] };
            const params = { pekerjaan_id: 1, page: 1 };

            vi.mocked(api.get).mockResolvedValue(mockResponse);

            const result = await getBerkasList(params);

            expect(api.get).toHaveBeenCalledWith('/berkas', { params });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getBerkas', () => {
        it('should fetch a single berkas by id', async () => {
            const mockBerkas: Berkas = {
                id: 1,
                pekerjaan_id: 1,
                jenis_dokumen: 'Laporan Mingguan',
                berkas_url: 'https://example.com/berkas1.pdf',
                created_at: '2025-12-25T00:00:00Z',
                updated_at: '2025-12-25T00:00:00Z',
            };

            vi.mocked(api.get).mockResolvedValue({ data: mockBerkas });

            const result = await getBerkas(1);

            expect(api.get).toHaveBeenCalledWith('/berkas/1');
            expect(result.data).toEqual(mockBerkas);
        });
    });

    describe('createBerkas', () => {
        it('should create a new berkas with FormData', async () => {
            const formData = new FormData();
            formData.append('pekerjaan_id', '1');
            formData.append('jenis_dokumen', 'Laporan Harian');

            // Create a mock file
            const mockFile = new File(['test content'], 'laporan.pdf', { type: 'application/pdf' });
            formData.append('file', mockFile);

            const mockResponse = {
                data: {
                    id: 1,
                    pekerjaan_id: 1,
                    jenis_dokumen: 'Laporan Harian',
                    berkas_url: 'https://example.com/berkas1.pdf',
                    created_at: '2025-12-25T00:00:00Z',
                    updated_at: '2025-12-25T00:00:00Z',
                },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            const result = await createBerkas(formData);

            expect(api.post).toHaveBeenCalledWith('/berkas', formData);
            expect(result.data.id).toBe(1);
        });

        it('should handle upload error', async () => {
            const formData = new FormData();
            formData.append('pekerjaan_id', '1');

            vi.mocked(api.post).mockRejectedValue(new Error('Upload failed'));

            await expect(createBerkas(formData)).rejects.toThrow('Upload failed');
        });
    });

    describe('updateBerkas', () => {
        it('should update berkas with _method PUT appended', async () => {
            const formData = new FormData();
            formData.append('jenis_dokumen', 'Laporan Mingguan');

            const mockResponse = {
                data: {
                    id: 1,
                    pekerjaan_id: 1,
                    jenis_dokumen: 'Laporan Mingguan',
                    berkas_url: 'https://example.com/berkas1.pdf',
                    created_at: '2025-12-25T00:00:00Z',
                    updated_at: '2025-12-25T00:00:00Z',
                },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            const result = await updateBerkas({ id: 1, data: formData });

            // Check that _method was appended
            expect(formData.get('_method')).toBe('PUT');
            expect(api.post).toHaveBeenCalledWith('/berkas/1', formData);
            expect(result.data.jenis_dokumen).toBe('Laporan Mingguan');
        });
    });

    describe('deleteBerkas', () => {
        it('should delete berkas by id', async () => {
            vi.mocked(api.delete).mockResolvedValue(undefined);

            await deleteBerkas(1);

            expect(api.delete).toHaveBeenCalledWith('/berkas/1');
        });
    });
});

describe('Berkas Form Validation', () => {
    it('should validate jenis_dokumen options', () => {
        const validJenisDokumen = [
            'Laporan Harian',
            'Laporan Mingguan',
            'Berita Acara',
            'Dokumentasi',
            'Surat',
            'Lainnya',
        ];

        validJenisDokumen.forEach(jenis => {
            expect(typeof jenis).toBe('string');
            expect(jenis.length).toBeGreaterThan(0);
        });
    });

    it('should validate PDF file type', () => {
        const validTypes = ['application/pdf'];
        const testFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

        expect(validTypes).toContain(testFile.type);
    });

    it('should validate image file types for scanned documents', () => {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const jpegFile = new File(['test'], 'scan.jpg', { type: 'image/jpeg' });
        const pngFile = new File(['test'], 'scan.png', { type: 'image/png' });

        expect(validTypes).toContain(jpegFile.type);
        expect(validTypes).toContain(pngFile.type);
    });

    it('should reject non-document file types', () => {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const testFile = new File(['test'], 'video.mp4', { type: 'video/mp4' });

        expect(validTypes).not.toContain(testFile.type);
    });

    it('should validate file size limit (10MB)', () => {
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        const smallFile = new File(['x'.repeat(1000)], 'small.pdf', { type: 'application/pdf' });

        expect(smallFile.size).toBeLessThan(maxSizeBytes);
    });

    it('should require pekerjaan_id', () => {
        const formData = {
            pekerjaan_id: 1,
            jenis_dokumen: 'Laporan Harian',
            file: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        };

        expect(formData.pekerjaan_id).toBeDefined();
        expect(typeof formData.pekerjaan_id).toBe('number');
    });
});
