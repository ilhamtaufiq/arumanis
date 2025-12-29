import { useState, useCallback, useMemo } from 'react'
import { SimulationService, type SimulationResult } from '../services/SimulationService'
import { getElevation } from '../services/ElevationService'
import { parseInpFile } from '../services/InpParser'
import { parseKmzOrKml, type KmzParseResult } from '../services/KmzParser'

export type DrawingMode = 'select' | 'junction' | 'reservoir' | 'tank' | 'pipe' | 'pump' | 'valve' | 'delete'

export interface NetworkJunction {
    id: string
    name: string
    lat: number
    lng: number
    elevation: number
    demand: number
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
}

const generateId = (prefix: string, items: { id: string }[]) => {
    const nums = items.map(i => parseInt(i.id.replace(prefix, '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `${prefix}${max + 1}`
}

export function useNetworkEditor() {
    const [network, setNetwork] = useState<NetworkState>({
        junctions: [],
        reservoirs: [],
        tanks: [],
        pipes: [],
        pumps: [],
        valves: []
    })
    const [drawingMode, setDrawingMode] = useState<DrawingMode>('select')
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [selectedPipe, setSelectedPipe] = useState<string | null>(null)
    const [pipeStartNode, setPipeStartNode] = useState<string | null>(null)
    const [pipeVertices, setPipeVertices] = useState<[number, number][]>([])
    const [simResults, setSimResults] = useState<SimulationResult | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)
    const [simError, setSimError] = useState<string | null>(null)

    const simulationService = useMemo(() => new SimulationService(), [])

    // Wrapper for setDrawingMode that clears pending pipe/pump/valve state
    const changeDrawingMode = useCallback((mode: DrawingMode) => {
        setDrawingMode(mode)
        setPipeStartNode(null)
        setPipeVertices([])
    }, [])

    const addJunction = useCallback((lat: number, lng: number) => {
        const id = generateId('J', network.junctions)
        setNetwork(prev => ({
            ...prev,
            junctions: [...prev.junctions, { id, name: id, lat, lng, elevation: 0, demand: 0 }]
        }))
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
    }, [network.junctions])

    const addReservoir = useCallback((lat: number, lng: number) => {
        const id = generateId('R', network.reservoirs)
        setNetwork(prev => ({
            ...prev,
            reservoirs: [...prev.reservoirs, { id, name: id, lat, lng, head: 100 }]
        }))
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
    }, [network.reservoirs])

    const addTank = useCallback((lat: number, lng: number) => {
        const id = generateId('T', network.tanks)
        setNetwork(prev => ({
            ...prev,
            tanks: [...prev.tanks, { id, name: id, lat, lng, elevation: 0, initLevel: 10, minLevel: 0, maxLevel: 20, diameter: 50 }]
        }))
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
    }, [network.tanks])

    const addPipe = useCallback((fromNode: string, toNode: string, vertices: [number, number][] = []) => {
        const id = generateId('P', network.pipes)
        setNetwork(prev => ({
            ...prev,
            pipes: [...prev.pipes, { id, name: id, fromNode, toNode, vertices, length: 1000, diameter: 200, roughness: 100 }]
        }))
        return id
    }, [network.pipes])

    const addPump = useCallback((fromNode: string, toNode: string) => {
        const id = generateId('PU', network.pumps)
        setNetwork(prev => ({
            ...prev,
            pumps: [...prev.pumps, { id, name: id, fromNode, toNode, power: 50, speed: 1 }]
        }))
        return id
    }, [network.pumps])

    const addValve = useCallback((fromNode: string, toNode: string) => {
        const id = generateId('V', network.valves)
        setNetwork(prev => ({
            ...prev,
            valves: [...prev.valves, { id, name: id, fromNode, toNode, diameter: 200, setting: 50, type: 'PRV' as const }]
        }))
        return id
    }, [network.valves])

    const deleteNode = useCallback((nodeId: string) => {
        setNetwork(prev => ({
            junctions: prev.junctions.filter(j => j.id !== nodeId),
            reservoirs: prev.reservoirs.filter(r => r.id !== nodeId),
            tanks: prev.tanks.filter(t => t.id !== nodeId),
            pipes: prev.pipes.filter(p => p.fromNode !== nodeId && p.toNode !== nodeId),
            pumps: prev.pumps.filter(p => p.fromNode !== nodeId && p.toNode !== nodeId),
            valves: prev.valves.filter(v => v.fromNode !== nodeId && v.toNode !== nodeId)
        }))
    }, [])

    const deletePipe = useCallback((pipeId: string) => {
        setNetwork(prev => ({
            ...prev,
            pipes: prev.pipes.filter(p => p.id !== pipeId)
        }))
    }, [])

    const deletePump = useCallback((pumpId: string) => {
        setNetwork(prev => ({
            ...prev,
            pumps: prev.pumps.filter(p => p.id !== pumpId)
        }))
    }, [])

    const deleteValve = useCallback((valveId: string) => {
        setNetwork(prev => ({
            ...prev,
            valves: prev.valves.filter(v => v.id !== valveId)
        }))
    }, [])

    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (drawingMode === 'junction') {
            addJunction(lat, lng)
        } else if (drawingMode === 'reservoir') {
            addReservoir(lat, lng)
        } else if (drawingMode === 'tank') {
            addTank(lat, lng)
        } else if (drawingMode === 'pipe' && pipeStartNode) {
            // Add waypoint when drawing pipe
            setPipeVertices(prev => [...prev, [lat, lng]])
        }
    }, [drawingMode, addJunction, addReservoir, addTank, pipeStartNode])

    const handleNodeClick = useCallback((nodeId: string) => {
        if (drawingMode === 'pipe') {
            if (!pipeStartNode) {
                setPipeStartNode(nodeId)
                setPipeVertices([])
            } else if (pipeStartNode !== nodeId) {
                addPipe(pipeStartNode, nodeId, pipeVertices)
                setPipeStartNode(null)
                setPipeVertices([])
            }
        } else if (drawingMode === 'pump') {
            if (!pipeStartNode) {
                setPipeStartNode(nodeId)
            } else if (pipeStartNode !== nodeId) {
                addPump(pipeStartNode, nodeId)
                setPipeStartNode(null)
            }
        } else if (drawingMode === 'valve') {
            if (!pipeStartNode) {
                setPipeStartNode(nodeId)
            } else if (pipeStartNode !== nodeId) {
                addValve(pipeStartNode, nodeId)
                setPipeStartNode(null)
            }
        } else if (drawingMode === 'delete') {
            deleteNode(nodeId)
        } else if (drawingMode === 'select') {
            setSelectedNode(nodeId)
            setSelectedPipe(null)
        }
    }, [drawingMode, pipeStartNode, pipeVertices, addPipe, addPump, addValve, deleteNode])

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

    const generateInpFile = useCallback(() => {
        let inp = '[TITLE]\nNetwork created in ARUMANIS\n\n'

        inp += '[JUNCTIONS]\n;ID\tElev\tDemand\n'
        network.junctions.forEach(j => {
            inp += `${j.id}\t${j.elevation}\t${j.demand}\n`
        })

        inp += '\n[RESERVOIRS]\n;ID\tHead\n'
        network.reservoirs.forEach(r => {
            inp += `${r.id}\t${r.head}\n`
        })

        inp += '\n[TANKS]\n;ID\tElevation\tInitLevel\tMinLevel\tMaxLevel\tDiameter\tMinVol\n'
        network.tanks.forEach(t => {
            inp += `${t.id}\t${t.elevation}\t${t.initLevel}\t${t.minLevel}\t${t.maxLevel}\t${t.diameter}\t0\n`
        })

        inp += '\n[PIPES]\n;ID\tNode1\tNode2\tLength\tDiameter\tRoughness\tMinorLoss\tStatus\n'
        network.pipes.forEach(p => {
            inp += `${p.id}\t${p.fromNode}\t${p.toNode}\t${p.length}\t${p.diameter}\t${p.roughness}\t0\tOpen\n`
        })

        inp += '\n[PUMPS]\n;ID\tNode1\tNode2\tParameters\n'
        network.pumps.forEach(p => {
            inp += `${p.id}\t${p.fromNode}\t${p.toNode}\tPOWER ${p.power}\tSPEED ${p.speed}\n`
        })

        inp += '\n[VALVES]\n;ID\tNode1\tNode2\tDiameter\tType\tSetting\tMinorLoss\n'
        network.valves.forEach(v => {
            inp += `${v.id}\t${v.fromNode}\t${v.toNode}\t${v.diameter}\t${v.type}\t${v.setting}\t0\n`
        })

        // Time settings for Extended Period Simulation
        inp += '\n[TIMES]\n'
        inp += 'Duration           24:00\n'
        inp += 'Hydraulic Timestep 1:00\n'
        inp += 'Quality Timestep   0:05\n'
        inp += 'Pattern Timestep   1:00\n'
        inp += 'Pattern Start      0:00\n'
        inp += 'Report Timestep    1:00\n'
        inp += 'Report Start       0:00\n'
        inp += 'Start ClockTime    12 am\n'
        inp += 'Statistic          None\n'

        inp += '\n[OPTIONS]\n'
        inp += 'Units              LPS\n'
        inp += 'Headloss           H-W\n'
        inp += 'Pattern            1\n'
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

        // Report settings
        inp += '\n[REPORT]\n'
        inp += 'Status             Full\n'
        inp += 'Summary            Yes\n'
        inp += 'Page               0\n'
        inp += 'Nodes              All\n'
        inp += 'Links              All\n'

        inp += '\n[COORDINATES]\n;Node\tX-Coord\tY-Coord\n'
        getAllNodes().forEach(n => {
            inp += `${n.id}\t${n.lng * 10000}\t${n.lat * 10000}\n`
        })

        inp += '\n[END]\n'
        return inp
    }, [network, getAllNodes])

    const runSimulation = useCallback(async () => {
        // Validation checks
        if (network.junctions.length === 0 && network.reservoirs.length === 0 && network.tanks.length === 0) {
            setSimError('Network harus memiliki minimal 1 node (junction, reservoir, atau tank)')
            return
        }
        if (network.reservoirs.length === 0 && network.tanks.length === 0) {
            setSimError('Network harus memiliki minimal 1 reservoir atau tank sebagai sumber air')
            return
        }
        if (network.pipes.length === 0 && network.pumps.length === 0) {
            setSimError('Network harus memiliki minimal 1 pipe atau pump untuk menghubungkan nodes')
            return
        }

        // Get all valid node IDs
        const allNodeIds = new Set([
            ...network.junctions.map(j => j.id),
            ...network.reservoirs.map(r => r.id),
            ...network.tanks.map(t => t.id)
        ])

        // Check if all pipes connect to valid nodes
        const invalidPipes: string[] = []
        for (const pipe of network.pipes) {
            if (!allNodeIds.has(pipe.fromNode) || !allNodeIds.has(pipe.toNode)) {
                invalidPipes.push(pipe.id)
            }
        }
        if (invalidPipes.length > 0) {
            setSimError(`Pipe berikut terhubung ke node yang tidak ada: ${invalidPipes.join(', ')}.\n\nHapus pipe tersebut atau tambahkan node yang diperlukan.`)
            return
        }

        // Check for pumps connecting to valid nodes
        for (const pump of network.pumps) {
            if (!allNodeIds.has(pump.fromNode) || !allNodeIds.has(pump.toNode)) {
                setSimError(`Pump ${pump.id} terhubung ke node yang tidak ada.`)
                return
            }
        }

        setIsSimulating(true)
        setSimError(null)
        try {
            const inp = generateInpFile()
            const results = await simulationService.runSimulation(inp)
            setSimResults(results)
        } catch (error) {
            console.error('Simulation failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Simulasi gagal. Periksa koneksi jaringan pipa.'
            setSimError(errorMessage)
        } finally {
            setIsSimulating(false)
        }
    }, [generateInpFile, simulationService, network])

    const clearSimError = useCallback(() => {
        setSimError(null)
    }, [])

    const clearNetwork = useCallback(() => {
        setNetwork({ junctions: [], reservoirs: [], tanks: [], pipes: [], pumps: [], valves: [] })
        setSimResults(null)
        setSelectedNode(null)
        setSelectedPipe(null)
        setPipeStartNode(null)
    }, [])

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

    const clearSelection = useCallback(() => {
        setSelectedNode(null)
        setSelectedPipe(null)
    }, [])

    const loadFromInp = useCallback((content: string) => {
        try {
            const parsed = parseInpFile(content)
            setNetwork(parsed)
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
    }, [])

    const loadFromKmz = useCallback(async (file: File): Promise<KmzParseResult | null> => {
        try {
            const result = await parseKmzOrKml(file)
            // Merge with existing network or replace
            setNetwork(prev => ({
                junctions: [...prev.junctions, ...result.network.junctions],
                reservoirs: prev.reservoirs,
                tanks: prev.tanks,
                pipes: [...prev.pipes, ...result.network.pipes],
                pumps: prev.pumps,
                valves: prev.valves
            }))
            setSimResults(null)
            return result
        } catch (error) {
            console.error('Failed to parse KMZ/KML file:', error)
            return null
        }
    }, [])

    return {
        network,
        drawingMode,
        setDrawingMode: changeDrawingMode,
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
        deletePump,
        deleteValve,
        clearSelection,
        loadFromInp,
        loadFromKmz,
        simError,
        clearSimError
    }
}
