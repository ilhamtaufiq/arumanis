import api from '@/lib/api-client';
import type { Pekerjaan, PekerjaanResponse, DocumentType, DocumentRegister, DocumentRegisterResponse } from '../types';

export const getPekerjaan = async (params?: { 
    page?: number; 
    kecamatan_id?: number; 
    desa_id?: number; 
    kegiatan_id?: number; 
    tag_id?: number; 
    pengawas_id?: number; 
    search?: string; 
    tahun?: string; 
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}) => {
    const url = '/pekerjaan';
    const kecamatanId = params?.kecamatan_id === 0 ? undefined : params?.kecamatan_id;
    const kegiatanId = params?.kegiatan_id === 0 ? undefined : params?.kegiatan_id;
    const tagId = params?.tag_id === 0 ? undefined : params?.tag_id;
    const pengawasId = params?.pengawas_id === 0 ? undefined : params?.pengawas_id;

    return api.get<PekerjaanResponse>(url, {
        params: {
            page: params?.page,
            search: params?.search,
            tahun: params?.tahun,
            per_page: params?.per_page,
            kecamatan_id: kecamatanId,
            kegiatan_id: kegiatanId,
            tag_id: tagId,
            pengawas_id: pengawasId,
            sort_by: params?.sort_by,
            sort_direction: params?.sort_direction,
        }
    });
};

export const getPekerjaanById = async (id: number) => {
    return api.get<{ data: Pekerjaan }>(`/pekerjaan/${id}`);
};

export const createPekerjaan = async (data: Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>) => {
    return api.post<{ data: Pekerjaan }>('/pekerjaan', data);
};

export const updatePekerjaan = async (id: number, data: Partial<Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>>) => {
    return api.put<{ data: Pekerjaan }>(`/pekerjaan/${id}`, data);
};

export const deletePekerjaan = async (id: number) => {
    await api.delete(`/pekerjaan/${id}`);
};

export const importPekerjaan = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pekerjaan/import', formData);
};

export const downloadPekerjaanTemplate = async () => {
    const data = await api.get<Blob>('/pekerjaan/import/template', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_pekerjaan.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const getDocumentRegister = async (params?: { page?: number; search?: string; tahun?: string; per_page?: number }) => {
    return api.get<PekerjaanResponse>('/pekerjaan/document-register', { params });
};

export const getDocumentSequence = async (year: string | number) => {
    return api.get<{ year: number; last_number: number }>(`/berita-acara/sequence`, { params: { year } });
};

export const updateDocumentSequence = async (year: string | number, last_number: number) => {
    return api.post<{ year: number; last_number: number }>(`/berita-acara/sequence`, { year, last_number });
};

export const getDocumentTypes = async () => {
    return api.get<DocumentType[]>('/document-types');
};

export const getDocumentRegisters = async (params?: { page?: number; search?: string; tahun?: string; type_id?: number }) => {
    return api.get<DocumentRegisterResponse>('/document-registers', { params });
};

export const createDocumentRegister = async (data: {
    kontrak_id: number;
    type_id: number;
    tanggal: string;
    description?: string;
    sequence_number?: number;
}) => {
    return api.post<DocumentRegister>('/document-registers', data);
};

export const updateDocumentRegister = async (id: number, data: {
    tanggal: string;
    nomor: string;
    description?: string;
}) => {
    return api.put<DocumentRegister>(`/document-registers/${id}`, data);
};

export const deleteDocumentRegister = async (id: number) => {
    return api.delete(`/document-registers/${id}`);
};

export const createDocumentType = async (data: Partial<DocumentType>) => {
    return api.post<DocumentType>('/document-types', data);
};

export const updateDocumentType = async (id: number, data: Partial<DocumentType>) => {
    return api.put<DocumentType>(`/document-types/${id}`, data);
};

export const deleteDocumentType = async (id: number) => {
    return api.delete<{ message: string }>(`/document-types/${id}`);
};