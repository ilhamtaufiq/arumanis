import { describe, expect, it } from 'vitest'
import { buildInverseMaskLatLngs, getBoundaryGeometry, ringToLatLngs } from '../spm-map-mask'

describe('spm-map-mask', () => {
    it('converts geojson ring to leaflet latlngs', () => {
        const latLngs = ringToLatLngs([
            [106.5, -6.8],
            [107.1, -6.8],
        ])

        expect(latLngs[0].lat).toBe(-6.8)
        expect(latLngs[0].lng).toBe(106.5)
    })

    it('builds inverse mask with outer ring and hole', () => {
        const mask = buildInverseMaskLatLngs({
            type: 'Polygon',
            coordinates: [
                [
                    [106.5, -6.8],
                    [107.1, -6.8],
                    [107.1, -7.2],
                    [106.5, -7.2],
                    [106.5, -6.8],
                ],
            ],
        })

        expect(Array.isArray(mask)).toBe(true)
        expect(mask).toHaveLength(2)
    })

    it('extracts polygon boundary geometry', () => {
        const geometry = getBoundaryGeometry({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [106.5, -6.8],
                                [107.1, -6.8],
                                [107.1, -7.2],
                                [106.5, -7.2],
                                [106.5, -6.8],
                            ],
                        ],
                    },
                },
            ],
        })

        expect(geometry?.type).toBe('Polygon')
    })
})