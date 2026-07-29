import { createResourceHooks } from '@/lib/create-resource-hooks';
import {
    createUsulanKegiatan,
    deleteUsulanKegiatan,
    getUsulanKegiatanById,
    getUsulanKegiatanList,
    updateUsulanKegiatan,
} from '../api';
import type { UsulanKegiatanParams } from '../types';

const resource = createResourceHooks<UsulanKegiatanParams, FormData, { id: number; data: FormData }>({
    key: 'usulan-kegiatan',
    listFn: getUsulanKegiatanList,
    detailFn: getUsulanKegiatanById,
    createFn: createUsulanKegiatan,
    updateFn: ({ id, data }) => updateUsulanKegiatan(id, data),
    deleteFn: deleteUsulanKegiatan,
    messages: {
        deleteSuccess: 'Usulan kegiatan berhasil dihapus',
        deleteError: 'Gagal menghapus usulan kegiatan',
    },
});

export const usulanKegiatanKeys = resource.keys;
export const useUsulanKegiatanList = resource.useList;
export const useUsulanKegiatanDetail = resource.useDetail;
export const useCreateUsulanKegiatan = resource.useCreate!;
export const useUpdateUsulanKegiatan = resource.useUpdate!;
export const useDeleteUsulanKegiatan = resource.useDelete!;
