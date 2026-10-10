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
