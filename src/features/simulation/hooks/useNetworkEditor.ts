import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { SimulationService, type SimulationResult } from '../services/SimulationService'
import { getElevation } from '../services/ElevationService'
import { parseInpFile } from '../services/InpParser'
import { parseKmzOrKml, type KmzParseResult } from '../services/KmzParser'
import { useNetworkHistory, useNetworkAutosave, useNetworkKeyboardShortcuts } from './useNetworkPersistence'
import { DEFAULT_SIMULATION_SETTINGS, type SimulationSettings } from '../types'
import { calculatePipeLength } from '../utils/geometry-utils'
import { findNearestNode } from '../utils/map-utils'

export type DrawingMode = 'select' | 'junction' | 'reservoir' | 'tank' | 'pipe' | 'pump' | 'valve' | 'delete'

export interface NetworkJunction {
    id: string
    name: string
    lat: number
    lng: number
    elevation: number
    demand: number
    pattern?: string
}

export interface NetworkPattern {
    id: string
    multipliers: number[]
}

export interface NetworkReservoir {
    id: string
    name: string
    lat: number
    lng: number
    head: number
}

export interface NetworkTank {
    id: string
    name: string
    lat: number
    lng: number
    elevation: number
    initLevel: number
    minLevel: number
    maxLevel: number
    diameter: number
}

export interface NetworkPipe {
    id: string
    name: string
    fromNode: string
    toNode: string
    vertices: [number, number][] // Intermediate waypoints [lat, lng]
    length: number
    diameter: number
    roughness: number
}

export interface NetworkPump {
    id: string
    name: string
    fromNode: string
    toNode: string
    power: number // HP or kW
    speed: number // RPM ratio
}

export interface NetworkValve {
    id: string
    name: string
    fromNode: string
    toNode: string
    diameter: number
    setting: number // Pressure or flow setting
    type: 'PRV' | 'PSV' | 'PBV' | 'FCV' | 'TCV' | 'GPV' // Valve types
}

export interface NetworkState {
    junctions: NetworkJunction[]
    reservoirs: NetworkReservoir[]
    tanks: NetworkTank[]
    pipes: NetworkPipe[]
    pumps: NetworkPump[]
    valves: NetworkValve[]
    patterns: NetworkPattern[]
}

const generateId = (prefix: string, items: { id: string }[]) => {
    const nums = items.map(i => parseInt(i.id.replace(prefix, '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `${prefix}${max + 1}`
}

function formatHoursToInpTime(hours: number): string {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}:${m.toString().padStart(2, '0')}`
}

function getNodePosition(
    state: NetworkState,
    nodeId: string,
): { lat: number; lng: number } | null {
    const junction = state.junctions.find((n) => n.id === nodeId)
    if (junction) return { lat: junction.lat, lng: junction.lng }
    const reservoir = state.reservoirs.find((n) => n.id === nodeId)
    if (reservoir) return { lat: reservoir.lat, lng: reservoir.lng }
    const tank = state.tanks.find((n) => n.id === nodeId)
    if (tank) return { lat: tank.lat, lng: tank.lng }
    return null
}

const emptyNetwork: NetworkState = {
    junctions: [],
    reservoirs: [],
    tanks: [],
    pipes: [],
    pumps: [],
    valves: [],
    patterns: [
        { id: '1', multipliers: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] }
    ]
}

export function useNetworkEditor() {
    const [network, setNetwork] = useState<NetworkState>(emptyNetwork)
    const [networkId, setNetworkId] = useState<number | null>(null)
    const [networkName, setNetworkName] = useState<string>('Untitled Network')
    const [pekerjaanId, setPekerjaanId] = useState<number | null>(null)
    const [canEdit, setCanEdit] = useState<boolean>(true)
    const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>(
        DEFAULT_SIMULATION_SETTINGS,
    )
    const canEditRef = useRef(canEdit)
    useEffect(() => {
        canEditRef.current = canEdit
    }, [canEdit])
    const [drawingMode, setDrawingMode] = useState<DrawingMode>('select')
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [selectedPipe, setSelectedPipe] = useState<string | null>(null)
    const [pipeStartNode, setPipeStartNode] = useState<string | null>(null)
    const [pipeVertices, setPipeVertices] = useState<[number, number][]>([])
    const [simResults, setSimResults] = useState<SimulationResult | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)
    const [simError, setSimError] = useState<string | null>(null)
    const [isDirty, setIsDirty] = useState(false)

    const simulationService = useMemo(() => new SimulationService(), [])

    // History (undo/redo) management
    const {
        pushToHistory,
        updateCurrentState,
        undo,
        redo,
        clearHistory,
        canUndo,
        canRedo,
    } = useNetworkHistory(network, (newState) => {
        setNetwork(newState)
        setIsDirty(true)
    })

    // Auto-save to localStorage
    const {
        lastSaved,
        hasUnsavedChanges,
        loadAutosave,
        clearAutosave,
        hasAutosave,
        saveNow: saveToLocalStorage,
    } = useNetworkAutosave(network, networkName, true)

    // Helper to mark state as changed and update history ref
    const markChanged = useCallback((description: string = 'Change') => {
        if (!canEditRef.current) return
        setIsDirty(true)
        pushToHistory(description)
    }, [pushToHistory])

    // Update history reference when network changes
    const updateNetworkWithHistory = useCallback((
        updater: (prev: NetworkState) => NetworkState,
        description: string
    ) => {
        markChanged(description)
        setNetwork(prev => {
            const newState = updater(prev)
            updateCurrentState(newState)
            return newState
        })
    }, [markChanged, updateCurrentState])

    // Delete selected element
    const deleteSelected = useCallback(() => {
        if (selectedNode) {
            updateNetworkWithHistory(prev => ({
                junctions: prev.junctions.filter(j => j.id !== selectedNode),
                reservoirs: prev.reservoirs.filter(r => r.id !== selectedNode),
                tanks: prev.tanks.filter(t => t.id !== selectedNode),
                pipes: prev.pipes.filter(p => p.fromNode !== selectedNode && p.toNode !== selectedNode),
                pumps: prev.pumps.filter(p => p.fromNode !== selectedNode && p.toNode !== selectedNode),
                valves: prev.valves.filter(v => v.fromNode !== selectedNode && v.toNode !== selectedNode),
                patterns: prev.patterns
            }), `Delete node ${selectedNode}`)
            setSelectedNode(null)
        } else if (selectedPipe) {
            updateNetworkWithHistory(prev => ({
                ...prev,
                pipes: prev.pipes.filter(p => p.id !== selectedPipe),
                pumps: prev.pumps.filter(p => p.id !== selectedPipe),
                valves: prev.valves.filter(v => v.id !== selectedPipe)
            }), `Delete link ${selectedPipe}`)
            setSelectedPipe(null)
        }
    }, [selectedNode, selectedPipe, updateNetworkWithHistory])

    // Clear selection and reset mode
    const clearSelection = useCallback(() => {
        setSelectedNode(null)
        setSelectedPipe(null)
        setPipeStartNode(null)
        setPipeVertices([])
        setDrawingMode('select')
    }, [])

    const focusNode = useCallback((nodeId: string) => {
        setDrawingMode('select')
        setSelectedNode(nodeId)
        setSelectedPipe(null)
        setPipeStartNode(null)
        setPipeVertices([])
    }, [])

    // State for map panning via keyboard
    const [mapPanTrigger, setMapPanTrigger] = useState<{ direction: string, timestamp: number } | null>(null)

    const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        setMapPanTrigger({ direction, timestamp: Date.now() })
    }, [])

    // Keyboard shortcuts
    useNetworkKeyboardShortcuts(undo, redo, deleteSelected, clearSelection, handlePan, true)

    // Wrapper for setDrawingMode that clears pending pipe/pump/valve state
    const changeDrawingMode = useCallback((mode: DrawingMode) => {
        setDrawingMode(mode)
        setPipeStartNode(null)
        setPipeVertices([])
    }, [])

    const addJunction = useCallback((lat: number, lng: number) => {
        const id = generateId('J', network.junctions)
        markChanged(`Add junction ${id}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                junctions: [...prev.junctions, { id, name: id, lat, lng, elevation: 0, demand: 0 }]
            }
            updateCurrentState(newState)
            return newState
        })
        // Fetch elevation asynchronously
        getElevation(lat, lng).then(elevation => {
            setNetwork(prev => ({
                ...prev,
                junctions: prev.junctions.map(j =>
                    j.id === id ? { ...j, elevation } : j
                )
            }))
        })
        return id
    }, [network.junctions, markChanged, updateCurrentState])

    const addReservoir = useCallback((lat: number, lng: number) => {
        const id = generateId('R', network.reservoirs)
        markChanged(`Add reservoir ${id}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                reservoirs: [...prev.reservoirs, { id, name: id, lat, lng, head: 100 }]
            }
            updateCurrentState(newState)
            return newState
        })
        // Fetch elevation and set as default head
        getElevation(lat, lng).then(elevation => {
            setNetwork(prev => ({
                ...prev,
                reservoirs: prev.reservoirs.map(r =>
                    r.id === id ? { ...r, head: elevation + 10 } : r
                )
            }))
        })
        return id
    }, [network.reservoirs, markChanged, updateCurrentState])

    const addTank = useCallback((lat: number, lng: number) => {
        const id = generateId('T', network.tanks)
        markChanged(`Add tank ${id}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                tanks: [...prev.tanks, { id, name: id, lat, lng, elevation: 0, initLevel: 10, minLevel: 0, maxLevel: 20, diameter: 50 }]
            }
            updateCurrentState(newState)
            return newState
        })
        // Fetch elevation asynchronously
        getElevation(lat, lng).then(elevation => {
            setNetwork(prev => ({
                ...prev,
                tanks: prev.tanks.map(t =>
                    t.id === id ? { ...t, elevation } : t
                )
            }))
        })
        return id
    }, [network.tanks, markChanged, updateCurrentState])

    const addPipe = useCallback((fromNode: string, toNode: string, vertices: [number, number][] = []) => {
        const id = generateId('P', network.pipes)
        markChanged(`Add pipe ${id}`)
        setNetwork(prev => {
            const fromPos = getNodePosition(prev, fromNode)
            const toPos = getNodePosition(prev, toNode)
            const length =
                fromPos && toPos
                    ? calculatePipeLength(fromPos, toPos, vertices)
                    : 1000
            const newState = {
                ...prev,
                pipes: [...prev.pipes, { id, name: id, fromNode, toNode, vertices, length, diameter: 200, roughness: 100 }]
            }
            updateCurrentState(newState)
            return newState
        })
        return id
    }, [network.pipes, markChanged, updateCurrentState])

    const addPump = useCallback((fromNode: string, toNode: string) => {
        const id = generateId('PU', network.pumps)
        markChanged(`Add pump ${id}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                pumps: [...prev.pumps, { id, name: id, fromNode, toNode, power: 50, speed: 1 }]
            }
            updateCurrentState(newState)
            return newState
        })
        return id
    }, [network.pumps, markChanged, updateCurrentState])

    const addValve = useCallback((fromNode: string, toNode: string) => {
        const id = generateId('V', network.valves)
        markChanged(`Add valve ${id}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                valves: [...prev.valves, { id, name: id, fromNode, toNode, diameter: 200, setting: 50, type: 'PRV' as const }]
            }
            updateCurrentState(newState)
            return newState
        })
        return id
    }, [network.valves, markChanged, updateCurrentState])

    const deleteNode = useCallback((nodeId: string) => {
        markChanged(`Delete node ${nodeId}`)
        setNetwork(prev => {
            const newState = {
                junctions: prev.junctions.filter(j => j.id !== nodeId),
                reservoirs: prev.reservoirs.filter(r => r.id !== nodeId),
                tanks: prev.tanks.filter(t => t.id !== nodeId),
                pipes: prev.pipes.filter(p => p.fromNode !== nodeId && p.toNode !== nodeId),
                pumps: prev.pumps.filter(p => p.fromNode !== nodeId && p.toNode !== nodeId),
                valves: prev.valves.filter(v => v.fromNode !== nodeId && v.toNode !== nodeId),
                patterns: prev.patterns
            }
            updateCurrentState(newState)
            return newState
        })
    }, [markChanged, updateCurrentState])

    const deletePipe = useCallback((pipeId: string) => {
        markChanged(`Delete pipe ${pipeId}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                pipes: prev.pipes.filter(p => p.id !== pipeId)
            }
            updateCurrentState(newState)
            return newState
        })
    }, [markChanged, updateCurrentState])

    const deletePump = useCallback((pumpId: string) => {
        markChanged(`Delete pump ${pumpId}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                pumps: prev.pumps.filter(p => p.id !== pumpId)
            }
            updateCurrentState(newState)
            return newState
        })
    }, [markChanged, updateCurrentState])

    const deleteValve = useCallback((valveId: string) => {
        markChanged(`Delete valve ${valveId}`)
        setNetwork(prev => {
            const newState = {
                ...prev,
                valves: prev.valves.filter(v => v.id !== valveId)
            }
            updateCurrentState(newState)
            return newState
        })
    }, [markChanged, updateCurrentState])

    const getSnapNodes = useCallback(() => {
        const nodes: { id: string; lat: number; lng: number }[] = []
        network.junctions.forEach((j) => nodes.push({ id: j.id, lat: j.lat, lng: j.lng }))
        network.reservoirs.forEach((r) => nodes.push({ id: r.id, lat: r.lat, lng: r.lng }))
        network.tanks.forEach((t) => nodes.push({ id: t.id, lat: t.lat, lng: t.lng }))
        return nodes
    }, [network])

    const completeLinkToNode = useCallback((targetNodeId: string) => {
        if (!pipeStartNode || pipeStartNode === targetNodeId) return false

        if (drawingMode === 'pipe') {
            addPipe(pipeStartNode, targetNodeId, pipeVertices)
        } else if (drawingMode === 'pump') {
            addPump(pipeStartNode, targetNodeId)
        } else if (drawingMode === 'valve') {
            addValve(pipeStartNode, targetNodeId)
        } else {
            return false
        }

        setPipeStartNode(null)
        setPipeVertices([])
        return true
    }, [drawingMode, pipeStartNode, pipeVertices, addPipe, addPump, addValve])

    const cancelLinkDrawing = useCallback(() => {
        setPipeStartNode(null)
        setPipeVertices([])
    }, [])

    const placeNodeAt = useCallback(
        (kind: 'junction' | 'reservoir' | 'tank', lat: number, lng: number) => {
            if (!canEditRef.current) return
            let id: string
            if (kind === 'junction') id = addJunction(lat, lng)
            else if (kind === 'reservoir') id = addReservoir(lat, lng)
            else id = addTank(lat, lng)
            setSelectedNode(id)
            setSelectedPipe(null)
        },
        [addJunction, addReservoir, addTank],
    )

    const startPipeFromNode = useCallback((nodeId: string) => {
        if (!canEditRef.current) return
        setDrawingMode('pipe')
        setPipeStartNode(nodeId)
        setPipeVertices([])
    }, [])

    const tryFinishLinkAt = useCallback((lat: number, lng: number) => {
        if (!pipeStartNode) return false
        const nearest = findNearestNode(getSnapNodes(), lat, lng, undefined, pipeStartNode)
        if (!nearest) return false
        return completeLinkToNode(nearest.id)
    }, [pipeStartNode, getSnapNodes, completeLinkToNode])

    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (!canEditRef.current) return

        if (
            pipeStartNode &&
            (drawingMode === 'pipe' || drawingMode === 'pump' || drawingMode === 'valve')
        ) {
            const snapped = findNearestNode(getSnapNodes(), lat, lng, undefined, pipeStartNode)
            if (snapped && completeLinkToNode(snapped.id)) {
                return
            }
            if (drawingMode === 'pipe') {
                setPipeVertices((prev) => [...prev, [lat, lng]])
            }
            return
        }

        if (drawingMode === 'junction') {
            const id = addJunction(lat, lng)
            setSelectedNode(id)
            setSelectedPipe(null)
        } else if (drawingMode === 'reservoir') {
            const id = addReservoir(lat, lng)
            setSelectedNode(id)
            setSelectedPipe(null)
        } else if (drawingMode === 'tank') {
            const id = addTank(lat, lng)
            setSelectedNode(id)
            setSelectedPipe(null)
        } else if (drawingMode === 'pipe' || drawingMode === 'pump' || drawingMode === 'valve') {
            const snapped = findNearestNode(getSnapNodes(), lat, lng)
            if (snapped) {
                setPipeStartNode(snapped.id)
                setPipeVertices([])
            }
        }
    }, [
        drawingMode,
        addJunction,
        addReservoir,
        addTank,
        pipeStartNode,
        getSnapNodes,
        completeLinkToNode,
    ])

    const handleNodeClick = useCallback((nodeId: string) => {
        if (!canEditRef.current && drawingMode !== 'select') return
        if (drawingMode === 'pipe' || drawingMode === 'pump' || drawingMode === 'valve') {
            if (!pipeStartNode) {
                setPipeStartNode(nodeId)
                setPipeVertices([])
            } else if (pipeStartNode !== nodeId) {
                completeLinkToNode(nodeId)
            }
        } else if (drawingMode === 'delete') {
            deleteNode(nodeId)
        } else if (drawingMode === 'select') {
            setSelectedNode(nodeId)
            setSelectedPipe(null)
        }
    }, [drawingMode, pipeStartNode, completeLinkToNode, deleteNode])

    const handleNodeDoubleClick = useCallback((nodeId: string) => {
        if (!canEditRef.current) return
        if (pipeStartNode && pipeStartNode !== nodeId) {
            completeLinkToNode(nodeId)
        }
    }, [pipeStartNode, completeLinkToNode])

    const handlePipeClick = useCallback((pipeId: string) => {
        if (drawingMode === 'delete') {
            deletePipe(pipeId)
        } else if (drawingMode === 'select') {
            setSelectedPipe(pipeId)
            setSelectedNode(null)
        }
    }, [drawingMode, deletePipe])

    const getAllNodes = useCallback(() => {
        const nodes: { id: string, name: string, lat: number, lng: number, type: 'junction' | 'reservoir' | 'tank' }[] = []
        network.junctions.forEach(j => nodes.push({ id: j.id, name: j.name, lat: j.lat, lng: j.lng, type: 'junction' }))
        network.reservoirs.forEach(r => nodes.push({ id: r.id, name: r.name, lat: r.lat, lng: r.lng, type: 'reservoir' }))
        network.tanks.forEach(t => nodes.push({ id: t.id, name: t.name, lat: t.lat, lng: t.lng, type: 'tank' }))
        return nodes
    }, [network])

    const generateInpFile = useCallback((override?: NetworkState) => {
        const net = override ?? network
        // Sanitize IDs for EPANET (no spaces / odd chars)
        const safeId = (id: string) => String(id).replace(/[^\w.-]/g, '_').slice(0, 31) || 'X'

        let inp = '[TITLE]\nNetwork created in ARUMANIS\n\n'

        inp += '[JUNCTIONS]\n;ID\tElev\tDemand\tPattern\n'
        net.junctions.forEach(j => {
            const elev = Number.isFinite(j.elevation) ? j.elevation : 0
            const demand = Number.isFinite(j.demand) ? j.demand : 0
            if (j.pattern) {
                inp += `${safeId(j.id)}\t${elev}\t${demand}\t${safeId(j.pattern)}\n`
            } else {
                inp += `${safeId(j.id)}\t${elev}\t${demand}\n`
            }
        })

        inp += '\n[RESERVOIRS]\n;ID\tHead\n'
        net.reservoirs.forEach(r => {
            const head = Number(r.head) > 0 ? r.head : 100
            inp += `${safeId(r.id)}\t${head}\n`
        })

        inp += '\n[TANKS]\n;ID\tElevation\tInitLevel\tMinLevel\tMaxLevel\tDiameter\tMinVol\n'
        net.tanks.forEach(t => {
            const elev = Number.isFinite(t.elevation) ? t.elevation : 0
            const init = Number(t.initLevel) > 0 ? t.initLevel : 3
            const minL = Number(t.minLevel) >= 0 ? t.minLevel : 0
            const maxL = Number(t.maxLevel) > minL ? t.maxLevel : Math.max(init + 1, 5)
            const diam = Number(t.diameter) > 0 ? t.diameter : 10
            inp += `${safeId(t.id)}\t${elev}\t${init}\t${minL}\t${maxL}\t${diam}\t0\n`
        })

        inp += '\n[PIPES]\n;ID\tNode1\tNode2\tLength\tDiameter\tRoughness\tMinorLoss\tStatus\n'
        net.pipes.forEach(p => {
            if (p.fromNode === p.toNode) return
            const length = Number(p.length) > 0 ? p.length : 1
            const diameter = Number(p.diameter) > 0 ? p.diameter : 100
            const roughness = Number(p.roughness) > 0 ? p.roughness : 100
            inp += `${safeId(p.id)}\t${safeId(p.fromNode)}\t${safeId(p.toNode)}\t${length}\t${diameter}\t${roughness}\t0\tOpen\n`
        })

        inp += '\n[PUMPS]\n;ID\tNode1\tNode2\tParameters\n'
        net.pumps.forEach(p => {
            if (p.fromNode === p.toNode) return
            const power = Number(p.power) > 0 ? p.power : 10
            inp += `${safeId(p.id)}\t${safeId(p.fromNode)}\t${safeId(p.toNode)}\tPOWER ${power}\n`
        })

        inp += '\n[VALVES]\n;ID\tNode1\tNode2\tDiameter\tType\tSetting\tMinorLoss\n'
        net.valves.forEach(v => {
            if (v.fromNode === v.toNode) return
            const diameter = Number(v.diameter) > 0 ? v.diameter : 100
            const setting = Number.isFinite(v.setting) ? v.setting : 0
            const type = v.type || 'PRV'
            inp += `${safeId(v.id)}\t${safeId(v.fromNode)}\t${safeId(v.toNode)}\t${diameter}\t${type}\t${setting}\t0\n`
        })

        inp += '\n[PATTERNS]\n;ID\tMultipliers\n'
        const patterns = net.patterns?.length
            ? net.patterns
            : [{ id: '1', multipliers: Array.from({ length: 24 }, () => 1) }]
        patterns.forEach(p => {
            const mult = p.multipliers?.length ? p.multipliers : [1]
            for (let i = 0; i < mult.length; i += 6) {
                const chunk = mult.slice(i, i + 6)
                inp += `${safeId(p.id)}\t${chunk.join('\t')}\n`
            }
        })

        inp += '\n[TIMES]\n'
        inp += `Duration           ${formatHoursToInpTime(simulationSettings.duration)}\n`
        inp += `Hydraulic Timestep ${formatHoursToInpTime(simulationSettings.hydraulic_timestep)}\n`
        inp += 'Quality Timestep   0:05\n'
        inp += `Pattern Timestep   ${formatHoursToInpTime(simulationSettings.pattern_timestep)}\n`
        inp += 'Pattern Start      0:00\n'
        inp += `Report Timestep    ${formatHoursToInpTime(simulationSettings.report_timestep)}\n`
        inp += 'Report Start       0:00\n'
        inp += 'Start ClockTime    12 am\n'
        inp += 'Statistic          None\n'

        inp += '\n[OPTIONS]\n'
        inp += `Units              ${simulationSettings.units}\n`
        inp += `Headloss           ${simulationSettings.headloss}\n`
        const hasPattern1 = patterns.some(p => safeId(p.id) === '1')
        if (hasPattern1) {
            inp += 'Pattern            1\n'
        }
        inp += 'Quality            None\n'
        inp += 'Viscosity          1.0\n'
        inp += 'Diffusivity        1.0\n'
        inp += 'Specific Gravity   1.0\n'
        inp += 'Trials             40\n'
        inp += 'Accuracy           0.001\n'
        inp += 'Unbalanced         Continue 10\n'
        inp += 'Checkfreq          2\n'
        inp += 'Maxcheck           10\n'
        inp += 'Damplimit          0\n'

        inp += '\n[REPORT]\n'
        inp += 'Status             Yes\n'
        inp += 'Summary            Yes\n'
        inp += 'Page               0\n'
        inp += 'Nodes              All\n'
        inp += 'Links              All\n'

        inp += '\n[COORDINATES]\n;Node\tX-Coord\tY-Coord\n'
        const nodes: { id: string; lat: number; lng: number }[] = []
        net.junctions.forEach(j => nodes.push({ id: j.id, lat: j.lat, lng: j.lng }))
        net.reservoirs.forEach(r => nodes.push({ id: r.id, lat: r.lat, lng: r.lng }))
        net.tanks.forEach(t => nodes.push({ id: t.id, lat: t.lat, lng: t.lng }))
        nodes.forEach(n => {
            const x = Number(n.lng)
            const y = Number(n.lat)
            if (!Number.isFinite(x) || !Number.isFinite(y)) return
            inp += `${safeId(n.id)}\t${x}\t${y}\n`
        })

        inp += '\n[END]\n'
        return inp
    }, [network, simulationSettings])

    const runSimulation = useCallback(async (): Promise<SimulationResult | null> => {
        // Validation checks
        if (network.junctions.length === 0 && network.reservoirs.length === 0 && network.tanks.length === 0) {
            setSimError('Network harus memiliki minimal 1 node (junction, reservoir, atau tank)')
            return null
        }
        // Auto-fix common EPANET Error 200 causes from GIS/KML imports
        let working = network
        if (working.reservoirs.length === 0 && working.tanks.length === 0 && working.junctions.length > 0) {
            const j = working.junctions[0]!
            const promoted: NetworkState = {
                ...working,
                junctions: working.junctions.slice(1),
                reservoirs: [
                    ...working.reservoirs,
                    {
                        id: j.id.startsWith('R') ? j.id : `R_${j.id}`,
                        name: j.name || 'Sumber (auto)',
                        lat: j.lat,
                        lng: j.lng,
                        head: (Number(j.elevation) || 0) > 0 ? Number(j.elevation) + 30 : 100,
                    },
                ],
            }
            const newId = promoted.reservoirs[promoted.reservoirs.length - 1]!.id
            if (newId !== j.id) {
                promoted.pipes = promoted.pipes.map(p => ({
                    ...p,
                    fromNode: p.fromNode === j.id ? newId : p.fromNode,
                    toNode: p.toNode === j.id ? newId : p.toNode,
                }))
            }
            working = promoted
            setNetwork(promoted)
            updateCurrentState(promoted)
        }

        if (working.reservoirs.length === 0 && working.tanks.length === 0) {
            setSimError(
                'Network harus memiliki minimal 1 reservoir atau tank sebagai sumber air.\n\n' +
                'Tip: dari KML/GIS, pastikan ada titik “Sumber/Reservoir”, atau di editor pilih satu junction → ubah jadi Reservoir.',
            )
            return null
        }
        if (working.pipes.length === 0 && working.pumps.length === 0) {
            setSimError('Network harus memiliki minimal 1 pipe atau pump untuk menghubungkan nodes')
            return null
        }

        // Clamp zero-length pipes (EPANET Error 200)
        if (working.pipes.some(p => !(Number(p.length) > 0))) {
            working = {
                ...working,
                pipes: working.pipes.map(p => ({
                    ...p,
                    length: Number(p.length) > 0 ? p.length : 1,
                    diameter: Number(p.diameter) > 0 ? p.diameter : 100,
                    roughness: Number(p.roughness) > 0 ? p.roughness : 100,
                })),
            }
            setNetwork(working)
            updateCurrentState(working)
        }

        // Get all valid node IDs
        const allNodeIds = new Set([
            ...working.junctions.map(j => j.id),
            ...working.reservoirs.map(r => r.id),
            ...working.tanks.map(t => t.id)
        ])

        // Check if all pipes connect to valid nodes
        const invalidPipes: string[] = []
        for (const pipe of working.pipes) {
            if (!allNodeIds.has(pipe.fromNode) || !allNodeIds.has(pipe.toNode)) {
                invalidPipes.push(pipe.id)
            }
        }
        if (invalidPipes.length > 0) {
            setSimError(`Pipe berikut terhubung ke node yang tidak ada: ${invalidPipes.join(', ')}.\n\nHapus pipe tersebut atau tambahkan node yang diperlukan.`)
            return null
        }

        // Check for pumps connecting to valid nodes
        for (const pump of working.pumps) {
            if (!allNodeIds.has(pump.fromNode) || !allNodeIds.has(pump.toNode)) {
                setSimError(`Pump ${pump.id} terhubung ke node yang tidak ada.`)
                return null
            }
        }

        setIsSimulating(true)
        setSimError(null)
        try {
            const inp = generateInpFile(working)
            const results = await simulationService.runSimulation(inp)
            setSimResults(results)
            return results
        } catch (error) {
            console.error('Simulation failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Simulasi gagal. Periksa koneksi jaringan pipa.'
            setSimError(errorMessage)
            return null
        } finally {
            setIsSimulating(false)
        }
    }, [generateInpFile, simulationService, network, updateCurrentState])

    const clearSimError = useCallback(() => {
        setSimError(null)
    }, [])

    const clearNetwork = useCallback(() => {
        markChanged('Clear network')
        setNetwork(emptyNetwork)
        updateCurrentState(emptyNetwork)
        setSimResults(null)
        setSelectedNode(null)
        setSelectedPipe(null)
        setPipeStartNode(null)
        setNetworkId(null)
        setNetworkName('Untitled Network')
        setPekerjaanId(null)
        setCanEdit(true)
        setSimulationSettings(DEFAULT_SIMULATION_SETTINGS)
        setIsDirty(false)
        clearHistory()
    }, [markChanged, updateCurrentState, clearHistory])

    // Load network from server data
    const loadNetworkFromServer = useCallback((data: {
        id: number
        name: string
        network_data: NetworkState
        pekerjaan_id?: number | null
        can_edit?: boolean
        simulation_settings?: SimulationSettings | null
        last_results?: SimulationResult | null
    }) => {
        setNetworkId(data.id)
        setNetworkName(data.name)

        // Ensure patterns exist
        const networkData = {
            ...data.network_data,
            patterns: data.network_data.patterns || emptyNetwork.patterns
        }

        setNetwork(networkData)
        setPekerjaanId(data.pekerjaan_id ?? null)
        setCanEdit(data.can_edit ?? true)
        setSimulationSettings(data.simulation_settings ?? DEFAULT_SIMULATION_SETTINGS)
        updateCurrentState(networkData)
        setSimResults(data.last_results ?? null)
        setSelectedNode(null)
        setSelectedPipe(null)
        setPipeStartNode(null)
        setPipeVertices([])
        setIsDirty(false)
        clearHistory()
    }, [updateCurrentState, clearHistory])

    // Prepare network data for saving to server
    const getNetworkDataForSave = useCallback(() => ({
        name: networkName,
        network_data: network,
        pekerjaan_id: pekerjaanId,
        simulation_settings: simulationSettings,
    }), [networkName, network, pekerjaanId, simulationSettings])

    // Update functions for properties panel
    const updateJunction = useCallback((id: string, updates: Partial<NetworkJunction>) => {
        setNetwork(prev => ({
            ...prev,
            junctions: prev.junctions.map(j => j.id === id ? { ...j, ...updates } : j)
        }))
    }, [])

    const updateReservoir = useCallback((id: string, updates: Partial<NetworkReservoir>) => {
        setNetwork(prev => ({
            ...prev,
            reservoirs: prev.reservoirs.map(r => r.id === id ? { ...r, ...updates } : r)
        }))
    }, [])

    const updateTank = useCallback((id: string, updates: Partial<NetworkTank>) => {
        setNetwork(prev => ({
            ...prev,
            tanks: prev.tanks.map(t => t.id === id ? { ...t, ...updates } : t)
        }))
    }, [])

    const updatePipe = useCallback((id: string, updates: Partial<NetworkPipe>) => {
        setNetwork(prev => ({
            ...prev,
            pipes: prev.pipes.map(p => p.id === id ? { ...p, ...updates } : p)
        }))
    }, [])

    const updatePump = useCallback((id: string, updates: Partial<NetworkPump>) => {
        setNetwork(prev => ({
            ...prev,
            pumps: prev.pumps.map(p => p.id === id ? { ...p, ...updates } : p)
        }))
    }, [])

    const updateValve = useCallback((id: string, updates: Partial<NetworkValve>) => {
        setNetwork(prev => ({
            ...prev,
            valves: prev.valves.map(v => v.id === id ? { ...v, ...updates } : v)
        }))
    }, [])

    const updatePattern = useCallback((id: string, multipliers: number[]) => {
        setNetwork(prev => ({
            ...prev,
            patterns: prev.patterns.map(p => p.id === id ? { ...p, multipliers } : p)
        }))
    }, [])


    const loadFromInp = useCallback((content: string) => {
        try {
            const parsed = parseInpFile(content)
            markChanged('Import INP file')
            setNetwork(parsed)
            updateCurrentState(parsed)
            setSimResults(null)
            setSelectedNode(null)
            setSelectedPipe(null)
            setPipeStartNode(null)
            setPipeVertices([])
            return true
        } catch (error) {
            console.error('Failed to parse INP file:', error)
            return false
        }
    }, [markChanged, updateCurrentState])

    const loadFromKmz = useCallback(async (file: File): Promise<KmzParseResult | null> => {
        try {
            const result = await parseKmzOrKml(file)
            markChanged('Import KMZ/KML file')
            // Merge with existing network or replace
            setNetwork(prev => {
                const newState = {
                    junctions: [...prev.junctions, ...result.network.junctions],
                    reservoirs: prev.reservoirs,
                    tanks: prev.tanks,
                    pipes: [...prev.pipes, ...result.network.pipes],
                    pumps: prev.pumps,
                    valves: prev.valves,
                    patterns: prev.patterns
                }
                updateCurrentState(newState)
                return newState
            })
            setSimResults(null)
            return result
        } catch (error) {
            console.error('Failed to parse KMZ/KML file:', error)
            return null
        }
    }, [markChanged, updateCurrentState])

    // Load autosave on first render
    const loadFromAutosave = useCallback(() => {
        const autosaveData = loadAutosave()
        if (autosaveData) {
            // Ensure patterns exist in autosave data
            const networkWithPatterns = {
                ...autosaveData.network,
                patterns: autosaveData.network.patterns || emptyNetwork.patterns
            }

            setNetwork(networkWithPatterns)
            setNetworkName(autosaveData.name)
            updateCurrentState(networkWithPatterns)
            return { ...autosaveData, network: networkWithPatterns }
        }
        return null
    }, [loadAutosave, updateCurrentState])

    const updateSimulationSettings = useCallback((settings: SimulationSettings) => {
        if (!canEditRef.current) return
        setSimulationSettings(settings)
        setIsDirty(true)
    }, [])

    return {
        // State
        network,
        networkId,
        networkName,
        setNetworkName,
        pekerjaanId,
        setPekerjaanId,
        canEdit,
        simulationSettings,
        setSimulationSettings: updateSimulationSettings,
        drawingMode,
        setDrawingMode: changeDrawingMode,
        selectedNode,
        selectedPipe,
        pipeStartNode,
        pipeVertices,
        simResults,
        isSimulating,
        isDirty,

        // Actions
        handleMapClick,
        handleNodeClick,
        handleNodeDoubleClick,
        handlePipeClick,
        cancelLinkDrawing,
        completeLinkToNode,
        tryFinishLinkAt,
        placeNodeAt,
        startPipeFromNode,
        getAllNodes,
        runSimulation,
        clearNetwork,
        generateInpFile,

        // CRUD operations
        updateJunction,
        updateReservoir,
        updateTank,
        updatePipe,
        updatePump,
        updateValve,
        updatePattern,
        deletePump,
        deleteValve,
        deleteSelected,
        clearSelection,
        focusNode,

        // Import/Export
        loadFromInp,
        loadFromKmz,

        // Server persistence
        loadNetworkFromServer,
        getNetworkDataForSave,

        // Undo/Redo
        undo,
        redo,
        canUndo,
        canRedo,

        // Auto-save
        lastSaved,
        hasUnsavedChanges,
        loadFromAutosave,
        clearAutosave,
        hasAutosave,
        saveToLocalStorage,

        // Panning
        mapPanTrigger,

        // Errors
        simError,
        clearSimError
    }
}
