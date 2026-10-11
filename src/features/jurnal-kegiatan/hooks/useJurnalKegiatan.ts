import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { downloadBlob, filenameFromDisposition } from '@/lib/download-file'
import {
    createJurnal,
    deleteJurnal,
    getJurnalAtasan,
    saveJurnalAtasan,
    deleteJurnalBukti,
    getJurnalBukti,
    deleteJurnalFoto,
    exportJurnalPptx,
    getJurnalList,
    getJurnalRhk,
    saveJurnalRhk,
    updateJurnal,
    uploadJurnalBukti,
    uploadJurnalFoto,
} from '../api/jurnal-kegiatan'
import type { JurnalAtasan, JurnalBuktiParams, JurnalExportParams, JurnalParams, JurnalPayload, JurnalRhk } from '../types'

export const jurnalKeys = {
    all: ['jurnal-kegiatan'] as const,
    list: (params: JurnalParams) => [...jurnalKeys.all, 'list', params.tahun, params.bulan] as const,
}

/** Error 422 ditampilkan per field di form, jadi tidak perlu toast global. */
function shouldToast(error: unknown) {
    return !(error instanceof ApiError && error.status === 422)
}

export function useJurnalList(params: JurnalParams) {
    return useQuery({
        queryKey: jurnalKeys.list(params),
        queryFn: () => getJurnalList(params),
        placeholderData: keepPreviousData,
    })
}

export function useCreateJurnal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: JurnalPayload) => createJurnal(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Kegiatan berhasil ditambahkan')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal menyimpan kegiatan'))
        },
    })
}

export function useUpdateJurnal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: JurnalPayload }) => updateJurnal(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Kegiatan berhasil diperbarui')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal memperbarui kegiatan'))
        },
    })
}

export function useDeleteJurnal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteJurnal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Kegiatan berhasil dihapus')
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, 'Gagal menghapus kegiatan'))
        },
    })
}

export function useUploadJurnalFoto() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, files }: { id: number; files: File[] }) => uploadJurnalFoto(id, files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal mengunggah foto'))
        },
    })
}

export function useDeleteJurnalFoto() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, mediaId }: { id: number; mediaId: number }) => deleteJurnalFoto(id, mediaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Foto berhasil dihapus')
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, 'Gagal menghapus foto'))
        },
    })
}

export const jurnalRhkKeys = {
    all: ['jurnal-kegiatan-rhk'] as const,
    byTahun: (tahun: number) => [...jurnalRhkKeys.all, tahun] as const,
}

export function useJurnalRhk(tahun: number, enabled = true) {
    return useQuery({
        queryKey: jurnalRhkKeys.byTahun(tahun),
        queryFn: async () => (await getJurnalRhk(tahun)).data,
        enabled,
    })
}

export function useSaveJurnalRhk(tahun: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: JurnalRhk[]) => saveJurnalRhk(tahun, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalRhkKeys.all })
            toast.success('Pengaturan RHK disimpan')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal menyimpan RHK'))
        },
    })
}

export function useExportJurnalPptx() {
    return useMutation({
        mutationFn: (params: JurnalExportParams) => exportJurnalPptx(params),
        onSuccess: ({ blob, disposition }) => {
            downloadBlob(blob, filenameFromDisposition(disposition, 'laporan-skp.pptx'))
            toast.success('Laporan PPTX berhasil diunduh')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal mengekspor laporan'))
        },
    })
}

export const jurnalBuktiKeys = {
    all: ['jurnal-kegiatan-bukti'] as const,
    byPeriod: (tahun: number, bulan: number) => [...jurnalBuktiKeys.all, tahun, bulan] as const,
}

export function useJurnalBukti(params: JurnalBuktiParams) {
    return useQuery({
        queryKey: jurnalBuktiKeys.byPeriod(params.tahun, params.bulan),
        queryFn: async () => (await getJurnalBukti(params)).data,
        placeholderData: keepPreviousData,
    })
}

export function useUploadJurnalBukti() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tahun, bulan, rhk, files }: JurnalBuktiParams & { rhk: number; files: File[] }) =>
            uploadJurnalBukti({ tahun, bulan, rhk }, files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalBuktiKeys.all })
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal mengunggah foto bukti'))
        },
    })
}

export function useDeleteJurnalBukti() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: number) => deleteJurnalBukti(mediaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalBuktiKeys.all })
            toast.success('Foto bukti dihapus')
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, 'Gagal menghapus foto bukti'))
        },
    })
}

export const jurnalAtasanKeys = {
    all: ['jurnal-kegiatan-atasan'] as const,
}

export function useJurnalAtasan(enabled = true) {
    return useQuery({
        queryKey: jurnalAtasanKeys.all,
        queryFn: async () => (await getJurnalAtasan()).data,
        enabled,
    })
}

export function useSaveJurnalAtasan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: JurnalAtasan) => saveJurnalAtasan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalAtasanKeys.all })
            toast.success('Pejabat Penilai disimpan')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal menyimpan Pejabat Penilai'))
        },
    })
}
