import { Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { SimulationResult } from '../services/SimulationService'

interface SimulationLayerProps {
    results: SimulationResult | null
    coordinates: Record<string, [number, number]>
    pipes: { id: string, from: string, to: string }[]
}

const junctionIcon = L.divIcon({
    className: 'custom-junction-icon',
    html: '<div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
})

export function SimulationLayer({ results, coordinates, pipes }: SimulationLayerProps) {
    if (!results || results.timeSteps.length === 0) return null

    // Use first timestep for display (could be extended to accept selected timestep)
    const currentData = results.timeSteps[0]

    const getPipeColor = (flow: number) => {
        if (Math.abs(flow) > 10) return '#ef4444' // Red for high flow
        if (Math.abs(flow) > 5) return '#f59e0b'  // Orange
        return '#3b82f6'                         // Blue
    }

    return (
        <>
            {/* Render Pipes (Links) */}
            {pipes.map(pipe => {
                const fromCoord = coordinates[pipe.from]
                const toCoord = coordinates[pipe.to]
                const result = currentData.links.find(l => l.id === pipe.id)

                if (!fromCoord || !toCoord) return null

                return (
                    <Polyline
                        key={pipe.id}
                        positions={[fromCoord, toCoord]}
                        color={result ? getPipeColor(result.flow) : '#94a3b8'}
                        weight={result ? 4 : 2}
                        opacity={0.8}
                    >
                        <Popup>
                            <div className="p-1 space-y-1">
                                <div className="font-bold border-b pb-1">Link: {pipe.id}</div>
                                {result && (
                                    <div className="text-xs space-y-0.5">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Flow:</span>
                                            <span className="font-medium">{result.flow.toFixed(2)} LPS</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Velocity:</span>
                                            <span className="font-medium">{result.velocity.toFixed(2)} m/s</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Polyline>
                )
            })}

            {/* Render Junctions */}
            {currentData.junctions.map(j => {
                const coord = coordinates[j.id]
                if (!coord) return null

                return (
                    <Marker key={j.id} position={coord} icon={junctionIcon}>
                        <Popup>
                            <div className="p-1 space-y-1">
                                <div className="font-bold border-b pb-1">Junction: {j.id}</div>
                                <div className="text-xs space-y-0.5">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">Pressure:</span>
                                        <span className="font-medium text-blue-600">{j.pressure.toFixed(2)} m</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">Head:</span>
                                        <span className="font-medium">{j.head.toFixed(2)} m</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </>
    )
}
