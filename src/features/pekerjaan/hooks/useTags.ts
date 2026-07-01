import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createTag, deleteTag, getTags, updateTag } from '../api/tags'

export type TagsListParams = { search?: string }

const resource = createResourceHooks<TagsListParams, { name: string; color?: string }, { id: number; data: { name?: string; color?: string } }>({
    key: 'tags',
    listFn: getTags,
    createFn: createTag,
    updateFn: ({ id, data }) => updateTag(id, data),
    deleteFn: deleteTag,
    showToasts: false,
})

export const tagKeys = resource.keys
export const useTagsList = resource.useList
export const useCreateTag = resource.useCreate!
export const useUpdateTag = resource.useUpdate!
export const useDeleteTag = resource.useDelete!