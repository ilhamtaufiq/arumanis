import api from '@/lib/api-client'
import type {
  SimulationNetwork,
  SimulationNetworkVersion,
  CreateSimulationNetworkRequest,
  UpdateSimulationNetworkRequest,
  ListSimulationNetworksParams,
  PaginatedResponse,
  ApiResponse,
} from '../types'

const ENDPOINT = '/simulation-networks'

/**
 * List all simulation networks accessible by the current user
 */
export async function getSimulationNetworks(
  params?: ListSimulationNetworksParams
): Promise<PaginatedResponse<SimulationNetwork>> {
  const response = await api.get<ApiResponse<PaginatedResponse<SimulationNetwork>>>(ENDPOINT, {
    params: params as Record<string, string | number | undefined>,
  })
  return response.data
}

/**
 * Get a single simulation network by ID
 */
export async function getSimulationNetwork(id: number): Promise<SimulationNetwork> {
  const response = await api.get<ApiResponse<SimulationNetwork>>(`${ENDPOINT}/${id}`)
  return response.data
}

/**
 * Create a new simulation network
 */
export async function createSimulationNetwork(
  data: CreateSimulationNetworkRequest
): Promise<SimulationNetwork> {
  const response = await api.post<ApiResponse<SimulationNetwork>>(ENDPOINT, data)
  return response.data
}

/**
 * Update an existing simulation network
 */
export async function updateSimulationNetwork(
  id: number,
  data: UpdateSimulationNetworkRequest
): Promise<SimulationNetwork> {
  const response = await api.put<ApiResponse<SimulationNetwork>>(`${ENDPOINT}/${id}`, data)
  return response.data
}

/**
 * Delete a simulation network
 */
export async function deleteSimulationNetwork(id: number): Promise<void> {
  await api.delete<ApiResponse<void>>(`${ENDPOINT}/${id}`)
}

/**
 * Get version history for a network
 */
export async function getNetworkVersions(
  networkId: number
): Promise<SimulationNetworkVersion[]> {
  const response = await api.get<ApiResponse<SimulationNetworkVersion[]>>(
    `${ENDPOINT}/${networkId}/versions`
  )
  return response.data
}

/**
 * Get a specific version's data
 */
export async function getNetworkVersion(
  networkId: number,
  version: number
): Promise<SimulationNetworkVersion> {
  const response = await api.get<ApiResponse<SimulationNetworkVersion>>(
    `${ENDPOINT}/${networkId}/versions/${version}`
  )
  return response.data
}

/**
 * Restore network to a specific version
 */
export async function restoreNetworkVersion(
  networkId: number,
  version: number
): Promise<SimulationNetwork> {
  const response = await api.post<ApiResponse<SimulationNetwork>>(
    `${ENDPOINT}/${networkId}/versions/${version}/restore`
  )
  return response.data
}

/**
 * Save simulation results to the network
 */
export async function saveSimulationResults(
  networkId: number,
  results: unknown
): Promise<void> {
  await api.post<ApiResponse<void>>(`${ENDPOINT}/${networkId}/results`, { results })
}

/**
 * Duplicate a network
 */
export async function duplicateNetwork(
  networkId: number,
  name?: string
): Promise<SimulationNetwork> {
  const response = await api.post<ApiResponse<SimulationNetwork>>(
    `${ENDPOINT}/${networkId}/duplicate`,
    { name }
  )
  return response.data
}

/**
 * Get networks linked to a specific pekerjaan
 */
export async function getNetworksByPekerjaan(
  pekerjaanId: number
): Promise<SimulationNetwork[]> {
  const response = await api.get<ApiResponse<SimulationNetwork[]>>(
    `${ENDPOINT}/pekerjaan/${pekerjaanId}`
  )
  return response.data
}

// =============================================================================
// React Query Hooks
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const simulationNetworkKeys = {
  all: ['simulation-networks'] as const,
  lists: () => [...simulationNetworkKeys.all, 'list'] as const,
  list: (params?: ListSimulationNetworksParams) =>
    [...simulationNetworkKeys.lists(), params] as const,
  details: () => [...simulationNetworkKeys.all, 'detail'] as const,
  detail: (id: number) => [...simulationNetworkKeys.details(), id] as const,
  versions: (id: number) => [...simulationNetworkKeys.detail(id), 'versions'] as const,
  byPekerjaan: (pekerjaanId: number) =>
    [...simulationNetworkKeys.all, 'pekerjaan', pekerjaanId] as const,
}

/**
 * Hook to list simulation networks
 */
export function useSimulationNetworks(params?: ListSimulationNetworksParams) {
  return useQuery({
    queryKey: simulationNetworkKeys.list(params),
    queryFn: () => getSimulationNetworks(params),
  })
}

/**
 * Hook to get a single simulation network
 */
export function useSimulationNetwork(id: number | null) {
  return useQuery({
    queryKey: simulationNetworkKeys.detail(id!),
    queryFn: () => getSimulationNetwork(id!),
    enabled: id !== null,
  })
}

/**
 * Hook to get networks for a pekerjaan
 */
export function useSimulationNetworksByPekerjaan(pekerjaanId: number | null) {
  return useQuery({
    queryKey: simulationNetworkKeys.byPekerjaan(pekerjaanId!),
    queryFn: () => getNetworksByPekerjaan(pekerjaanId!),
    enabled: pekerjaanId !== null,
  })
}

/**
 * Hook to get version history
 */
export function useNetworkVersions(networkId: number | null) {
  return useQuery({
    queryKey: simulationNetworkKeys.versions(networkId!),
    queryFn: () => getNetworkVersions(networkId!),
    enabled: networkId !== null,
  })
}

/**
 * Hook to create a simulation network
 */
export function useCreateSimulationNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSimulationNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.lists() })
    },
  })
}

/**
 * Hook to update a simulation network
 */
export function useUpdateSimulationNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSimulationNetworkRequest }) =>
      updateSimulationNetwork(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.lists() })
    },
  })
}

/**
 * Hook to delete a simulation network
 */
export function useDeleteSimulationNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSimulationNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.lists() })
    },
  })
}

/**
 * Hook to restore a network version
 */
export function useRestoreNetworkVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ networkId, version }: { networkId: number; version: number }) =>
      restoreNetworkVersion(networkId, version),
    onSuccess: (_, { networkId }) => {
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.detail(networkId) })
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.versions(networkId) })
    },
  })
}

/**
 * Hook to save simulation results
 */
export function useSaveSimulationResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ networkId, results }: { networkId: number; results: unknown }) =>
      saveSimulationResults(networkId, results),
    onSuccess: (_, { networkId }) => {
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.detail(networkId) })
    },
  })
}

/**
 * Hook to duplicate a network
 */
export function useDuplicateNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ networkId, name }: { networkId: number; name?: string }) =>
      duplicateNetwork(networkId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: simulationNetworkKeys.lists() })
    },
  })
}
