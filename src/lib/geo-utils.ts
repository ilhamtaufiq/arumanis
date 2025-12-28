/**
 * Geo-fencing utilities for project coordinate validation
 */

/**
 * Checks if a point [longitude, latitude] is inside a polygon
 * coordinates is an array of rings, each ring is an array of [lng, lat]
 */
export function isPointInPolygon(point: [number, number], polygon: number[][][]) {
    const [x, y] = point;
    let inside = false;

    // Polygon in GeoJSON can be a simple ring or multiple rings (with holes)
    // For simplicity, we check against the outer ring (first element)
    const ring = polygon[0];

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
}

/**
 * Checks if a point is inside a MultiPolygon
 */
export function isPointInMultiPolygon(point: [number, number], multiPolygon: number[][][][]) {
    return multiPolygon.some(polygon => isPointInPolygon(point, polygon));
}

/**
 * Validates if coordinates are within a specific GeoJSON feature
 */
export function validatePointInFeature(lat: number, lng: number, feature: any): boolean {
    if (!feature || !feature.geometry) return false;

    const point: [number, number] = [lng, lat];
    const { type, coordinates } = feature.geometry;

    if (type === 'Polygon') {
        return isPointInPolygon(point, coordinates);
    } else if (type === 'MultiPolygon') {
        return isPointInMultiPolygon(point, coordinates);
    }

    return false;
}

/**
 * Helper to fetch GeoJSON for a kecamatan
 */
export async function getKecamatanGeoJson(kecamatanName: string) {
    try {
        const manifestResponse = await fetch('/geojson/kecamatan/manifest.json');
        if (!manifestResponse.ok) throw new Error('Failed to load GeoJSON manifest');

        const manifest: { Name: string }[] = await manifestResponse.json();
        const searchName = kecamatanName.toLowerCase().replace(/\s+/g, '');

        // Find filename that contains the kecamatan name (ignoring the ID prefix)
        const fileEntry = manifest.find(entry =>
            entry.Name.toLowerCase().includes(`_${searchName}.geojson`) ||
            entry.Name.toLowerCase() === `${searchName}.geojson`
        );

        if (!fileEntry) {
            throw new Error(`Kecamatan GeoJSON not found in manifest: ${kecamatanName}`);
        }

        const response = await fetch(`/geojson/kecamatan/${fileEntry.Name}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch GeoJSON file: ${fileEntry.Name}`);
        }
        return await response.json();
    } catch (error) {
        console.error('GeoJSON Utility Error:', error);
        return null;
    }
}
