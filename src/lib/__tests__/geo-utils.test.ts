import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isPointInPolygon, isPointInMultiPolygon, validatePointInFeature, getKecamatanGeoJson } from '../geo-utils'

describe('geo-utils', () => {
    const simplePolygon = [
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
        ]
    ]

    describe('isPointInPolygon', () => {
        it('should return true for point inside polygon', () => {
            expect(isPointInPolygon([5, 5], simplePolygon)).toBe(true)
        })

        it('should return false for point outside polygon', () => {
            expect(isPointInPolygon([15, 15], simplePolygon)).toBe(false)
        })
    })

    describe('isPointInMultiPolygon', () => {
        const multiPolygon = [simplePolygon, [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]]]
        it('should return true for point inside any polygon in multi-polygon', () => {
            expect(isPointInMultiPolygon([5, 5], multiPolygon)).toBe(true)
            expect(isPointInMultiPolygon([25, 25], multiPolygon)).toBe(true)
        })

        it('should return false for point outside all polygons', () => {
            expect(isPointInMultiPolygon([15, 15], multiPolygon)).toBe(false)
        })
    })

    describe('validatePointInFeature', () => {
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: simplePolygon
            }
        }

        it('should validate point in feature correctly', () => {
            expect(validatePointInFeature(5, 5, feature)).toBe(true)
            expect(validatePointInFeature(15, 15, feature)).toBe(false)
        })

        it('should return false for invalid feature', () => {
            expect(validatePointInFeature(5, 5, null)).toBe(false)
            expect(validatePointInFeature(5, 5, {})).toBe(false)
        })
    })

    describe('getKecamatanGeoJson', () => {
        beforeEach(() => {
            vi.clearAllMocks()
            global.fetch = vi.fn()
        })

        it('should fetch and return geojson when found in manifest', async () => {
            const mockManifest = [{ Name: '123_testkecamatan.geojson' }]
            const mockGeoJson = { type: 'FeatureCollection', features: [] }

            vi.mocked(fetch)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockManifest
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockGeoJson
                } as Response)

            const result = await getKecamatanGeoJson('Test Kecamatan')
            expect(result).toEqual(mockGeoJson)
            expect(fetch).toHaveBeenCalledWith('/geojson/kecamatan/manifest.json')
            expect(fetch).toHaveBeenCalledWith('/geojson/kecamatan/123_testkecamatan.geojson')
        })

        it('should return null and log error when fetch fails', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false
            } as Response)

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
            const result = await getKecamatanGeoJson('Any')

            expect(result).toBeNull()
            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })
    })
})
