export {
    usePengawas as usePengawasList,
    usePengawasStatistics,
    useCreatePengawas,
    useUpdatePengawas,
    useDeletePengawas,
} from '../api/pengawas'

export const pengawasKeys = {
    all: ['pengawas'] as const,
    lists: () => [...pengawasKeys.all, 'list'] as const,
    statistics: () => [...pengawasKeys.all, 'statistics'] as const,
}