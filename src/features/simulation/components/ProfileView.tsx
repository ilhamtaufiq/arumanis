import { useState, useMemo, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from 'recharts'
import { TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react'
import type { NetworkState } from '../hooks/useNetworkEditor'
import type { SimulationResult } from '../services/SimulationService'
import { findPath } from '../utils/graph-utils'

interface ProfileViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    network: NetworkState
    simResults: SimulationResult | null
    selectedTimeStep: number
    defaultStartNode?: string | null
    defaultEndNode?: string | null
}

export function ProfileView({
    open,
    onOpenChange,
    network,
    simResults,
    selectedTimeStep,
    defaultStartNode,
    defaultEndNode
}: ProfileViewProps) {
    const [startNode, setStartNode] = useState<string>('')
    const [endNode, setEndNode] = useState<string>('')
    const [path, setPath] = useState<{ nodes: string[], links: string[] } | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Reset selection when dialog opens or defaults change
    useEffect(() => {
        if (open) {
            if (defaultStartNode) setStartNode(defaultStartNode)
            if (defaultEndNode) setEndNode(defaultEndNode)
        }
    }, [open, defaultStartNode, defaultEndNode])

    // Generate path when start/end nodes change
    useEffect(() => {
        if (!startNode || !endNode || startNode === endNode) {
            setPath(null)
            return
        }

        const result = findPath(network, startNode, endNode)
        if (result) {
            setPath(result)
            setError(null)
        } else {
            setPath(null)
            setError('No path found between selected nodes')
        }
    }, [startNode, endNode, network])

    const allNodes = useMemo(() => [
        ...network.junctions,
        ...network.reservoirs,
        ...network.tanks
    ].sort((a, b) => a.id.localeCompare(b.id)), [network])

    const chartData = useMemo(() => {
        if (!path) return []

        const data: any[] = []
        let cumulativeDistance = 0
        const currentStepData = simResults?.timeSteps[selectedTimeStep]

        // Process first node
        const firstNodeId = path.nodes[0]
        const firstNode = allNodes.find(n => n.id === firstNodeId)

        if (!firstNode) return []

        let elevation = 0
        if ('elevation' in firstNode) elevation = (firstNode as any).elevation
        if ('head' in firstNode) elevation = (firstNode as any).head // For reservoirs (base head) - actually for reservoirs head is total head
        if ('baseHead' in firstNode) elevation = (firstNode as any).baseHead // If we had that property, but we use head for reservoirs

        // For reservoirs, 'head' property is the total head (elevation + water level)
        // Ideally we should have elevation separate, but our interface uses 'head' for reservoirs
        // Let's assume for reservoir, elevation is head (or we need separate field)
        // For tank, we have elevation.

        // Correct elevation logic based on type
        if ('elevation' in firstNode) {
            elevation = (firstNode as any).elevation
        } else if ('head' in firstNode) {
            // Reservoir
            // Since we don't have bottom elevation for reservoir in our simple model,
            // we can assume head is the water surface.
            // For profile plotting, often we plot the bottom elevation.
            // Let's just use head as elevation for now or 0 if unknown.
            elevation = (firstNode as any).head - 10 // Arbitrary bottom? No, let's just show HGL
        }

        let hgl = elevation
        let pressure = 0

        // Get sim result for first node
        if (currentStepData) {
            const nodeResult = currentStepData.junctions.find((j: any) => j.id === firstNodeId)
            if (nodeResult) {
                hgl = nodeResult.head
                pressure = nodeResult.pressure
            } else {
                // Check if it's a source (reservoir/tank) that might not be in junction results depending on engine
                // But usually EPANET-JS returns all nodes in 'nodes' array.
                // Our parser puts them in junctions.
            }
        }

        data.push({
            name: firstNodeId,
            distance: 0,
            elevation: elevation,
            hgl: hgl,
            pressure: pressure,
            nodeType: 'type' in firstNode ? (firstNode as any).type : 'node'
        })

        // Process rest of the path
        for (let i = 0; i < path.links.length; i++) {
            const linkId = path.links[i]
            const nextNodeId = path.nodes[i + 1]

            // Find link to get length
            const link = network.pipes.find(p => p.id === linkId)
            const length = link ? link.length : 0 // Pumps/Valves have 0 length in profile usually

            cumulativeDistance += length

            const node = allNodes.find(n => n.id === nextNodeId)
            if (node) {
                let elev = 0
                if ('elevation' in node) elev = (node as any).elevation
                else if ('head' in node) elev = (node as any).head // Reservoir

                let nodeHgl = elev
                let nodePressure = 0

                if (currentStepData) {
                    const res = currentStepData.junctions.find((j: any) => j.id === nextNodeId)
                    if (res) {
                        nodeHgl = res.head
                        nodePressure = res.pressure
                    }
                }

                data.push({
                    name: nextNodeId,
                    distance: cumulativeDistance,
                    elevation: elev,
                    hgl: nodeHgl,
                    pressure: nodePressure
                })
            }
        }

        return data
    }, [path, allNodes, network.pipes, simResults, selectedTimeStep])

    const { minElevation, maxElevation } = useMemo(() => {
        if (chartData.length === 0) return { minElevation: 0, maxElevation: 100 }

        const elevations = chartData.map(d => d.elevation)
        const hgls = chartData.map(d => d.hgl)
        const allValues = [...elevations, ...hgls]

        const min = Math.min(...allValues)
        const max = Math.max(...allValues)
        const padding = (max - min) * 0.1

        return {
            minElevation: Math.floor(min - padding),
            maxElevation: Math.ceil(max + padding)
        }
    }, [chartData])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[80vh] flex flex-col z-[9999]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Profile View
                    </DialogTitle>
                    <DialogDescription>
                        Longitudinal section view showing elevation and hydraulic grade line
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col gap-2 flex-1">
                        <Label>Start Node</Label>
                        <Select value={startNode} onValueChange={setStartNode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select start node" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[10000] max-h-60">
                                {allNodes.map(node => (
                                    <SelectItem key={node.id} value={node.id}>
                                        {node.name || node.id} ({('type' in node) ? (node as any).type : 'Node'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-center pt-6">
                        <Button variant="ghost" size="icon" onClick={() => {
                            const temp = startNode
                            setStartNode(endNode)
                            setEndNode(temp)
                        }}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        <Label>End Node</Label>
                        <Select value={endNode} onValueChange={setEndNode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select end node" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[10000] max-h-60">
                                {allNodes.map(node => (
                                    <SelectItem key={node.id} value={node.id}>
                                        {node.name || node.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="flex-1 min-h-0 w-full mt-4">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="distance"
                                    label={{ value: 'Distance (m)', position: 'insideBottom', offset: -10 }}
                                    unit="m"
                                />
                                <YAxis
                                    domain={[minElevation, maxElevation]}
                                    label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white dark:bg-slate-900 p-3 border rounded shadow-lg text-xs">
                                                    <p className="font-bold mb-1">{data.name}</p>
                                                    <p>Distance: {data.distance.toFixed(1)} m</p>
                                                    <p className="text-amber-600">Elevation: {data.elevation.toFixed(2)} m</p>
                                                    {data.hgl !== undefined && (
                                                        <p className="text-blue-600">HGL: {data.hgl.toFixed(2)} m</p>
                                                    )}
                                                    {data.pressure !== undefined && (
                                                        <p className="text-slate-500">Pressure: {data.pressure.toFixed(2)} m</p>
                                                    )}
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend verticalAlign="top" height={36} />

                                {/* Elevation Area (Terrain) */}
                                <Area
                                    type="monotone"
                                    dataKey="elevation"
                                    stroke="#d97706"
                                    fill="#fcd34d"
                                    fillOpacity={0.3}
                                    name="Elevation"
                                />

                                {/* HGL Line */}
                                {simResults && (
                                    <Line
                                        type="monotone"
                                        dataKey="hgl"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        name="Hydraulic Grade Line"
                                        dot={{ r: 3 }}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                            Select start and end nodes to view profile
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
