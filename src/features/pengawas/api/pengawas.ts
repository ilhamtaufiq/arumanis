import api from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PengawasDTO, PengawasResponse, PengawasDetailResponse } from '../types';

export const getPengawas = (): Promise<PengawasResponse> => {
    return api.get<PengawasResponse>('/pengawas');
};

export const usePengawas = () => {
    return useQuery({
        queryKey: ['pengawas'],
        queryFn: getPengawas,
    });
};

export const createPengawas = (data: PengawasDTO): Promise<PengawasDetailResponse> => {
    return api.post<PengawasDetailResponse>('/pengawas', data);
};

export const useCreatePengawas = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPengawas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pengawas'] });
        },
    });
};

export const updatePengawas = ({ id, data }: { id: number; data: Partial<PengawasDTO> }): Promise<PengawasDetailResponse> => {
    return api.put<PengawasDetailResponse>(`/pengawas/${id}`, data);
};

export const useUpdatePengawas = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updatePengawas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pengawas'] });
        },
    });
};

export const deletePengawas = (id: number): Promise<void> => {
    return api.delete(`/pengawas/${id}`);
};

export const useDeletePengawas = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePengawas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pengawas'] });
        },
    });
};
