import {
    useMemo,
    useState,
    useCallback,
    useEffect,
    useRef,
} from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
    Pause,
    SkipBack,
    SkipForward,
    MousePointer,
    ArrowRight,
    Download,
    Upload,
    RotateCcw,
    Loader2,
    Database,
    FileText,
    MapPin,
    AlertTriangle,
    Save,
    FolderOpen,
    Undo2,
    Redo2,
    Cloud,
    CloudOff,
    Clock,
    Copy,
    Trash,
    Zap,
    Maximize2,
    Layers,
    TrendingUp,
    Box,
    LayoutGrid
} from 'lucide-react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { useNetworkEditor, type DrawingMode } from '../hooks/useNetworkEditor'
import { PropertiesPanel } from './PropertiesPanel'
import { PressureHeatmapLayer } from './PressureHeatmapLayer'
import { PressureContourLayer } from './PressureContourLayer'
import { ProfileView } from './ProfileView'
import { Network3DContent } from './Network3DView'
import { exportSimulationToExcel, exportSimulationToPdf } from '../utils/export-utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useSimulationNetworks,
    useCreateSimulationNetwork,
    useUpdateSimulationNetwork,
    useDeleteSimulationNetwork,
    useDuplicateNetwork,
    useNetworkVersions,
    useRestoreNetworkVersion,
} from '../api'
import type { SimulationNetwork } from '../types'

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

// Warning icon for low pressure nodes
const createWarningIcon = () => L.divIcon({
    className: 'custom-warning-icon',
    html: `<div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;width:20px;height:20px;background:#ef4444;border-radius:50%;opacity:0.3;animation:pulse 1.5s infinite"></div>
        <div style="position:absolute;top:3px;left:3px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:bold">!</div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
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

interface ZoomToFitProps {
    nodes: { lat: number, lng: number }[]
    trigger: number
}

function ZoomToFit({ nodes, trigger }: ZoomToFitProps) {
    const map = useMap()

    useEffect(() => {
        if (trigger > 0 && nodes.length > 0) {
            const bounds = L.latLngBounds(nodes.map(n => [n.lat, n.lng]))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 })
        }
    }, [trigger, nodes, map])

    return null
}

interface MapKeyboardPanProps {
    trigger: { direction: string, timestamp: number } | null
}

function MapKeyboardPan({ trigger }: MapKeyboardPanProps) {
    const map = useMap()

    useEffect(() => {
        if (!trigger) return
        const PAN_OFFSET = 100
        switch (trigger.direction) {
            case 'up': map.panBy([0, -PAN_OFFSET]); break
            case 'down': map.panBy([0, PAN_OFFSET]); break
            case 'left': map.panBy([-PAN_OFFSET, 0]); break
            case 'right': map.panBy([PAN_OFFSET, 0]); break
        }
    }, [trigger, map])

    return null
}

function MapInvalidator({ activeTab }: { activeTab: string }) {
    const map = useMap()
    useEffect(() => {
        if (activeTab === '2d') {
            const timer = setTimeout(() => {
                map.invalidateSize()
            }, 200)
            return () => clearTimeout(timer)
        }
    }, [activeTab, map])
    return null
}

const toolButtons: { mode: DrawingMode, icon: React.ComponentType<{ className?: string }>, label: string, color: string }[] = [
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
        networkId,
        networkName,
        drawingMode,
        setDrawingMode,
        selectedNode,
        selectedPipe,
        pipeStartNode,
        pipeVertices,
        simResults,
        isSimulating,
        isDirty,
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
        updatePattern,
        clearSelection,
        loadFromInp,
        loadFromKmz,
        loadNetworkFromServer,
        getNetworkDataForSave,
        undo,
        redo,
        canUndo,
        canRedo,
        lastSaved,
        loadFromAutosave,
        clearAutosave,
        hasAutosave,
        simError,
        clearSimError,
        mapPanTrigger
    } = useNetworkEditor()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const kmzInputRef = useRef<HTMLInputElement>(null)
    const [showReport, setShowReport] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [showPatternEditor, setShowPatternEditor] = useState(false)
    const [showVersionsDialog, setShowVersionsDialog] = useState(false)
    const [selectedTimeStep, setSelectedTimeStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [animationSpeed, setAnimationSpeed] = useState(1000) // ms per step
    const [zoomToFitTrigger, setZoomToFitTrigger] = useState(0)
    const [isLoadingKmz, setIsLoadingKmz] = useState(false)
    // Local settings & UI state
    const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
    const [showProfileView, setShowProfileView] = useState(false)
    const [pressureView, setPressureView] = useState<'none' | 'heatmap' | 'contour'>('none')
    const mapKey = useMemo(() => `map-stable-${Math.random().toString(36).substring(2, 9)}`, [])

    const animationSpeeds = [
        { label: '1x', value: 1000 },
        { label: '2x', value: 500 },
        { label: '4x', value: 250 },
    ]

    // Get current timestep data
    const currentTimeStepData = useMemo(() => {
        if (!simResults || simResults.timeSteps.length === 0) return null
        return simResults.timeSteps[selectedTimeStep] || simResults.timeSteps[0]
    }, [simResults, selectedTimeStep])

    // Calculate network statistics
    const networkStats = useMemo(() => {
        const totalNodes = network.junctions.length + network.reservoirs.length + network.tanks.length
        const totalLinks = network.pipes.length + network.pumps.length + network.valves.length
        const totalPipeLength = network.pipes.reduce((sum, p) => sum + p.length, 0)
        const avgDiameter = network.pipes.length > 0
            ? network.pipes.reduce((sum, p) => sum + p.diameter, 0) / network.pipes.length
            : 0
        const totalDemand = network.junctions.reduce((sum, j) => sum + (j.demand || 0), 0)

        // Sim results stats
        let avgPressure = 0
        let maxPressure = 0
        let minPressure = 0
        let totalFlowOut = 0

        if (currentTimeStepData) {
            const pressures = currentTimeStepData.junctions.map((j: { pressure: number }) => j.pressure)
            if (pressures.length > 0) {
                avgPressure = pressures.reduce((a: number, b: number) => a + b, 0) / pressures.length
                maxPressure = Math.max(...pressures)
                minPressure = Math.min(...pressures)
            }

            // Total flow out (from reservoirs/tanks)
            const sourceNodes = new Set([...network.reservoirs.map(r => r.id), ...network.tanks.map(t => t.id)])
            currentTimeStepData.links.forEach((l: { id: string, flow: number }) => {
                const pipe = network.pipes.find(p => p.id === l.id)
                if (pipe && sourceNodes.has(pipe.fromNode)) {
                    totalFlowOut += l.flow
                }
            })
        }

        return {
            totalNodes,
            totalLinks,
            totalPipeLength,
            avgDiameter,
            totalDemand,
            avgPressure,
            maxPressure,
            minPressure,
            totalFlowOut
        }
    }, [network, currentTimeStepData])

    // Network Validation
    const validationErrors = useMemo(() => {
        const errors: { type: 'error' | 'warning', message: string }[] = []

        if (network.junctions.length === 0 && network.reservoirs.length === 0 && network.tanks.length === 0) {
            return [] // Empty network
        }

        // 1. Sources check
        if (network.reservoirs.length === 0 && network.tanks.length === 0) {
            errors.push({ type: 'error', message: 'Tidak ada sumber air (reservoir/tank).' })
        }

        // 2. Orphan nodes check
        const connectedNodes = new Set<string>()
        network.pipes.forEach(p => { connectedNodes.add(p.fromNode); connectedNodes.add(p.toNode); })
        network.pumps.forEach(p => { connectedNodes.add(p.fromNode); connectedNodes.add(p.toNode); })
        network.valves.forEach(v => { connectedNodes.add(v.fromNode); connectedNodes.add(v.toNode); })

        const allNodeIds = [...network.junctions, ...network.reservoirs, ...network.tanks].map(n => n.id)
        const orphanNodes = allNodeIds.filter(id => !connectedNodes.has(id))

        if (orphanNodes.length > 0) {
            errors.push({
                type: 'warning',
                message: `${orphanNodes.length} node tidak terhubung ke pipa manapun (${orphanNodes.slice(0, 3).join(', ')}${orphanNodes.length > 3 ? '...' : ''}).`
            })
        }

        // 3. Pipe connectivity check
        const nodeSet = new Set(allNodeIds)
        const invalidPipes = network.pipes.filter(p => !nodeSet.has(p.fromNode) || !nodeSet.has(p.toNode))
        if (invalidPipes.length > 0) {
            errors.push({ type: 'error', message: `${invalidPipes.length} pipa terhubung ke node yang tidak ada.` })
        }

        // 4. Reachability check (BFS from sources)
        const sources = [...network.reservoirs, ...network.tanks].map(s => s.id)
        if (sources.length > 0) {
            const adjacency = new Map<string, string[]>()
            const addEdge = (u: string, v: string) => {
                if (!adjacency.has(u)) adjacency.set(u, [])
                adjacency.get(u)!.push(v)
                if (!adjacency.has(v)) adjacency.set(v, [])
                adjacency.get(v)!.push(u)
            }

            network.pipes.forEach(p => addEdge(p.fromNode, p.toNode))
            network.pumps.forEach(p => addEdge(p.fromNode, p.toNode))
            network.valves.forEach(v => addEdge(v.fromNode, v.toNode))

            const reached = new Set<string>()
            const queue = [...sources]
            sources.forEach(s => reached.add(s))

            let head = 0
            while (head < queue.length) {
                const u = queue[head++]
                const neighbors = adjacency.get(u) || []
                for (const v of neighbors) {
                    if (!reached.has(v)) {
                        reached.add(v)
                        queue.push(v)
                    }
                }
            }

            const unreachableCount = allNodeIds.length - reached.size
            if (unreachableCount > 0 && reached.size > sources.length) {
                errors.push({
                    type: 'warning',
                    message: `${unreachableCount} node tidak terjangkau dari sumber air manapun.`
                })
            }
        }

        return errors
    }, [network])

    // Detect low pressure nodes (< 10m)
    const LOW_PRESSURE_THRESHOLD = 10 // meters
    const lowPressureNodes = useMemo(() => {
        if (!currentTimeStepData) return []

        const lowNodes: { id: string; name: string; pressure: number; lat: number; lng: number }[] = []

        currentTimeStepData.junctions.forEach((res: { id: string; pressure: number }) => {
            if (res.pressure < LOW_PRESSURE_THRESHOLD) {
                const node = network.junctions.find(j => j.id === res.id)
                if (node) {
                    lowNodes.push({
                        id: node.id,
                        name: node.name || node.id,
                        pressure: res.pressure,
                        lat: node.lat,
                        lng: node.lng
                    })
                }
            }
        })

        return lowNodes.sort((a, b) => a.pressure - b.pressure)
    }, [currentTimeStepData, network.junctions])

    // Animation Effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isPlaying && simResults && simResults.timeSteps.length > 0) {
            interval = setInterval(() => {
                setSelectedTimeStep((prev) => (prev + 1) % simResults.timeSteps.length);
            }, animationSpeed);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, simResults, animationSpeed]);

    // Save/Load dialogs
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [showLoadDialog, setShowLoadDialog] = useState(false)
    const [saveAsNew, setSaveAsNew] = useState(false)
    const [saveName, setSaveName] = useState('')

    // API hooks
    const { data: networksData, isLoading: isLoadingNetworks } = useSimulationNetworks({ per_page: 50 })
    const { data: versionsData, isLoading: isLoadingVersions } = useNetworkVersions(networkId)
    const createNetwork = useCreateSimulationNetwork()
    const updateNetwork = useUpdateSimulationNetwork()
    const deleteNetwork = useDeleteSimulationNetwork()
    const duplicateNetwork = useDuplicateNetwork()
    const restoreVersion = useRestoreNetworkVersion()

    // Handle restore version
    const handleRestoreVersion = useCallback(async (version: number) => {
        if (!networkId) return
        if (!confirm(`Restore ke versi ${version}? Perubahan yang belum disimpan akan hilang.`)) return

        try {
            const result = await restoreVersion.mutateAsync({ networkId, version })
            loadNetworkFromServer({
                id: result.id,
                name: result.name,
                network_data: result.network_data
            })
            setShowVersionsDialog(false)
            toast.success(`Berhasil restore ke versi ${version}`)
        } catch (error) {
            console.error('Failed to restore version:', error)
            toast.error('Gagal restore versi')
        }
    }, [networkId, restoreVersion, loadNetworkFromServer])

    // Check for autosave on mount
    useEffect(() => {
        if (hasAutosave()) {
            const autosave = loadFromAutosave()
            if (autosave) {
                toast.info('Data autosave ditemukan dan dimuat', {
                    description: `Terakhir disimpan: ${new Date(autosave.timestamp).toLocaleString('id-ID')}`,
                    action: {
                        label: 'Hapus',
                        onClick: () => {
                            clearAutosave()
                            clearNetwork()
                        }
                    }
                })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Handle save network
    const handleSaveNetwork = useCallback(async () => {
        if (!saveName.trim()) {
            toast.error('Nama jaringan harus diisi')
            return
        }

        const networkData = getNetworkDataForSave()

        try {
            if (networkId && !saveAsNew) {
                // Update existing
                await updateNetwork.mutateAsync({
                    id: networkId,
                    data: {
                        name: saveName,
                        network_data: networkData.network_data,
                        save_version: true,
                        version_description: 'Update dari editor'
                    }
                })
                toast.success('Jaringan berhasil diperbarui')
            } else {
                // Create new
                const result = await createNetwork.mutateAsync({
                    name: saveName,
                    network_data: networkData.network_data,
                })
                loadNetworkFromServer({
                    id: result.id,
                    name: result.name,
                    network_data: result.network_data
                })
                toast.success('Jaringan berhasil disimpan')
            }
            setShowSaveDialog(false)
            setSaveAsNew(false)
        } catch (error) {
            console.error('Failed to save network:', error)
            toast.error('Gagal menyimpan jaringan')
        }
    }, [saveName, networkId, saveAsNew, getNetworkDataForSave, updateNetwork, createNetwork, loadNetworkFromServer])

    // Handle load network
    const handleLoadNetwork = useCallback((network: SimulationNetwork) => {
        loadNetworkFromServer({
            id: network.id,
            name: network.name,
            network_data: network.network_data
        })
        setShowLoadDialog(false)
        toast.success(`Jaringan "${network.name}" berhasil dimuat`)
    }, [loadNetworkFromServer])

    // Handle delete network
    const handleDeleteNetwork = useCallback(async (id: number, name: string) => {
        if (!confirm(`Hapus jaringan "${name}" ? `)) return

        try {
            await deleteNetwork.mutateAsync(id)
            toast.success('Jaringan berhasil dihapus')
        } catch (error) {
            console.error('Failed to delete network:', error)
            toast.error('Gagal menghapus jaringan')
        }
    }, [deleteNetwork])

    // Handle duplicate network
    const handleDuplicateNetwork = useCallback(async (id: number) => {
        try {
            const result = await duplicateNetwork.mutateAsync({ networkId: id })
            toast.success(`Jaringan berhasil diduplikasi sebagai "${result.name}"`)
        } catch (error) {
            console.error('Failed to duplicate network:', error)
            toast.error('Gagal menduplikasi jaringan')
        }
    }, [duplicateNetwork])

    // Open save dialog
    const openSaveDialog = useCallback((asNew: boolean = false) => {
        setSaveAsNew(asNew)
        setSaveName(networkName)
        setShowSaveDialog(true)
    }, [networkName])

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
        a.download = `${networkName.replace(/\s+/g, '_')}.inp`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('File .inp berhasil diunduh!')
    }

    const handleExportExcel = () => {
        if (!simResults) return
        try {
            exportSimulationToExcel({
                network,
                results: simResults,
                networkName: networkName
            })
            toast.success('Laporan Excel berhasil diunduh!')
        } catch (error) {
            console.error('Failed to export Excel:', error)
            toast.error('Gagal mengekspor ke Excel')
        }
    }

    const handleExportPdf = () => {
        if (!simResults) return
        try {
            exportSimulationToPdf({
                network,
                results: simResults,
                networkName: networkName
            })
            toast.success('Laporan PDF berhasil diunduh!')
        } catch (error) {
            console.error('Failed to export PDF:', error)
            toast.error('Gagal mengekspor ke PDF')
        }
    }

    return (
        <>
            <Header />
            <Main>
                <div className="flex flex-col gap-4">
                    {/* Header with Title and Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        {networkId ? networkName : 'Network Editor'}
                                    </h1>
                                    {isDirty && (
                                        <Badge variant="secondary" className="text-xs">
                                            Unsaved
                                        </Badge>
                                    )}
                                    {networkId && (
                                        <Badge variant="outline" className="text-xs text-green-600">
                                            <Cloud className="h-3 w-3 mr-1" />
                                            Saved
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {networkId
                                        ? 'Klik Save untuk menyimpan perubahan'
                                        : 'Buat dan simulasikan jaringan pipa air minum'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Undo/Redo */}
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={undo}
                                    disabled={!canUndo}
                                    title="Undo (Ctrl+Z)"
                                    className="rounded-r-none"
                                >
                                    <Undo2 className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={redo}
                                    disabled={!canRedo}
                                    title="Redo (Ctrl+Y)"
                                    className="rounded-l-none"
                                >
                                    <Redo2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoomToFitTrigger(prev => prev + 1)}
                                disabled={allNodes.length === 0}
                                title="Zoom to Fit Content"
                            >
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Fit
                            </Button>

                            {/* Save/Load */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowVersionsDialog(true)}
                                disabled={!networkId}
                                title="Version History"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                History
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLoadDialog(true)}
                            >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Load
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => openSaveDialog(false)}
                                disabled={network.pipes.length === 0 && network.junctions.length === 0}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {networkId ? 'Save' : 'Save As'}
                            </Button>

                            {/* Stats */}
                            <div className="flex items-center gap-2 ml-2">
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
                    </div>

                    {/* Auto-save indicator */}
                    {lastSaved && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Auto-saved locally: {lastSaved.toLocaleString('id-ID')}
                        </div>
                    )}

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
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={() => setShowPatternEditor(true)}
                                    >
                                        <Zap className="h-4 w-4" />
                                        Demand Patterns
                                    </Button>
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

                                {/* Validation Errors */}
                                {validationErrors.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Validation</h4>
                                            </div>
                                            <div className="space-y-1">
                                                {validationErrors.map((err, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "text-[10px] p-2 rounded border flex gap-2",
                                                            err.type === 'error'
                                                                ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                                                                : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                                                        )}
                                                    >
                                                        <div className="mt-0.5">•</div>
                                                        <div>{err.message}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Low Pressure Warning */}
                                {lowPressureNodes.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Low Pressure</h4>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-2">
                                                <div className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">
                                                    ⚠️ {lowPressureNodes.length} node dengan tekanan &lt; {LOW_PRESSURE_THRESHOLD}m
                                                </div>
                                                <div className="max-h-24 overflow-y-auto space-y-1">
                                                    {lowPressureNodes.slice(0, 10).map((node) => (
                                                        <div
                                                            key={node.id}
                                                            className="text-[10px] flex justify-between items-center bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded"
                                                        >
                                                            <span className="font-mono">{node.name}</span>
                                                            <span className="text-red-600 dark:text-red-300 font-bold">
                                                                {node.pressure.toFixed(1)}m
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {lowPressureNodes.length > 10 && (
                                                        <div className="text-[10px] text-red-500 text-center">
                                                            +{lowPressureNodes.length - 10} more...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {simResults && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Results</h4>

                                            {/* Timestep Selector & Animation */}
                                            {simResults.timeSteps.length > 1 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground font-medium">Time Control:</span>
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1 font-mono">
                                                            {currentTimeStepData?.timeString}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center justify-center gap-1 bg-muted/30 p-1 rounded-md">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setSelectedTimeStep(0)}
                                                            title="Reset to Start"
                                                        >
                                                            <SkipBack className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setIsPlaying(!isPlaying)}
                                                            title={isPlaying ? 'Pause' : 'Play'}
                                                        >
                                                            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setSelectedTimeStep((prev) => (prev + 1) % simResults.timeSteps.length)}
                                                            title="Next Step"
                                                        >
                                                            <SkipForward className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                            <span>Speed</span>
                                                            <span>{animationSpeeds.find(s => s.value === animationSpeed)?.label}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {animationSpeeds.map((s) => (
                                                                <Button
                                                                    key={s.value}
                                                                    variant={animationSpeed === s.value ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    className="h-6 flex-1 text-[10px] px-0"
                                                                    onClick={() => setAnimationSpeed(s.value)}
                                                                >
                                                                    {s.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-xs text-muted-foreground">Go to Step:</span>
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
                                                onClick={() => setShowStats(true)}
                                            >
                                                <Zap className="h-4 w-4" />
                                                Network Stats
                                            </Button>
                                            <div className="w-full mt-2">
                                                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <Layers className="h-3 w-3" />
                                                    Pressure View
                                                </Label>
                                                <Select value={pressureView} onValueChange={(v) => setPressureView(v as 'none' | 'heatmap' | 'contour')}>
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Select view" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="heatmap">Heatmap</SelectItem>
                                                        <SelectItem value="contour">Contour</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 mt-2"
                                                onClick={() => setShowProfileView(true)}
                                            >
                                                <TrendingUp className="h-4 w-4" />
                                                View Profile
                                            </Button>
                                            <Button
                                                variant={activeTab === '3d' ? 'default' : 'outline'}
                                                size="sm"
                                                className="w-full gap-2 mt-2"
                                                onClick={() => setActiveTab('3d')}
                                            >
                                                <Box className="h-4 w-4" />
                                                3D View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 mt-2"
                                                onClick={() => setShowReport(true)}
                                            >
                                                <FileText className="h-4 w-4" />
                                                View Report
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 mt-2"
                                                onClick={handleExportExcel}
                                            >
                                                <Download className="h-4 w-4" />
                                                Export to Excel
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 mt-2"
                                                onClick={handleExportPdf}
                                            >
                                                <FileText className="h-4 w-4" />
                                                Export to PDF
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Map & 3D Area */}
                        <Card className="lg:col-span-3 overflow-hidden flex flex-col border-slate-200 dark:border-slate-800 shadow-xl">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '2d' | '3d')} className="flex flex-col h-full">
                                <CardHeader className="p-4 border-b bg-muted/20">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <TabsList className="grid w-full sm:w-[300px] grid-cols-2">
                                            <TabsTrigger value="2d" className="gap-2">
                                                <LayoutGrid className="h-3.5 w-3.5" />
                                                2D Editor
                                            </TabsTrigger>
                                            <TabsTrigger value="3d" className="gap-2">
                                                <Box className="h-3.5 w-3.5" />
                                                3D View
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {activeTab === '2d' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setZoomToFitTrigger(v => v + 1)}
                                                    className="h-8 text-xs gap-1.5"
                                                >
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                    Zoom to Fit
                                                </Button>
                                            )}
                                            <Badge variant="outline" className="h-8 px-3 font-mono text-[10px] uppercase tracking-wider bg-background/50">
                                                {activeTab === '2d' ? 'Leaflet Engine' : 'Three.js Engine'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 flex-1 relative min-h-[600px]">
                                    <TabsContent
                                        value="2d"
                                        className="m-0 h-full w-full absolute inset-0"
                                    >
                                        <div className="h-full w-full relative">
                                            {activeTab === '2d' && (
                                                <MapContainer
                                                    key={mapKey}
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
                                                    <ZoomToFit nodes={allNodes} trigger={zoomToFitTrigger} />
                                                    <MapKeyboardPan trigger={mapPanTrigger} />
                                                    <MapInvalidator activeTab={activeTab} />

                                                    <PressureHeatmapLayer
                                                        simResults={simResults}
                                                        network={network}
                                                        selectedTimeStep={selectedTimeStep}
                                                        visible={pressureView === 'heatmap'}
                                                    />

                                                    <PressureContourLayer
                                                        simResults={simResults}
                                                        network={network}
                                                        selectedTimeStep={selectedTimeStep}
                                                        visible={pressureView === 'contour'}
                                                    />

                                                    {/* Render Pipes */}
                                                    {network.pipes.map(pipe => {
                                                        const from = getNodeCoord(pipe.fromNode)
                                                        const to = getNodeCoord(pipe.toNode)
                                                        if (!from || !to) return null
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

                                                    {/* Warning markers for low pressure nodes */}
                                                    {lowPressureNodes.map(node => (
                                                        <Marker
                                                            key={`warning-${node.id}`}
                                                            position={[node.lat, node.lng]}
                                                            icon={createWarningIcon()}
                                                            zIndexOffset={1000}
                                                        >
                                                            <Tooltip
                                                                direction="right"
                                                                offset={[10, 0]}
                                                                className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-none"
                                                            >
                                                                ⚠️ Tekanan rendah: {node.pressure.toFixed(1)}m
                                                            </Tooltip>
                                                        </Marker>
                                                    ))}
                                                </MapContainer>
                                            )}

                                            {/* Legend Overlays */}
                                            {(simResults || network.pipes.length > 0) && (
                                                <div className="absolute bottom-4 left-4 z-[1000] space-y-2 max-h-[70vh] overflow-y-auto pr-2 overflow-x-hidden">
                                                    {/* Pressure Legend */}
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

                                                    {/* Contour Legend - shows when contour view is active */}
                                                    {pressureView === 'contour' && (
                                                        <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg p-3 text-xs border border-slate-200 dark:border-slate-800 w-40">
                                                            <div className="font-semibold mb-2 flex items-center gap-2">
                                                                <div className="w-1 h-3 bg-gradient-to-b from-blue-500 via-green-500 to-yellow-500 rounded-full"></div>
                                                                Contour Zones
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#3b82f6', opacity: 0.35 }}></div>
                                                                    <span>10% - Low</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#06b6d4', opacity: 0.40 }}></div>
                                                                    <span>30%</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#22c55e', opacity: 0.45 }}></div>
                                                                    <span>50%</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#eab308', opacity: 0.50 }}></div>
                                                                    <span>70%</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#ef4444', opacity: 0.55 }}></div>
                                                                    <span>90% - High</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Flow Legend */}
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

                                                    {/* Diameter Legend */}
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
                                    </TabsContent>

                                    <TabsContent
                                        value="3d"
                                        forceMount
                                        className={cn(
                                            "m-0 h-full w-full absolute inset-0 bg-slate-950 overflow-hidden",
                                            activeTab !== '3d' && "hidden"
                                        )}
                                    >
                                        {activeTab === '3d' && (
                                            <Network3DContent
                                                network={network}
                                                simResults={simResults}
                                                selectedTimeStep={selectedTimeStep}
                                            />
                                        )}
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
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

            {/* Network Statistics Dialog */}
            <Dialog open={showStats} onOpenChange={setShowStats}>
                <DialogContent className="max-w-md z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Network Statistics
                        </DialogTitle>
                        <DialogDescription>
                            Ringkasan data teknis jaringan pipa
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Struktur</span>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Total Nodes:</span>
                                        <span className="font-mono">{networkStats.totalNodes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Links:</span>
                                        <span className="font-mono">{networkStats.totalLinks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Panjang:</span>
                                        <span className="font-mono">{networkStats.totalPipeLength.toLocaleString()} m</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Desain</span>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Avg Diameter:</span>
                                        <span className="font-mono">{networkStats.avgDiameter.toFixed(1)} mm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Demand:</span>
                                        <span className="font-mono">{networkStats.totalDemand.toFixed(2)} LPS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {simResults && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Hasil Simulasi ({currentTimeStepData?.timeString})</span>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Avg Pressure:</span>
                                            <span className="font-mono text-blue-600">{networkStats.avgPressure.toFixed(2)} m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Max Pressure:</span>
                                            <span className="font-mono text-emerald-600">{networkStats.maxPressure.toFixed(2)} m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Min Pressure:</span>
                                            <span className="font-mono text-red-600">{networkStats.minPressure.toFixed(2)} m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Flow:</span>
                                            <span className="font-mono text-cyan-600">{networkStats.totalFlowOut.toFixed(2)} LPS</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowStats(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Demand Pattern Editor Dialog */}
            <Dialog open={showPatternEditor} onOpenChange={setShowPatternEditor}>
                <DialogContent className="max-w-2xl z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Demand Pattern Editor
                        </DialogTitle>
                        <DialogDescription>
                            Edit multiplier permintaan air untuk simulasi 24 jam
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                            <Label htmlFor="active-pattern" className="whitespace-nowrap">Pilih Pattern:</Label>
                            <Select defaultValue={network.patterns?.[0]?.id}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {network.patterns?.map(p => (
                                        <SelectItem key={p.id} value={p.id}>Pattern {p.id}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            {network.patterns?.[0]?.multipliers?.map((m, i) => (
                                <div key={i} className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Jam {i}:00</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        className="h-8 text-xs px-2"
                                        value={m}
                                        onChange={(e) => {
                                            if (!network.patterns?.[0]) return
                                            const newMults = [...network.patterns[0].multipliers]
                                            newMults[i] = parseFloat(e.target.value) || 0
                                            updatePattern(network.patterns[0].id, newMults)
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowPatternEditor(false)}>Selesai</Button>
                    </DialogFooter>
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

            {/* Save Network Dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent className="max-w-md z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Save className="h-5 w-5" />
                            {networkId && !saveAsNew ? 'Update Jaringan' : 'Simpan Jaringan'}
                        </DialogTitle>
                        <DialogDescription>
                            {networkId && !saveAsNew
                                ? 'Perbarui jaringan yang sudah tersimpan'
                                : 'Simpan jaringan baru ke server'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="network-name">Nama Jaringan</Label>
                            <Input
                                id="network-name"
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="Masukkan nama jaringan..."
                            />
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                                <span>Nodes:</span>
                                <span>{network.junctions.length + network.reservoirs.length + network.tanks.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pipes:</span>
                                <span>{network.pipes.length}</span>
                            </div>
                            {network.pumps.length > 0 && (
                                <div className="flex justify-between">
                                    <span>Pumps:</span>
                                    <span>{network.pumps.length}</span>
                                </div>
                            )}
                            {network.valves.length > 0 && (
                                <div className="flex justify-between">
                                    <span>Valves:</span>
                                    <span>{network.valves.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                        {networkId && !saveAsNew && (
                            <Button
                                variant="outline"
                                onClick={() => setSaveAsNew(true)}
                            >
                                Save As New
                            </Button>
                        )}
                        <Button
                            onClick={handleSaveNetwork}
                            disabled={createNetwork.isPending || updateNetwork.isPending}
                        >
                            {(createNetwork.isPending || updateNetwork.isPending) && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            {networkId && !saveAsNew ? 'Update' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Load Network Dialog */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogContent className="max-w-2xl z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5" />
                            Load Jaringan
                        </DialogTitle>
                        <DialogDescription>
                            Pilih jaringan yang tersimpan untuk dimuat
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {isLoadingNetworks ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : networksData && networksData.data.length > 0 ? (
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-2">
                                    {networksData.data.map((net) => (
                                        <div
                                            key={net.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium truncate">{net.name}</h4>
                                                    {net.is_public && (
                                                        <Badge variant="secondary" className="text-xs">Public</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span>{net.stats?.total_nodes ?? 0} nodes</span>
                                                    <span>{net.stats?.total_links ?? 0} links</span>
                                                    <span>v{net.version}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(net.updated_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleLoadNetwork(net)}
                                                >
                                                    Load
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDuplicateNetwork(net.id)}
                                                    title="Duplicate"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                {net.can_edit && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteNetwork(net.id, net.name)}
                                                        title="Delete"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <CloudOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Belum ada jaringan tersimpan</p>
                                <p className="text-sm">Buat jaringan baru dan klik Save untuk menyimpan</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Profile View Dialog */}
            <ProfileView
                open={showProfileView}
                onOpenChange={setShowProfileView}
                network={network}
                simResults={simResults}
                selectedTimeStep={selectedTimeStep}
                defaultStartNode={selectedNode}
            />



            {/* Version History Dialog */}
            <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
                <DialogContent className="max-w-xl z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Riwayat Versi: {networkName}
                        </DialogTitle>
                        <DialogDescription>
                            Pilih versi untuk dikembalikan (restore) ke editor
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {isLoadingVersions ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : versionsData && versionsData.length > 0 ? (
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-3">
                                    {versionsData.map((v) => (
                                        <div
                                            key={v.version}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono">v{v.version}</Badge>
                                                    <span className="text-sm font-medium truncate">
                                                        {v.description || 'Tanpa deskripsi'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(v.created_at).toLocaleString('id-ID')}
                                                    </span>
                                                    <span>Oleh: {v.user?.name || 'System'}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRestoreVersion(v.version)}
                                                disabled={restoreVersion.isPending}
                                            >
                                                {restoreVersion.isPending ? (
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                ) : (
                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                )}
                                                Restore
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Belum ada riwayat versi untuk jaringan ini</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVersionsDialog(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
