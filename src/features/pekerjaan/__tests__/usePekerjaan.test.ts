import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/test/query-client-wrapper'

vi.mock('@/lib/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
    ApiError: class ApiError extends Error {},
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

import api from '@/lib/api-client'
import { usePekerjaanList } from '../hooks/usePekerjaan'
import type { PekerjaanResponse } from '../types'

describe('usePekerjaanList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch and expose pekerjaan list data', async () => {
        const mockResponse: PekerjaanResponse = {
            data: [
                {
                    id: 1,
                    kode_rekening: '5.1.01',
                    nama_paket: 'Pembangunan SPAM Desa',
                    pagu: 500_000_000,
                    kecamatan_id: 1,
                    desa_id: 2,
                    kegiatan_id: 3,
                    created_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                },
            ],
            links: { first: '', last: '', prev: null, next: null },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                links: [],
                path: '/api/pekerjaan',
                per_page: 15,
                to: 1,
                total: 1,
            },
        }

        vi.mocked(api.get).mockResolvedValue(mockResponse)

        const { result } = renderHook(
            () => usePekerjaanList({ page: 1, tahun: '2026' }),
            { wrapper: createQueryWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.data).toHaveLength(1)
        expect(result.current.data?.data[0].nama_paket).toBe('Pembangunan SPAM Desa')
        expect(api.get).toHaveBeenCalledWith('/pekerjaan', expect.objectContaining({
            params: expect.objectContaining({ page: 1, tahun: '2026' }),
        }))
    })
})