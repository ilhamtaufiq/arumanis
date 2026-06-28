import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createDocumentRegister,
    createDocumentType,
    deleteDocumentRegister,
    deleteDocumentType,
    getDocumentRegister,
    getDocumentRegisters,
    getDocumentSequence,
    getDocumentTypes,
    updateDocumentRegister,
    updateDocumentSequence,
    updateDocumentType,
} from '../api/pekerjaan'
import type { DocumentType } from '../types'

export const documentRegisterKeys = {
    all: ['document-register'] as const,
    list: (params: { page?: number; search?: string; tahun?: string; per_page?: number }) =>
        [...documentRegisterKeys.all, 'list', params] as const,
    registers: (params?: { page?: number; search?: string; tahun?: string; type_id?: number }) =>
        [...documentRegisterKeys.all, 'registers', params] as const,
    types: () => [...documentRegisterKeys.all, 'types'] as const,
    sequence: (year: string | number) => [...documentRegisterKeys.all, 'sequence', year] as const,
}

export function useDocumentRegisterList(
    params: { page?: number; search?: string; tahun?: string; per_page?: number },
    enabled = true,
) {
    return useQuery({
        queryKey: documentRegisterKeys.list(params),
        queryFn: () => getDocumentRegister(params),
        enabled,
    })
}

export function useDocumentRegisterPicker(year: string, enabled = true) {
    return useQuery({
        queryKey: [...documentRegisterKeys.all, 'picker', year] as const,
        queryFn: () => getDocumentRegister({ tahun: year, per_page: -1 }),
        enabled: enabled && !!year,
        staleTime: 60_000,
    })
}

export function useDocumentRegisters(
    params?: { page?: number; search?: string; tahun?: string; type_id?: number },
    enabled = true,
) {
    return useQuery({
        queryKey: documentRegisterKeys.registers(params ?? {}),
        queryFn: () => getDocumentRegisters(params),
        enabled,
    })
}

export function useDocumentTypes(enabled = true) {
    return useQuery({
        queryKey: documentRegisterKeys.types(),
        queryFn: getDocumentTypes,
        enabled,
    })
}

export function useDocumentSequence(year: string | number, enabled = true) {
    return useQuery({
        queryKey: documentRegisterKeys.sequence(year),
        queryFn: () => getDocumentSequence(year),
        enabled: enabled && !!year,
    })
}

export function useUpdateDocumentSequence() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ year, last_number }: { year: string | number; last_number: number }) =>
            updateDocumentSequence(year, last_number),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}

export function useCreateDocumentRegister() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createDocumentRegister,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}

export function useUpdateDocumentRegister() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { tanggal: string; nomor: string; description?: string } }) =>
            updateDocumentRegister(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}

export function useDeleteDocumentRegister() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteDocumentRegister,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}

export function useCreateDocumentType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Partial<DocumentType>) => createDocumentType(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}

export function useUpdateDocumentType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<DocumentType> }) => updateDocumentType(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}

export function useDeleteDocumentType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteDocumentType,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentRegisterKeys.all }),
    })
}