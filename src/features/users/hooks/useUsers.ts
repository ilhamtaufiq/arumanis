import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createUser, deleteUser, getUser, getUsers, impersonateUser, updateUser } from '../api'
import type { UserFormData, UserParams } from '../types'

const resource = createResourceHooks<UserParams, UserFormData, { id: number; data: UserFormData }>({
    key: 'users',
    listFn: getUsers,
    detailFn: getUser,
    createFn: createUser,
    updateFn: updateUser,
    deleteFn: deleteUser,
    messages: {
        deleteSuccess: 'User berhasil dihapus',
        deleteError: 'Gagal menghapus user',
    },
})

export const userKeys = resource.keys
export const useUsersList = resource.useList
export const useUserDetail = resource.useDetail
export const useCreateUser = resource.useCreate!
export const useUpdateUser = resource.useUpdate!
export const useDeleteUser = resource.useDelete!

export function useImpersonateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => impersonateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
    })
}