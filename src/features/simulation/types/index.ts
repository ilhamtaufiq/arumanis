import type { NetworkState } from '../hooks/useNetworkEditor'

/**
 * Simulation network as stored in the database
 */
export interface SimulationNetwork {
  id: number
  name: string
  description: string | null
  user_id: number
  pekerjaan_id: number | null
  network_data: NetworkState
  simulation_settings: SimulationSettings | null
  last_results: unknown | null
  last_simulated_at: string | null
  version: number
  is_public: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null

  // Relationships
  user?: {
    id: number
    name: string
  }
  pekerjaan?: {
    id: number
    nama_paket: string
    kecamatan_id?: number
    desa_id?: number
  }

  // Computed
  stats?: NetworkStats
  can_edit?: boolean
}

export interface SimulationSettings {
  duration: number // hours
  hydraulic_timestep: number // hours
  pattern_timestep: number // hours
  report_timestep: number // hours
  units: 'LPS' | 'GPM' | 'MGD' | 'CMH'
  headloss: 'H-W' | 'D-W' | 'C-M'
}

export interface NetworkStats {
  junctions: number
  reservoirs: number
  tanks: number
  pipes: number
  pumps: number
  valves: number
  total_nodes: number
  total_links: number
}

export interface SimulationNetworkVersion {
  id: number
  simulation_network_id: number
  version: number
  network_data: NetworkState
  simulation_settings: SimulationSettings | null
  change_description: string | null
  description?: string | null
  changed_by: number
  created_at: string
  changedBy?: {
    id: number
    name: string
  }
  user?: {
    id: number
    name: string
  }
}

/**
 * Request types
 */
export interface CreateSimulationNetworkRequest {
  name: string
  description?: string
  pekerjaan_id?: number | null
  network_data: NetworkState
  simulation_settings?: SimulationSettings
  is_public?: boolean
}

export interface UpdateSimulationNetworkRequest {
  name?: string
  description?: string | null
  pekerjaan_id?: number | null
  network_data?: NetworkState
  simulation_settings?: SimulationSettings
  is_public?: boolean
  save_version?: boolean
  version_description?: string
}

export interface ListSimulationNetworksParams {
  page?: number
  per_page?: number
  pekerjaan_id?: number
  owned_only?: boolean
  search?: string
  sort_by?: 'name' | 'created_at' | 'updated_at'
  sort_dir?: 'asc' | 'desc'
}

/**
 * Response types
 */
export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}
