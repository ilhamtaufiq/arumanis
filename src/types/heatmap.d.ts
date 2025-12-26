declare module 'react-leaflet-heat-layer' {
    import { FC } from 'react';

    interface HeatmapLayerProps {
        /** Array of [lat, lng] or [lat, lng, intensity] points */
        latlngs: Array<[number, number] | [number, number, number]>;
        /** Radius of each "point" of the heatmap (default: 25) */
        radius?: number;
        /** Amount of blur (default: 15) */
        blur?: number;
        /** Zoom level where the points reach maximum intensity (default: 18) */
        maxZoom?: number;
        /** Maximum point intensity (default: 1.0) */
        max?: number;
        /** Minimum opacity the heat will start at (default: 0.05) */
        minOpacity?: number;
        /** Color gradient config (from 0 to 1) */
        gradient?: Record<number, string>;
    }

    const HeatmapLayer: FC<HeatmapLayerProps>;
    export default HeatmapLayer;
}

declare module 'leaflet.heat';
