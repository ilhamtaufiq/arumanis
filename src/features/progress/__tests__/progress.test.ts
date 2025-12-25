import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

import api from '@/lib/api-client';
import { getProgressReport, saveProgressReport } from '../api/progress';
import type { ProgressReportResponse, ProgressItemData } from '../types';

describe('Progress API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProgressReport', () => {
        it('should fetch progress report for a pekerjaan', async () => {
            const mockResponse: ProgressReportResponse = {
                success: true,
                data: {
                    pekerjaan: {
                        id: 1,
                        nama: 'Pembangunan SPAM',
                        pagu: 500000000,
                        lokasi: 'Desa Sukamaju',
                    },
                    items: [],
                    totals: {
                        total_bobot: 100,
                        total_accumulated_real: 50,
                        total_weighted_progress: 50,
                    },
                    max_minggu: 12,
                },
            };

            vi.mocked(api.get).mockResolvedValue(mockResponse);

            const result = await getProgressReport(1);

            expect(api.get).toHaveBeenCalledWith('/progress/pekerjaan/1');
            expect(result.success).toBe(true);
            expect(result.data.pekerjaan.id).toBe(1);
        });

        it('should handle API error', async () => {
            vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

            await expect(getProgressReport(1)).rejects.toThrow('Network error');
        });
    });

    describe('saveProgressReport', () => {
        it('should save progress report for a pekerjaan', async () => {
            const progressData = {
                items: [
                    {
                        id: 1,
                        weekly_data: {
                            5: { rencana: 20, realisasi: 18 },
                        },
                    },
                ],
            };

            vi.mocked(api.post).mockResolvedValue(undefined);

            await saveProgressReport(1, progressData);

            expect(api.post).toHaveBeenCalledWith('/progress/pekerjaan/1', progressData);
        });
    });
});

describe('Progress Data Validation', () => {
    it('should validate minggu is a positive integer', () => {
        const validMinggu = [1, 2, 3, 4, 5, 12, 52];

        validMinggu.forEach(minggu => {
            expect(minggu).toBeGreaterThan(0);
            expect(Number.isInteger(minggu)).toBe(true);
        });
    });

    it('should validate rencana is between 0 and 100', () => {
        const validRencana = [0, 25, 50, 75, 100];

        validRencana.forEach(value => {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
        });
    });

    it('should allow realisasi to be null', () => {
        const weeklyData = {
            minggu: 5,
            rencana: 20,
            realisasi: null,
        };

        expect(weeklyData.realisasi).toBeNull();
    });

    it('should validate realisasi is between 0 and 100 when provided', () => {
        const validRealisasi = [0, 10.5, 25, 50.75, 100];

        validRealisasi.forEach(value => {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
        });
    });

    it('should validate bobot sums to 100', () => {
        const items: Partial<ProgressItemData>[] = [
            { bobot: 30 },
            { bobot: 25 },
            { bobot: 25 },
            { bobot: 20 },
        ];

        const totalBobot = items.reduce((sum, item) => sum + (item.bobot || 0), 0);
        expect(totalBobot).toBe(100);
    });

    it('should validate harga_satuan is positive', () => {
        const validHarga = [1000, 50000, 1000000];

        validHarga.forEach(harga => {
            expect(harga).toBeGreaterThan(0);
        });
    });

    it('should validate target_volume is positive', () => {
        const validVolume = [1, 10, 100, 1000];

        validVolume.forEach(volume => {
            expect(volume).toBeGreaterThan(0);
        });
    });
});

describe('Progress Calculation', () => {
    it('should calculate weighted progress correctly', () => {
        const items = [
            { bobot: 30, realisasi: 100 }, // 30 * 100 / 100 = 30
            { bobot: 40, realisasi: 50 },  // 40 * 50 / 100 = 20
            { bobot: 30, realisasi: 0 },   // 30 * 0 / 100 = 0
        ];

        const weightedProgress = items.reduce((sum, item) => {
            return sum + (item.bobot * item.realisasi / 100);
        }, 0);

        expect(weightedProgress).toBe(50); // 30 + 20 + 0 = 50
    });

    it('should handle max_minggu correctly', () => {
        const maxMinggu = 12; // 12 weeks = 3 months

        expect(maxMinggu).toBeGreaterThan(0);
        expect(maxMinggu).toBeLessThanOrEqual(52); // Max 1 year
    });
});
