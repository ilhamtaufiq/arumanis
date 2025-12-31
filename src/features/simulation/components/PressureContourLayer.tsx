import React, { useMemo, useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { contours } from 'd3-contour';
import type { SimulationResult } from '../services/SimulationService';
import type { NetworkState } from '../hooks/useNetworkEditor';
import type { Feature, FeatureCollection, MultiPolygon } from 'geojson';

interface PressureContourLayerProps {
    simResults: SimulationResult | null;
    network: NetworkState;
    selectedTimeStep: number;
    visible: boolean;
}

// Color scale for pressure (matching the existing legend) - more visible opacity
const CONTOUR_COLORS = [
    { threshold: 0.1, color: '#3b82f6', opacity: 0.35 },  // Blue - low
    { threshold: 0.3, color: '#06b6d4', opacity: 0.40 },  // Cyan
    { threshold: 0.5, color: '#22c55e', opacity: 0.45 },  // Green
    { threshold: 0.7, color: '#eab308', opacity: 0.50 },  // Yellow
    { threshold: 0.9, color: '#ef4444', opacity: 0.55 },  // Red - high
];

// Inverse Distance Weighting interpolation
function idwInterpolation(
    points: { x: number; y: number; value: number }[],
    gridX: number,
    gridY: number,
    power: number = 2
): number {
    let numerator = 0;
    let denominator = 0;

    for (const point of points) {
        const distance = Math.sqrt((gridX - point.x) ** 2 + (gridY - point.y) ** 2);

        if (distance < 0.0001) {
            return point.value; // If we're on a point, return its value
        }

        const weight = 1 / Math.pow(distance, power);
        numerator += weight * point.value;
        denominator += weight;
    }

    return denominator > 0 ? numerator / denominator : 0;
}

export const PressureContourLayer: React.FC<PressureContourLayerProps> = ({
    simResults,
    network,
    selectedTimeStep,
    visible
}) => {
    const map = useMap();
    const [isMounted, setIsMounted] = useState(false);
    const [mapBounds, setMapBounds] = useState<{
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
        width: number;
        height: number;
    } | null>(null);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Update bounds when map moves or zooms
    useEffect(() => {
        if (!map) return;

        const updateBounds = () => {
            const bounds = map.getBounds();
            const size = map.getSize();
            setMapBounds({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
                width: size.x,
                height: size.y
            });
        };

        updateBounds();
        map.on('moveend', updateBounds);
        map.on('zoomend', updateBounds);

        return () => {
            map.off('moveend', updateBounds);
            map.off('zoomend', updateBounds);
        };
    }, [map]);

    // Generate contour GeoJSON using proper value interpolation
    const contourGeoJson = useMemo((): FeatureCollection | null => {
        if (!visible || !simResults || !simResults.timeSteps[selectedTimeStep] || !mapBounds) {
            return null;
        }

        const currentStep = simResults.timeSteps[selectedTimeStep];

        // Collect pressure points with coordinates
        const pressurePoints: { lat: number; lng: number; pressure: number }[] = [];
        let minPressure = Infinity;
        let maxPressure = -Infinity;

        currentStep.junctions.forEach(res => {
            const node = network.junctions.find(j => j.id === res.id);
            if (node) {
                pressurePoints.push({
                    lat: node.lat,
                    lng: node.lng,
                    pressure: res.pressure
                });
                minPressure = Math.min(minPressure, res.pressure);
                maxPressure = Math.max(maxPressure, res.pressure);
            }
        });

        if (pressurePoints.length < 3) {
            return null;
        }

        const pressureRange = maxPressure - minPressure || 1;

        // Grid resolution (lower = faster, higher = more detail)
        const GRID_SIZE = 50;

        // Calculate network extent (not map extent - focus on data area)
        const lats = pressurePoints.map(p => p.lat);
        const lngs = pressurePoints.map(p => p.lng);
        const dataMinLat = Math.min(...lats);
        const dataMaxLat = Math.max(...lats);
        const dataMinLng = Math.min(...lngs);
        const dataMaxLng = Math.max(...lngs);

        // Add padding around the network
        const latPadding = (dataMaxLat - dataMinLat) * 0.2;
        const lngPadding = (dataMaxLng - dataMinLng) * 0.2;
        const extentMinLat = dataMinLat - latPadding;
        const extentMaxLat = dataMaxLat + latPadding;
        const extentMinLng = dataMinLng - lngPadding;
        const extentMaxLng = dataMaxLng + lngPadding;

        const latStep = (extentMaxLat - extentMinLat) / GRID_SIZE;
        const lngStep = (extentMaxLng - extentMinLng) / GRID_SIZE;

        // Convert points to grid coordinates
        const gridPoints = pressurePoints.map(p => ({
            x: (p.lng - extentMinLng) / lngStep,
            y: (extentMaxLat - p.lat) / latStep, // Invert Y for grid
            value: (p.pressure - minPressure) / pressureRange
        }));

        // Create interpolated grid using IDW
        const gridWidth = GRID_SIZE;
        const gridHeight = GRID_SIZE;
        const values: number[] = new Array(gridWidth * gridHeight);

        for (let j = 0; j < gridHeight; j++) {
            for (let i = 0; i < gridWidth; i++) {
                values[j * gridWidth + i] = idwInterpolation(gridPoints, i, j, 2);
            }
        }

        // Generate contours from the interpolated grid
        const contourGenerator = contours()
            .size([gridWidth, gridHeight])
            .thresholds(CONTOUR_COLORS.map(c => c.threshold));

        const generatedContours = contourGenerator(values);

        // Convert pixel coordinates back to lat/lng
        const toLatLng = (x: number, y: number): [number, number] => {
            const lng = extentMinLng + (x / gridWidth) * (extentMaxLng - extentMinLng);
            const lat = extentMaxLat - (y / gridHeight) * (extentMaxLat - extentMinLat);
            return [lng, lat]; // GeoJSON uses [lng, lat]
        };

        // Convert contours to GeoJSON features
        const features: Feature<MultiPolygon>[] = generatedContours.map((contour, index) => {
            const transformedCoordinates = contour.coordinates.map(polygon =>
                polygon.map(ring =>
                    ring.map(([x, y]) => toLatLng(x, y))
                )
            );

            return {
                type: 'Feature' as const,
                properties: {
                    value: contour.value,
                    color: CONTOUR_COLORS[index]?.color || '#3b82f6',
                    opacity: CONTOUR_COLORS[index]?.opacity || 0.3,
                    pressureValue: minPressure + contour.value * pressureRange
                },
                geometry: {
                    type: 'MultiPolygon' as const,
                    coordinates: transformedCoordinates
                }
            };
        });

        return {
            type: 'FeatureCollection',
            features
        };
    }, [simResults, network, selectedTimeStep, visible, mapBounds]);

    // Style function for GeoJSON
    const getStyle = (feature: Feature | undefined) => {
        if (!feature?.properties) {
            return {
                fillColor: '#3b82f6',
                fillOpacity: 0.3,
                weight: 1.5,
                color: '#3b82f6',
                opacity: 0.7
            };
        }

        return {
            fillColor: feature.properties.color,
            fillOpacity: feature.properties.opacity,
            weight: 1,
            color: feature.properties.color,
            opacity: 0.8
        };
    };

    if (!isMounted || !map || !visible || !contourGeoJson || contourGeoJson.features.length === 0) {
        return null;
    }

    try {
        const container = map.getContainer();
        if (!container || !container.parentElement) return null;
    } catch {
        return null;
    }

    return (
        <GeoJSON
            key={`contour-${selectedTimeStep}-${mapBounds?.width}-${mapBounds?.height}`}
            data={contourGeoJson}
            style={getStyle}
        />
    );
};
