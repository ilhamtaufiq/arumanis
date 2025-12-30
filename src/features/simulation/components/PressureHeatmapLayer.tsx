import React, { useMemo, useEffect, useState } from 'react';
import HeatmapLayer from 'react-leaflet-heat-layer';
import { useMap } from 'react-leaflet';
import type { SimulationResult } from '../services/SimulationService';
import type { NetworkState } from '../hooks/useNetworkEditor';

interface PressureHeatmapLayerProps {
    simResults: SimulationResult | null;
    network: NetworkState;
    selectedTimeStep: number;
    visible: boolean;
}

export const PressureHeatmapLayer: React.FC<PressureHeatmapLayerProps> = ({
    simResults,
    network,
    selectedTimeStep,
    visible
}) => {
    const map = useMap();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    const points = useMemo((): { heatPoints: [number, number, number][]; maxPressure: number } | null => {
        if (!visible || !simResults || !simResults.timeSteps[selectedTimeStep]) {
            return null;
        }

        const currentStep = simResults.timeSteps[selectedTimeStep];
        const heatPoints: Array<[number, number, number]> = [];

        let maxPressure = 0;

        currentStep.junctions.forEach(res => {
            const node = network.junctions.find(j => j.id === res.id);
            if (node) {
                if (res.pressure > maxPressure) maxPressure = res.pressure;
                heatPoints.push([node.lat, node.lng, res.pressure]);
            }
        });

        return { heatPoints, maxPressure };
    }, [simResults, network, selectedTimeStep, visible]);

    // Only render HeatmapLayer if map is ready, visible, and component is mounted
    // Also check if map container still exists to avoid late unmount errors
    if (!isMounted || !map || !visible || !points || points.heatPoints.length === 0) {
        return null;
    }

    try {
        const container = map.getContainer();
        if (!container || !container.parentElement) return null;
    } catch (e) {
        return null;
    }

    return (
        <HeatmapLayer
            latlngs={points.heatPoints}
            radius={30}
            max={points.maxPressure > 0 ? points.maxPressure : 1.0}
            gradient={{
                0.0: 'blue',
                0.4: 'cyan',
                0.6: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }}
        />
    );
};
