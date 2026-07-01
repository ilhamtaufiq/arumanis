import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

import api from '@/lib/api-client'
import {
    getPekerjaan,
    getPekerjaanById,
    createPekerjaan,
    updatePekerjaan,
    deletePekerjaan,
} from '../api/pekerjaan'
import type { Pekerjaan, PekerjaanResponse } from '../types'

const mockPekerjaan: Pekerjaan = {
    id: 1,
    kode_rekening: '5.1.01',
    nama_paket: 'Pembangunan SPAM Desa',
    pagu: 500_000_000,
    kecamatan_id: 1,
    desa_id: 2,
    kegiatan_id: 3,
    pengawas_id: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
}

describe('Pekerjaan API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getPekerjaan', () => {
        it('should fetch pekerjaan list without params', async () => {
            const mockResponse: PekerjaanResponse = {
                data: [mockPekerjaan],
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

            const result = await getPekerjaan()

            expect(api.get).toHaveBeenCalledWith('/pekerjaan', {
                params: {
                    page: undefined,
                    search: undefined,
                    tahun: undefined,
                    per_page: undefined,
                    kecamatan_id: undefined,
                    kegiatan_id: undefined,
                    tag_id: undefined,
                    pengawas_id: undefined,
                    sort_by: undefined,
                    sort_direction: undefined,
                },
            })
            expect(result).toEqual(mockResponse)
        })

        it('should normalize zero filter ids to undefined', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: [], links: {}, meta: {} } as PekerjaanResponse)

            await getPekerjaan({
                page: 1,
                kecamatan_id: 0,
                kegiatan_id: 0,
                tag_id: 0,
                pengawas_id: 0,
                search: 'spam',
                tahun: '2026',
                sort_by: 'nama_paket',
                sort_direction: 'asc',
            })

            expect(api.get).toHaveBeenCalledWith('/pekerjaan', {
                params: {
                    page: 1,
                    search: 'spam',
                    tahun: '2026',
                    per_page: undefined,
                    kecamatan_id: undefined,
                    kegiatan_id: undefined,
                    tag_id: undefined,
                    pengawas_id: undefined,
                    sort_by: 'nama_paket',
                    sort_direction: 'asc',
                },
            })
        })
    })

    describe('getPekerjaanById', () => {
        it('should fetch a single pekerjaan by id', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: mockPekerjaan })

            const result = await getPekerjaanById(1)

            expect(api.get).toHaveBeenCalledWith('/pekerjaan/1')
            expect(result.data).toEqual(mockPekerjaan)
        })
    })

    describe('createPekerjaan', () => {
        it('should create a new pekerjaan', async () => {
            const payload = {
                kode_rekening: '5.1.01',
                nama_paket: 'Pembangunan SPAM Desa',
                pagu: 500_000_000,
                kecamatan_id: 1,
                desa_id: 2,
                kegiatan_id: 3,
            }

            vi.mocked(api.post).mockResolvedValue({ data: mockPekerjaan })

            const result = await createPekerjaan(payload)

            expect(api.post).toHaveBeenCalledWith('/pekerjaan', payload)
            expect(result.data).toEqual(mockPekerjaan)
        })
    })

    describe('updatePekerjaan', () => {
        it('should update an existing pekerjaan', async () => {
            const payload = { nama_paket: 'Pembangunan SPAM Desa (Revisi)' }

            vi.mocked(api.put).mockResolvedValue({ data: { ...mockPekerjaan, ...payload } })

            const result = await updatePekerjaan(1, payload)

            expect(api.put).toHaveBeenCalledWith('/pekerjaan/1', payload)
            expect(result.data.nama_paket).toBe(payload.nama_paket)
        })
    })

    describe('deletePekerjaan', () => {
        it('should delete a pekerjaan by id', async () => {
            vi.mocked(api.delete).mockResolvedValue(undefined)

            await deletePekerjaan(1)

            expect(api.delete).toHaveBeenCalledWith('/pekerjaan/1')
        })
    })
})