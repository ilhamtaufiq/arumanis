import api from '@/lib/api-client';
import type { MasterFasePekerjaan } from '../types/master-fase';

export async function getMasterFasePekerjaan(jenisProyek?: string): Promise<MasterFasePekerjaan[]> {
    const params = new URLSearchParams();
    if (jenisProyek) {
        params.append('jenis_proyek', jenisProyek);
    }
    
    const response = await api.get<{ success: boolean; data: MasterFasePekerjaan[] }>(
        `/master-fase-pekerjaan?${params.toString()}`
    );
    
    return response.data;
}

export async function createMasterFasePekerjaan(data: Partial<MasterFasePekerjaan>): Promise<MasterFasePekerjaan> {
    const response = await api.post<{ success: boolean; data: MasterFasePekerjaan }>(
        '/master-fase-pekerjaan',
        data
    );
    return response.data;
}

export async function updateMasterFasePekerjaan(id: number, data: Partial<MasterFasePekerjaan>): Promise<MasterFasePekerjaan> {
    const response = await api.put<{ success: boolean; data: MasterFasePekerjaan }>(
        `/master-fase-pekerjaan/${id}`,
        data
    );
    return response.data;
}

export async function deleteMasterFasePekerjaan(id: number): Promise<void> {
    await api.delete(`/master-fase-pekerjaan/${id}`);
}
