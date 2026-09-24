import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    bulkDeleteUserDriveItems,
    createUserDriveFolder,
    deleteUserDriveItem,
    getUserDriveItem,
    getUserDriveList,
    renameUserDriveItem,
    shareUserDriveItem,
    uploadUserDriveFile,
    type UserDriveListParams,
} from '../api/user-drive';

export const userDriveKeys = {
    all: ['user-drive'] as const,
    lists: () => [...userDriveKeys.all, 'list'] as const,
    list: (params: UserDriveListParams) => [...userDriveKeys.lists(), params] as const,
    details: () => [...userDriveKeys.all, 'detail'] as const,
    detail: (id: number) => [...userDriveKeys.details(), id] as const,
};

export function useUserDriveList(params: UserDriveListParams, enabled = true) {
    return useQuery({
        queryKey: userDriveKeys.list(params),
        queryFn: () => getUserDriveList(params),
        enabled,
    });
}

export function useUserDriveFolderDetail(id: number, enabled = true) {
    return useQuery({
        queryKey: userDriveKeys.detail(id),
        queryFn: () => getUserDriveItem(id),
        enabled: enabled && id > 0,
    });
}

export function useCreateUserDriveFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUserDriveFolder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userDriveKeys.all });
            toast.success('Folder berhasil dibuat');
        },
        onError: () => toast.error('Gagal membuat folder'),
    });
}

export function useUploadUserDriveFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadUserDriveFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userDriveKeys.all });
            toast.success('File berhasil diunggah');
        },
        onError: () => toast.error('Gagal mengunggah file'),
    });
}

export function useRenameUserDriveItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => renameUserDriveItem(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userDriveKeys.all });
            toast.success('Nama berhasil diubah');
        },
        onError: () => toast.error('Gagal mengubah nama'),
    });
}

export function useShareUserDriveItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, userId }: { id: number; userId: number | null }) =>
            shareUserDriveItem(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userDriveKeys.all });
            toast.success('Item berhasil dibagikan');
        },
        onError: () => toast.error('Gagal membagikan item'),
    });
}

export function useDeleteUserDriveItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUserDriveItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userDriveKeys.all });
            toast.success('Item berhasil dihapus');
        },
        onError: () => toast.error('Gagal menghapus item'),
    });
}

export function useBulkDeleteUserDriveItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bulkDeleteUserDriveItems,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userDriveKeys.all });
            toast.success('Item terpilih berhasil dihapus');
        },
        onError: () => toast.error('Gagal menghapus item'),
    });
}