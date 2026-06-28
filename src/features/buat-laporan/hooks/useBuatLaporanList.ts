import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { getPengawas } from '@/features/pengawas/api/pengawas'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

export function useBuatLaporanList() {
    const [selectedKecamatan, setSelectedKecamatan] = useState('all')
    const [selectedDesa, setSelectedDesa] = useState('all')
    const [selectedPengawas, setSelectedPengawas] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const { tahunAnggaran } = useAppSettingsValues()

    const kecamatanId =
        selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan, 10)

    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
    })

    const { data: desaRes } = useQuery({
        queryKey: ['desa', kecamatanId],
        queryFn: () => getDesaByKecamatan(kecamatanId!),
        enabled: !!kecamatanId,
    })

    const { data: pengawasRes } = useQuery({
        queryKey: ['pengawas'],
        queryFn: () => getPengawas(),
    })

    const filters = useMemo(
        () => ({
            page: currentPage,
            kecamatan_id: kecamatanId,
            desa_id: selectedDesa === 'all' ? undefined : parseInt(selectedDesa, 10),
            pengawas_id:
                selectedPengawas === 'all' ? undefined : parseInt(selectedPengawas, 10),
            search: debouncedSearch || undefined,
            tahun: tahunAnggaran,
            summary: true,
        }),
        [
            currentPage,
            kecamatanId,
            selectedDesa,
            selectedPengawas,
            debouncedSearch,
            tahunAnggaran,
        ],
    )

    const pekerjaanQuery = useQuery({
        queryKey: ['buat-laporan-pekerjaan', filters],
        queryFn: () => getPekerjaan(filters),
    })

    const pekerjaanList = useMemo(() => {
        const items = pekerjaanQuery.data?.data || []
        return [...items].sort(
            (a, b) => (a.progress_total ?? 0) - (b.progress_total ?? 0),
        )
    }, [pekerjaanQuery.data?.data])

    const handleSearch = (value: string) => {
        setDebouncedSearch(value)
        setCurrentPage(1)
    }

    const handleKecamatanChange = (value: string) => {
        setSelectedKecamatan(value)
        setSelectedDesa('all')
        setCurrentPage(1)
    }

    const handleDesaChange = (value: string) => {
        setSelectedDesa(value)
        setCurrentPage(1)
    }

    const handlePengawasChange = (value: string) => {
        setSelectedPengawas(value)
        setCurrentPage(1)
    }

    return {
        filters,
        kecamatanList: kecamatanRes?.data || [],
        desaList: desaRes?.data || [],
        pengawasList: pengawasRes?.data || [],
        pekerjaanList,
        pekerjaanRes: pekerjaanQuery.data,
        isLoading: pekerjaanQuery.isLoading,
        currentPage,
        setCurrentPage,
        selectedKecamatan,
        selectedDesa,
        selectedPengawas,
        debouncedSearch,
        handleSearch,
        handleKecamatanChange,
        handleDesaChange,
        handlePengawasChange,
    }
}