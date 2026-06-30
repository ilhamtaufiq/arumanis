import L from 'leaflet'

const MASK_PANE = 'landingSpmMaskPane'
const MASK_FILL = '#020617'
const MASK_FILL_OPACITY = 0.94

/** Rough Java–Bali bbox — outer ring for inverse mask polygon. */
const MASK_OUTER_RING: L.LatLngExpression[] = [
    [-12, 104],
    [-12, 112],
    [-4, 112],
    [-4, 104],
]

export function ringToLatLngs(ring: number[][], reverse = false) {
    const coords = reverse ? [...ring].reverse() : ring
    return coords.map(([lng, lat]) => L.latLng(lat, lng))
}

export function buildInverseMaskLatLngs(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon) {
    if (geometry.type === 'Polygon') {
        const [exterior, ...interiorRings] = geometry.coordinates
        const rings = [ringToLatLngs(exterior, true)]
        for (const ring of interiorRings) {
            rings.push(ringToLatLngs(ring, false))
        }
        return [MASK_OUTER_RING, ...rings]
    }

    return geometry.coordinates.map((polygonCoords) => [
        MASK_OUTER_RING,
        ...polygonCoords.map((ring) => ringToLatLngs(ring, true)),
    ])
}

export function ensureMaskPane(map: L.Map) {
    if (map.getPane(MASK_PANE)) return MASK_PANE

    const pane = map.createPane(MASK_PANE)
    pane.style.zIndex = '350'
    pane.style.pointerEvents = 'none'
    return MASK_PANE
}

export function addCianjurMaskLayer(
    map: L.Map,
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
) {
    const pane = ensureMaskPane(map)
    const maskLatLngs = buildInverseMaskLatLngs(geometry)
    const layers: L.Polygon[] = []

    const addMask = (latlngs: L.LatLngExpression[] | L.LatLngExpression[][]) => {
        const layer = L.polygon(latlngs, {
            pane,
            interactive: false,
            stroke: true,
            color: 'rgba(148, 163, 184, 0.28)',
            weight: 1.25,
            fillColor: MASK_FILL,
            fillOpacity: MASK_FILL_OPACITY,
            fillRule: 'evenodd',
            className: 'landing-spm-map-mask',
        })
        layer.addTo(map)
        layers.push(layer)
    }

    if (geometry.type === 'Polygon') {
        addMask(maskLatLngs as L.LatLngExpression[][])
    } else {
        for (const polygonLatLngs of maskLatLngs as L.LatLngExpression[][][]) {
            addMask(polygonLatLngs)
        }
    }

    return () => {
        for (const layer of layers) {
            layer.remove()
        }
    }
}

export function getBoundaryGeometry(
    boundary?: GeoJSON.FeatureCollection | null,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
    const geometry = boundary?.features?.[0]?.geometry
    if (!geometry) return null
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        return geometry
    }
    return null
}