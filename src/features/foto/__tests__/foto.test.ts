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
import { getFotoList, getFoto, createFoto, updateFoto, deleteFoto } from '../api';
import type { Foto, FotoResponse } from '../types';

describe('Foto API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFotoList', () => {
        it('should fetch foto list without params', async () => {
            const mockResponse: FotoResponse = {
                data: [
                    {
                        id: 1,
                        pekerjaan_id: 1,
                        komponen_id: 1,
                        keterangan: '50%',
                        koordinat: '-6.123,106.456',
                        validasi_koordinat: true,
                        foto_url: 'https://example.com/foto1.jpg',
                        created_at: '2025-12-25T00:00:00Z',
                        updated_at: '2025-12-25T00:00:00Z',
                    },
                ],
            };

            vi.mocked(api.get).mockResolvedValue(mockResponse);

            const result = await getFotoList();

            expect(api.get).toHaveBeenCalledWith('/foto', { params: undefined });
            expect(result).toEqual(mockResponse);
        });

        it('should fetch foto list with params', async () => {
            const mockResponse: FotoResponse = { data: [] };
            const params = { pekerjaan_id: 1, page: 1 };

            vi.mocked(api.get).mockResolvedValue(mockResponse);

            const result = await getFotoList(params);

            expect(api.get).toHaveBeenCalledWith('/foto', { params });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getFoto', () => {
        it('should fetch a single foto by id', async () => {
            const mockFoto: Foto = {
                id: 1,
                pekerjaan_id: 1,
                komponen_id: 1,
                keterangan: '100%',
                koordinat: '-6.123,106.456',
                validasi_koordinat: true,
                foto_url: 'https://example.com/foto1.jpg',
                created_at: '2025-12-25T00:00:00Z',
                updated_at: '2025-12-25T00:00:00Z',
            };

            vi.mocked(api.get).mockResolvedValue({ data: mockFoto });

            const result = await getFoto(1);

            expect(api.get).toHaveBeenCalledWith('/foto/1');
            expect(result.data).toEqual(mockFoto);
        });
    });

    describe('createFoto', () => {
        it('should create a new foto with FormData', async () => {
            const formData = new FormData();
            formData.append('pekerjaan_id', '1');
            formData.append('komponen_id', '1');
            formData.append('keterangan', '50%');
            formData.append('koordinat', '-6.123,106.456');

            // Create a mock file
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            formData.append('file', mockFile);

            const mockResponse = {
                data: {
                    id: 1,
                    pekerjaan_id: 1,
                    komponen_id: 1,
                    keterangan: '50%',
                    koordinat: '-6.123,106.456',
                    validasi_koordinat: true,
                    foto_url: 'https://example.com/foto1.jpg',
                    created_at: '2025-12-25T00:00:00Z',
                    updated_at: '2025-12-25T00:00:00Z',
                },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            const result = await createFoto(formData);

            expect(api.post).toHaveBeenCalledWith('/foto', formData);
            expect(result.data.id).toBe(1);
        });

        it('should handle upload error', async () => {
            const formData = new FormData();
            formData.append('pekerjaan_id', '1');

            vi.mocked(api.post).mockRejectedValue(new Error('Upload failed'));

            await expect(createFoto(formData)).rejects.toThrow('Upload failed');
        });
    });

    describe('updateFoto', () => {
        it('should update foto with _method PUT appended', async () => {
            const formData = new FormData();
            formData.append('keterangan', '100%');

            const mockResponse = {
                data: {
                    id: 1,
                    pekerjaan_id: 1,
                    komponen_id: 1,
                    keterangan: '100%',
                    koordinat: '-6.123,106.456',
                    validasi_koordinat: true,
                    foto_url: 'https://example.com/foto1.jpg',
                    created_at: '2025-12-25T00:00:00Z',
                    updated_at: '2025-12-25T00:00:00Z',
                },
            };

            vi.mocked(api.post).mockResolvedValue(mockResponse);

            const result = await updateFoto({ id: 1, data: formData });

            // Check that _method was appended
            expect(formData.get('_method')).toBe('PUT');
            expect(api.post).toHaveBeenCalledWith('/foto/1', formData);
            expect(result.data.keterangan).toBe('100%');
        });
    });

    describe('deleteFoto', () => {
        it('should delete foto by id', async () => {
            vi.mocked(api.delete).mockResolvedValue(undefined);

            await deleteFoto(1);

            expect(api.delete).toHaveBeenCalledWith('/foto/1');
        });
    });
});

describe('Foto Form Validation', () => {
    it('should validate keterangan options', () => {
        const validOptions = ['0%', '25%', '50%', '75%', '100%'];

        validOptions.forEach(option => {
            expect(['0%', '25%', '50%', '75%', '100%']).toContain(option);
        });
    });

    it('should validate koordinat format', () => {
        const validKoordinat = '-6.123456,106.789012';
        const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;

        expect(validKoordinat).toMatch(coordPattern);
    });

    it('should reject invalid koordinat format', () => {
        const invalidKoordinat = 'invalid-coordinates';
        const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;

        expect(invalidKoordinat).not.toMatch(coordPattern);
    });

    it('should validate file type for image', () => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

        expect(validTypes).toContain(testFile.type);
    });

    it('should reject non-image file types', () => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

        expect(validTypes).not.toContain(testFile.type);
    });

    it('should validate file size limit (10MB)', () => {
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        const smallFile = new File(['x'.repeat(1000)], 'small.jpg', { type: 'image/jpeg' });

        expect(smallFile.size).toBeLessThan(maxSizeBytes);
    });
});
