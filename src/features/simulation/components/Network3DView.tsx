import { useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Text, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Box, RotateCcw } from 'lucide-react'
import type { NetworkState } from '../hooks/useNetworkEditor'
import type { SimulationResult } from '../services/SimulationService'

interface Network3DViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    network: NetworkState
    simResults: SimulationResult | null
    selectedTimeStep: number
}

interface NodeMeshProps {
    position: [number, number, number]
    type: 'junction' | 'reservoir' | 'tank'
    name: string
    pressure?: number
    showLabels: boolean
}

interface PipeMeshProps {
    start: [number, number, number]
    end: [number, number, number]
    vertices: [number, number][]
    diameter: number
    flow?: number
    center: [number, number]
}

// Scale factors for visualization
const SCALE = {
    horizontal: 1000, // Scale down lat/lng
    vertical: 1, // Keep elevation as-is or scale
    pipeRadius: 0.002, // Base pipe radius multiplier
}

// Color helpers
const getPressureColor = (pressure: number | undefined, min: number, max: number): string => {
    if (pressure === undefined) return '#6366f1'
    const normalized = Math.max(0, Math.min(1, (pressure - min) / (max - min || 1)))

    if (normalized < 0.25) return '#3b82f6' // Blue
    if (normalized < 0.5) return '#06b6d4'  // Cyan
    if (normalized < 0.75) return '#22c55e' // Green
    return '#eab308' // Yellow
}

const getFlowColor = (flow: number | undefined): string => {
    if (flow === undefined) return '#8b5cf6'
    const absFlow = Math.abs(flow)
    if (absFlow < 1) return '#3b82f6'
    if (absFlow < 5) return '#06b6d4'
    if (absFlow < 10) return '#22c55e'
    return '#eab308'
}

// Node component
function NodeMesh({ position, type, name, pressure, showLabels }: NodeMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    const color = useMemo(() => {
        switch (type) {
            case 'reservoir': return '#10b981'
            case 'tank': return '#f59e0b'
            default: return getPressureColor(pressure, 0, 100)
        }
    }, [type, pressure])

    // Increased sizes to be visible at scene scale
    const size = useMemo(() => {
        switch (type) {
            case 'reservoir': return 1.5
            case 'tank': return 1.2
            default: return 0.8
        }
    }, [type])

    return (
        <group position={position}>
            {type === 'reservoir' ? (
                <mesh ref={meshRef}>
                    <cylinderGeometry args={[size, size * 1.5, size * 2, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ) : type === 'tank' ? (
                <mesh ref={meshRef}>
                    <cylinderGeometry args={[size, size, size * 3, 16]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ) : (
                <mesh ref={meshRef}>
                    <sphereGeometry args={[size, 16, 16]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )}
            {showLabels && (
                <Text
                    position={[0, size * 2 + 1, 0]}
                    fontSize={1.5}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {name}
                </Text>
            )}
        </group>
    )
}

// Pipe component using Line
function PipeMesh({ start, end, vertices, diameter, flow, center }: PipeMeshProps) {
    const color = getFlowColor(flow)
    const lineWidth = Math.max(1, Math.min(5, diameter / 100))

    // Build points array including vertices
    const points = useMemo(() => {
        const pts: [number, number, number][] = [start]

        // Add intermediate vertices (convert from lat/lng to 3D coords)
        // Note: vertices are [lat, lng], we need to interpolate elevation
        if (vertices.length > 0) {
            const elevDiff = end[1] - start[1]
            const totalSegments = vertices.length + 1

            vertices.forEach((v, i) => {
                const t = (i + 1) / totalSegments
                const interpElev = start[1] + elevDiff * t
                pts.push([
                    (v[1] - center[1]) * SCALE.horizontal, // lng -> x
                    interpElev * SCALE.vertical,           // elevation -> y
                    -(v[0] - center[0]) * SCALE.horizontal // lat -> z (inverted)
                ])
            })
        }

        pts.push(end)
        return pts
    }, [start, end, vertices, center])

    return (
        <Line
            points={points}
            color={color}
            lineWidth={lineWidth}
        />
    )
}

// Ground plane for reference
function GroundPlane({ size }: { size: number }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[size * 2, size * 2]} />
            <meshStandardMaterial
                color="#1e293b"
                opacity={0.5}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

// Grid helper
function GridHelper({ size }: { size: number }) {
    return (
        <gridHelper
            args={[size * 2, 20, '#334155', '#1e293b']}
            position={[0, 0, 0]}
        />
    )
}

// Camera controller
function CameraController({ resetTrigger }: { resetTrigger: number }) {
    const { camera } = useThree()

    useMemo(() => {
        if (resetTrigger > 0) {
            camera.position.set(0.5, 0.5, 0.5)
            camera.lookAt(0, 0, 0)
        }
    }, [resetTrigger, camera])

    return null
}

// Main 3D Scene
function NetworkScene({
    network,
    simResults,
    selectedTimeStep,
    showLabels,
    verticalExaggeration,
    resetTrigger
}: {
    network: NetworkState
    simResults: SimulationResult | null
    selectedTimeStep: number
    showLabels: boolean
    verticalExaggeration: number
    resetTrigger: number
}) {
    const currentTimeStep = simResults?.timeSteps?.[selectedTimeStep]

    // Calculate bounds for centering
    const { nodes3D, pipes3D, bounds, networkCenter } = useMemo(() => {
        const allNodes: {
            id: string
            name: string
            position: [number, number, number]
            type: 'junction' | 'reservoir' | 'tank'
            pressure?: number
        }[] = []

        let minX = Infinity, maxX = -Infinity
        let minY = Infinity, maxY = -Infinity
        let minZ = Infinity, maxZ = -Infinity
        let minLat = Infinity, maxLat = -Infinity
        let minLng = Infinity, maxLng = -Infinity

        // 1. First pass: find the geographic center
        const geoNodes = [...network.junctions, ...network.reservoirs, ...network.tanks]
        geoNodes.forEach(n => {
            minLat = Math.min(minLat, n.lat); maxLat = Math.max(maxLat, n.lat)
            minLng = Math.min(minLng, n.lng); maxLng = Math.max(maxLng, n.lng)
        })

        const centerLat = geoNodes.length > 0 ? (minLat + maxLat) / 2 : 0
        const centerLng = geoNodes.length > 0 ? (minLng + maxLng) / 2 : 0

        // 2. Second pass: transform coordinates relative to center
        // Process junctions
        network.junctions.forEach(j => {
            const result = currentTimeStep?.junctions.find(r => r.id === j.id)
            const x = (j.lng - centerLng) * SCALE.horizontal
            const y = j.elevation * SCALE.vertical * verticalExaggeration / 100
            const z = -(j.lat - centerLat) * SCALE.horizontal

            allNodes.push({
                id: j.id,
                name: j.name,
                position: [x, y, z],
                type: 'junction',
                pressure: result?.pressure
            })

            minX = Math.min(minX, x); maxX = Math.max(maxX, x)
            minY = Math.min(minY, y); maxY = Math.max(maxY, y)
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
        })

        // Process reservoirs
        network.reservoirs.forEach(r => {
            const x = (r.lng - centerLng) * SCALE.horizontal
            const y = r.head * SCALE.vertical * verticalExaggeration / 100
            const z = -(r.lat - centerLat) * SCALE.horizontal

            allNodes.push({
                id: r.id,
                name: r.name,
                position: [x, y, z],
                type: 'reservoir'
            })

            minX = Math.min(minX, x); maxX = Math.max(maxX, x)
            minY = Math.min(minY, y); maxY = Math.max(maxY, y)
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
        })

        // Process tanks
        network.tanks.forEach(t => {
            const x = (t.lng - centerLng) * SCALE.horizontal
            const y = t.elevation * SCALE.vertical * verticalExaggeration / 100
            const z = -(t.lat - centerLat) * SCALE.horizontal

            allNodes.push({
                id: t.id,
                name: t.name,
                position: [x, y, z],
                type: 'tank'
            })

            minX = Math.min(minX, x); maxX = Math.max(maxX, x)
            minY = Math.min(minY, y); maxY = Math.max(maxY, y)
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
        })

        // Create node lookup
        const nodeMap = new Map(allNodes.map(n => [n.id, n]))

        // Process pipes
        const pipes: {
            id: string
            start: [number, number, number]
            end: [number, number, number]
            vertices: [number, number][]
            diameter: number
            flow?: number
        }[] = []

        network.pipes.forEach(p => {
            const fromNode = nodeMap.get(p.fromNode)
            const toNode = nodeMap.get(p.toNode)
            if (fromNode && toNode) {
                const result = currentTimeStep?.links.find(l => l.id === p.id)
                pipes.push({
                    id: p.id,
                    start: fromNode.position,
                    end: toNode.position,
                    vertices: p.vertices,
                    diameter: p.diameter,
                    flow: result?.flow
                })
            }
        })

        // Add pumps as pipes
        network.pumps.forEach(p => {
            const fromNode = nodeMap.get(p.fromNode)
            const toNode = nodeMap.get(p.toNode)
            if (fromNode && toNode) {
                pipes.push({
                    id: p.id,
                    start: fromNode.position,
                    end: toNode.position,
                    vertices: [],
                    diameter: 300, // Larger for visibility
                    flow: 0
                })
            }
        })

        const sizeX = maxX - minX || 0.1
        const sizeZ = maxZ - minZ || 0.1
        const size = Math.max(sizeX, sizeZ)

        return {
            nodes3D: allNodes,
            pipes3D: pipes,
            bounds: { minX, maxX, minY, maxY, minZ, maxZ, size },
            networkCenter: [centerLat, centerLng] as [number, number]
        }
    }, [network, currentTimeStep, verticalExaggeration])

    // Calculate center Y for camera positioning
    const centerY = (bounds.minY + bounds.maxY) / 2

    return (
        <>
            <CameraController resetTrigger={resetTrigger} />
            <PerspectiveCamera
                makeDefault
                position={[
                    bounds.size * 1.5,
                    centerY + bounds.size * 0.5,
                    bounds.size * 1.5
                ]}
            />
            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                target={[0, centerY, 0]}
                minDistance={0.1}
                maxDistance={bounds.size * 10}
            />

            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />

            {/* Ground and Grid - positioned at network's minimum elevation */}
            <group position={[0, bounds.minY - 0.01, 0]}>
                <GroundPlane size={bounds.size * 2} />
                <GridHelper size={bounds.size * 2} />
            </group>

            {/* Pipes */}
            {pipes3D.map(pipe => (
                <PipeMesh
                    key={pipe.id}
                    start={pipe.start}
                    end={pipe.end}
                    vertices={pipe.vertices}
                    diameter={pipe.diameter}
                    flow={pipe.flow}
                    center={networkCenter}
                />
            ))}

            {/* Nodes */}
            {nodes3D.map(node => (
                <NodeMesh
                    key={node.id}
                    position={node.position}
                    type={node.type}
                    name={node.name}
                    pressure={node.pressure}
                    showLabels={showLabels}
                />
            ))}
        </>
    )
}

export function Network3DContent({
    network,
    simResults,
    selectedTimeStep
}: Omit<Network3DViewProps, 'open' | 'onOpenChange'>) {
    const [showLabels, setShowLabels] = useState(true)
    const [verticalExaggeration, setVerticalExaggeration] = useState(50)
    const [resetTrigger, setResetTrigger] = useState(0)

    const handleReset = () => {
        setResetTrigger(prev => prev + 1)
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-6 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                    <Switch
                        id="show-labels"
                        checked={showLabels}
                        onCheckedChange={setShowLabels}
                    />
                    <Label htmlFor="show-labels" className="text-sm">Show Labels</Label>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <Label className="text-sm whitespace-nowrap">Vertical Scale</Label>
                    <Slider
                        value={[verticalExaggeration]}
                        onValueChange={([v]) => setVerticalExaggeration(v)}
                        min={10}
                        max={200}
                        step={10}
                        className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">{verticalExaggeration}%</span>
                </div>

                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset View
                </Button>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 min-h-0 bg-slate-900 rounded-lg overflow-hidden border">
                <Canvas>
                    <NetworkScene
                        network={network}
                        simResults={simResults}
                        selectedTimeStep={selectedTimeStep}
                        showLabels={showLabels}
                        verticalExaggeration={verticalExaggeration}
                        resetTrigger={resetTrigger}
                    />
                </Canvas>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Junction</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Reservoir</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Tank</span>
                </div>
                <div className="text-muted-foreground/60">
                    Mouse: Rotate • Scroll: Zoom • Shift+Mouse: Pan
                </div>
            </div>
        </div>
    )
}

export function Network3DView({
    open,
    onOpenChange,
    network,
    simResults,
    selectedTimeStep
}: Network3DViewProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[85vh] flex flex-col z-[9999]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5" />
                        3D Network View
                    </DialogTitle>
                    <DialogDescription>
                        Interactive 3D visualization of the pipe network with elevation
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0">
                    <Network3DContent
                        network={network}
                        simResults={simResults}
                        selectedTimeStep={selectedTimeStep}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
