import { useMemo, useCallback, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Circle,
    Droplet,
    Trash2,
    Play,
    MousePointer,
    ArrowRight,
    Download,
    Upload,
    RotateCcw,
    Loader2,
    Database,
    FileText,
    MapPin,
    AlertTriangle
} from 'lucide-react'
import { useNetworkEditor, type DrawingMode } from '../hooks/useNetworkEditor'
import { PropertiesPanel } from './PropertiesPanel'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Custom icons for different node types
const createJunctionIcon = (color: string = '#3b82f6') => L.divIcon({
    className: 'custom-junction-icon',
    html: `<div style="width:12px;height:12px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
})

const createReservoirIcon = (color: string = '#10b981') => L.divIcon({
    className: 'custom-reservoir-icon',
    html: `<div style="width:16px;height:16px;background:${color};clip-path:polygon(50% 0%, 100% 100%, 0% 100%);border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 16]
})

const createTankIcon = (color: string = '#f59e0b') => L.divIcon({
    className: 'custom-tank-icon',
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
})

interface MapEventsProps {
    onMapClick: (lat: number, lng: number) => void
}

function MapEvents({ onMapClick }: MapEventsProps) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng)
        }
    })
    return null
}

const toolButtons: { mode: DrawingMode, icon: React.ElementType, label: string, color: string }[] = [
    { mode: 'select', icon: MousePointer, label: 'Select', color: 'text-slate-500' },
    { mode: 'junction', icon: Circle, label: 'Junction', color: 'text-blue-500' },
    { mode: 'reservoir', icon: Droplet, label: 'Reservoir', color: 'text-emerald-500' },
    { mode: 'tank', icon: Database, label: 'Tank', color: 'text-amber-500' },
    { mode: 'pipe', icon: ArrowRight, label: 'Pipe', color: 'text-violet-500' },
    { mode: 'pump', icon: Play, label: 'Pump', color: 'text-cyan-500' },
    { mode: 'valve', icon: Circle, label: 'Valve', color: 'text-orange-500' },
    { mode: 'delete', icon: Trash2, label: 'Delete', color: 'text-red-500' },
]

export default function NetworkEditorPage() {
    const {
        network,
        drawingMode,
        setDrawingMode,
        selectedNode,
        selectedPipe,
        pipeStartNode,
        pipeVertices,
        simResults,
        isSimulating,
        handleMapClick,
        handleNodeClick,
        handlePipeClick,
        getAllNodes,
        runSimulation,
        clearNetwork,
        generateInpFile,
        updateJunction,
        updateReservoir,
        updateTank,
        updatePipe,
        updatePump,
        updateValve,
        clearSelection,
        loadFromInp,
        loadFromKmz,
        simError,
        clearSimError
    } = useNetworkEditor()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const kmzInputRef = useRef<HTMLInputElement>(null)
    const [showReport, setShowReport] = useState(false)
    const [selectedTimeStep, setSelectedTimeStep] = useState(0)
    const [isLoadingKmz, setIsLoadingKmz] = useState(false)

    const handleUploadInp = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleUploadKmz = useCallback(() => {
        kmzInputRef.current?.click()
    }, [])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            if (content) {
                const success = loadFromInp(content)
                if (success) {
                    toast.success(`File ${file.name} berhasil dimuat!`)
                } else {
                    toast.error('Gagal memuat file INP')
                }
            }
        }
        reader.readAsText(file)
        e.target.value = '' // Reset input
    }, [loadFromInp])

    const handleKmzFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoadingKmz(true)
        try {
            const result = await loadFromKmz(file)
            if (result) {
                const nodeCount = result.network.junctions.length
                const pipeCount = result.network.pipes.length
                toast.success(`File ${file.name} berhasil dimuat! (${nodeCount} nodes, ${pipeCount} pipes)`)
            } else {
                toast.error('Gagal memuat file KMZ/KML')
            }
        } catch (error) {
            console.error('Error loading KMZ:', error)
            toast.error('Gagal memuat file KMZ/KML')
        } finally {
            setIsLoadingKmz(false)
        }
        e.target.value = '' // Reset input
    }, [loadFromKmz])

    const allNodes = useMemo(() => getAllNodes(), [getAllNodes])

    const getNodeCoord = useCallback((nodeId: string): [number, number] | null => {
        const node = allNodes.find(n => n.id === nodeId)
        return node ? [node.lat, node.lng] : null
    }, [allNodes])

    // Get current timestep data
    const currentTimeStepData = useMemo(() => {
        if (!simResults || simResults.timeSteps.length === 0) return null
        return simResults.timeSteps[selectedTimeStep] || simResults.timeSteps[0]
    }, [simResults, selectedTimeStep])
    // Calculate min/max values for dynamic scaling
    const flowRange = useMemo(() => {
        if (!currentTimeStepData) return { min: 0, max: 10 }
        const flows = currentTimeStepData.links.map((l: { flow: number }) => Math.abs(l.flow))
        const max = Math.max(...flows, 0.1)
        return { min: 0, max }
    }, [currentTimeStepData])

    const pressureRange = useMemo(() => {
        if (!currentTimeStepData) return { min: 0, max: 100 }
        const pressures = currentTimeStepData.junctions.map((j: { pressure: number }) => j.pressure)
        const min = Math.min(...pressures, 0)
        const max = Math.max(...pressures, 100)
        return { min, max }
    }, [currentTimeStepData])

    const diameterRange = useMemo(() => {
        if (network.pipes.length === 0) return { min: 0, max: 0 }
        const diameters = network.pipes.map(p => p.diameter)
        return { min: Math.min(...diameters), max: Math.max(...diameters) }
    }, [network.pipes])

    // Color scale for flow (blue -> cyan -> green -> yellow -> red) - dynamic range
    const getFlowColor = useCallback((flow: number) => {
        const absFlow = Math.abs(flow)
        const range = flowRange.max
        const q1 = range * 0.25
        const q2 = range * 0.5
        const q3 = range * 0.75

        if (absFlow <= q1) return '#3b82f6'  // Blue
        if (absFlow <= q2) return '#06b6d4'  // Cyan
        if (absFlow <= q3) return '#22c55e'  // Green
        if (absFlow <= range) return '#eab308' // Yellow
        return '#ef4444'                      // Red
    }, [flowRange])

    const getDiameterColor = useCallback((diameter: number) => {
        const { min, max } = diameterRange
        if (max === min) return '#8b5cf6' // Violet 500

        const range = max - min
        const p = (diameter - min) / range

        if (p < 0.25) return '#94a3b8' // Slate 400
        if (p < 0.5) return '#6366f1'  // Indigo 500
        if (p < 0.75) return '#8b5cf6' // Violet 500
        return '#a855f7'               // Purple 500
    }, [diameterRange])

    const getPipeWeight = useCallback((diameter: number) => {
        // dynamic thickness based on diameter (3px to 12px)
        return Math.max(3, Math.min(12, 2 + (diameter / 100) * 2))
    }, [])

    const getPipeColor = useCallback((pipeId: string) => {
        const pipe = network.pipes.find(p => p.id === pipeId)
        if (!pipe) return '#64748b' // Default

        if (!currentTimeStepData) {
            return getDiameterColor(pipe.diameter)
        }

        const result = currentTimeStepData.links.find((l: { id: string }) => l.id === pipeId)
        if (!result) return getDiameterColor(pipe.diameter)

        return getFlowColor(result.flow)
    }, [network.pipes, currentTimeStepData, getFlowColor, getDiameterColor])

    const getPressureColor = useCallback((pressure: number) => {
        const { min, max } = pressureRange
        const range = max - min
        if (range === 0) return '#3b82f6'

        const q1 = min + range * 0.25
        const q2 = min + range * 0.5
        const q3 = min + range * 0.75

        if (pressure <= q1) return '#3b82f6'  // Blue
        if (pressure <= q2) return '#06b6d4'  // Cyan
        if (pressure <= q3) return '#22c55e'  // Green
        if (pressure <= max) return '#eab308' // Yellow
        return '#ef4444'                      // Red
    }, [pressureRange])

    const getNodeColor = useCallback((nodeId: string, type: 'junction' | 'reservoir' | 'tank') => {
        if (!currentTimeStepData) {
            return type === 'reservoir' ? '#10b981' : type === 'tank' ? '#f59e0b' : '#3b82f6'
        }
        const result = currentTimeStepData.junctions.find((j: { id: string }) => j.id === nodeId)
        if (!result) {
            return type === 'reservoir' ? '#10b981' : type === 'tank' ? '#f59e0b' : '#3b82f6'
        }
        return getPressureColor(result.pressure)
    }, [currentTimeStepData, getPressureColor])

    const handleDownloadInp = () => {
        const inp = generateInpFile()
        const blob = new Blob([inp], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'network.inp'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('File .inp berhasil diunduh!')
    }

    return (
        <>
            <Header />
            <Main>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Network Editor</h1>
                            <p className="text-muted-foreground">
                                Buat dan simulasikan jaringan pipa air minum
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {network.junctions.length + network.reservoirs.length + network.tanks.length} Nodes
                            </Badge>
                            <Badge variant="outline">
                                {network.pipes.length} Pipes
                            </Badge>
                            {network.pumps.length > 0 && (
                                <Badge variant="outline" className="text-cyan-600">
                                    {network.pumps.length} Pumps
                                </Badge>
                            )}
                            {network.valves.length > 0 && (
                                <Badge variant="outline" className="text-orange-600">
                                    {network.valves.length} Valves
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* Toolbar Sidebar */}
                        <Card className="lg:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Toolbar</CardTitle>
                                <CardDescription>Pilih mode lalu klik peta</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                                    {toolButtons.map(({ mode, icon: Icon, label, color }) => (
                                        <Button
                                            key={mode}
                                            variant={drawingMode === mode ? 'default' : 'outline'}
                                            size="sm"
                                            className={cn(
                                                'flex-col h-16 gap-1',
                                                drawingMode !== mode && color
                                            )}
                                            onClick={() => setDrawingMode(mode)}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-[10px]">{label}</span>
                                        </Button>
                                    ))}
                                </div>

                                {/* Mode instruction - show when in pipe/pump/valve mode */}
                                {(drawingMode === 'pipe' || drawingMode === 'pump' || drawingMode === 'valve') && !pipeStartNode && (
                                    <div className="text-xs text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                                        <span className="text-blue-600 dark:text-blue-400">
                                            Klik node pertama untuk memulai {drawingMode === 'pipe' ? 'pipa' : drawingMode === 'pump' ? 'pompa' : 'valve'}
                                        </span>
                                    </div>
                                )}

                                {pipeStartNode && (
                                    <div className="text-xs text-center p-2 bg-violet-50 dark:bg-violet-950 rounded-md border border-violet-200 dark:border-violet-800">
                                        <span className="text-violet-600 dark:text-violet-400">
                                            {drawingMode === 'pipe' && 'Klik node tujuan atau peta untuk menambah vertex'}
                                            {drawingMode === 'pump' && `Klik node tujuan untuk pompa dari ${pipeStartNode}`}
                                            {drawingMode === 'valve' && `Klik node tujuan untuk valve dari ${pipeStartNode}`}
                                        </span>
                                    </div>
                                )}

                                <Separator />

                                <div className="space-y-2">
                                    <Button
                                        className="w-full gap-2"
                                        onClick={runSimulation}
                                        disabled={isSimulating || (network.junctions.length === 0 && network.reservoirs.length === 0)}
                                    >
                                        {isSimulating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                        {isSimulating ? 'Running...' : 'Run Simulation'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={handleDownloadInp}
                                        disabled={network.pipes.length === 0}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download .INP
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={handleUploadInp}
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload .INP
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".inp,.INP"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={handleUploadKmz}
                                        disabled={isLoadingKmz}
                                    >
                                        {isLoadingKmz ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <MapPin className="h-4 w-4" />
                                        )}
                                        {isLoadingKmz ? 'Loading...' : 'Upload KMZ/KML'}
                                    </Button>
                                    <input
                                        ref={kmzInputRef}
                                        type="file"
                                        accept=".kmz,.kml,.KMZ,.KML"
                                        onChange={handleKmzFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="ghost"
                                        className="w-full gap-2 text-destructive hover:text-destructive"
                                        onClick={clearNetwork}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Clear All
                                    </Button>
                                </div>

                                {simResults && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Results</h4>

                                            {/* Timestep Selector */}
                                            {simResults.timeSteps.length > 1 && (
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground">Time Step:</span>
                                                    <Select
                                                        value={selectedTimeStep.toString()}
                                                        onValueChange={(v) => setSelectedTimeStep(parseInt(v))}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {simResults.timeSteps.map((step, idx) => (
                                                                <SelectItem key={idx} value={idx.toString()}>
                                                                    {step.timeString}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Time steps:</span>
                                                    <Badge variant="secondary">{simResults.timeSteps.length}</Badge>
                                                </div>
                                                {currentTimeStepData && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span>Nodes:</span>
                                                            <Badge variant="secondary">{currentTimeStepData.junctions.length}</Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Links:</span>
                                                            <Badge variant="secondary">{currentTimeStepData.links.length}</Badge>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 mt-2"
                                                onClick={() => setShowReport(true)}
                                            >
                                                <FileText className="h-4 w-4" />
                                                View Report
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Map Area */}
                        <Card className="lg:col-span-3 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="h-[600px] w-full relative">
                                    <MapContainer
                                        center={[-6.82, 107.14]}
                                        zoom={13}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <MapEvents onMapClick={handleMapClick} />

                                        {/* Render Pipes */}
                                        {network.pipes.map(pipe => {
                                            const from = getNodeCoord(pipe.fromNode)
                                            const to = getNodeCoord(pipe.toNode)
                                            if (!from || !to) return null
                                            // Build positions: from -> vertices -> to
                                            const positions: [number, number][] = [from, ...pipe.vertices, to]
                                            return (
                                                <Polyline
                                                    key={pipe.id}
                                                    positions={positions}
                                                    color={getPipeColor(pipe.id)}
                                                    weight={getPipeWeight(pipe.diameter)}
                                                    opacity={0.8}
                                                    eventHandlers={{
                                                        click: () => handlePipeClick(pipe.id)
                                                    }}
                                                />
                                            )
                                        })}

                                        {/* Preview line while drawing pipe */}
                                        {pipeStartNode && pipeVertices.length > 0 && (
                                            <Polyline
                                                positions={[
                                                    getNodeCoord(pipeStartNode) || [0, 0],
                                                    ...pipeVertices
                                                ]}
                                                color="#8b5cf6"
                                                weight={3}
                                                opacity={0.6}
                                                dashArray="5, 5"
                                            />
                                        )}

                                        {/* Render Pumps */}
                                        {network.pumps.map(pump => {
                                            const from = getNodeCoord(pump.fromNode)
                                            const to = getNodeCoord(pump.toNode)
                                            if (!from || !to) return null
                                            return (
                                                <Polyline
                                                    key={pump.id}
                                                    positions={[from, to]}
                                                    color="#06b6d4"
                                                    weight={6}
                                                    opacity={0.9}
                                                    dashArray="10, 10"
                                                    eventHandlers={{
                                                        click: () => handlePipeClick(pump.id)
                                                    }}
                                                />
                                            )
                                        })}

                                        {/* Render Valves */}
                                        {network.valves.map(valve => {
                                            const from = getNodeCoord(valve.fromNode)
                                            const to = getNodeCoord(valve.toNode)
                                            if (!from || !to) return null
                                            return (
                                                <Polyline
                                                    key={valve.id}
                                                    positions={[from, to]}
                                                    color="#f97316"
                                                    weight={6}
                                                    opacity={0.9}
                                                    dashArray="5, 5"
                                                    eventHandlers={{
                                                        click: () => handlePipeClick(valve.id)
                                                    }}
                                                />
                                            )
                                        })}

                                        {/* Render Nodes */}
                                        {allNodes.map(node => {
                                            const color = getNodeColor(node.id, node.type)
                                            return (
                                                <Marker
                                                    key={node.id}
                                                    position={[node.lat, node.lng]}
                                                    icon={
                                                        node.type === 'reservoir' ? createReservoirIcon(color) :
                                                            node.type === 'tank' ? createTankIcon(color) : createJunctionIcon(color)
                                                    }
                                                    eventHandlers={{
                                                        click: (e) => {
                                                            e.originalEvent.stopPropagation()
                                                            handleNodeClick(node.id)
                                                        }
                                                    }}
                                                >
                                                    <Tooltip
                                                        permanent
                                                        direction="top"
                                                        offset={[0, -5]}
                                                        className="bg-transparent border-none shadow-none text-[10px] font-bold text-slate-700 dark:text-slate-200 pointer-events-none select-none"
                                                    >
                                                        {node.name || node.id}
                                                    </Tooltip>
                                                </Marker>
                                            )
                                        })}
                                    </MapContainer>

                                    {/* Legend Overlays */}
                                    {(simResults || network.pipes.length > 0) && (
                                        <div className="absolute bottom-4 left-4 z-[1000] space-y-2 max-h-[70vh] overflow-y-auto pr-2 overflow-x-hidden">
                                            {/* Pressure Legend - Always show as reference */}
                                            <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg p-3 text-xs border border-slate-200 dark:border-slate-800 w-40">
                                                <div className="font-semibold mb-2 flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                                                    Pressure (m)
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                                                        <span>{(pressureRange.min + (pressureRange.max - pressureRange.min) * 0.25).toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#06b6d4' }}></div>
                                                        <span>{(pressureRange.min + (pressureRange.max - pressureRange.min) * 0.5).toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                                                        <span>{(pressureRange.min + (pressureRange.max - pressureRange.min) * 0.75).toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
                                                        <span>{pressureRange.max.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Flow Legend - Always show as reference */}
                                            <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg p-3 text-xs border border-slate-200 dark:border-slate-800 w-40">
                                                <div className="font-semibold mb-2 flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                                                    Flow (l/s)
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                                                        <span>{(flowRange.max * 0.25).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#06b6d4' }}></div>
                                                        <span>{(flowRange.max * 0.5).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                                                        <span>{(flowRange.max * 0.75).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
                                                        <span>{flowRange.max.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Diameter Legend - Always show if pipes exist */}
                                            {network.pipes.length > 0 && (
                                                <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg p-3 text-xs border border-slate-200 dark:border-slate-800 w-40">
                                                    <div className="font-semibold mb-2 flex items-center gap-2">
                                                        <div className="w-1 h-3 bg-violet-500 rounded-full"></div>
                                                        Diameter (mm)
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-[1px] bg-slate-400"></div>
                                                            <span className="text-muted-foreground">{diameterRange.min}</span>
                                                        </div>
                                                        {diameterRange.max !== diameterRange.min && (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-[3px] bg-indigo-500"></div>
                                                                    <span className="text-muted-foreground">{Math.round(diameterRange.min + (diameterRange.max - diameterRange.min) * 0.5)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-[5px] bg-purple-500"></div>
                                                                    <span className="text-muted-foreground">{diameterRange.max}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Properties Panel */}
                        <div className="lg:col-span-1">
                            <PropertiesPanel
                                selectedNode={selectedNode}
                                selectedPipe={selectedPipe}
                                network={network}
                                simResults={simResults}
                                selectedTimeStep={selectedTimeStep}
                                onUpdateJunction={updateJunction}
                                onUpdateReservoir={updateReservoir}
                                onUpdateTank={updateTank}
                                onUpdatePipe={updatePipe}
                                onUpdatePump={updatePump}
                                onUpdateValve={updateValve}
                                onClearSelection={clearSelection}
                            />
                        </div>
                    </div>
                </div>
            </Main>

            {/* Simulation Report Dialog */}
            <Dialog open={showReport} onOpenChange={setShowReport}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Simulation Report
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        <pre className="bg-muted p-4 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {simResults?.reportText || 'No report available'}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Simulation Error Dialog */}
            <Dialog open={!!simError} onOpenChange={() => clearSimError()}>
                <DialogContent className="max-w-md z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Simulation Error
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            {simError}
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => clearSimError()}>
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
