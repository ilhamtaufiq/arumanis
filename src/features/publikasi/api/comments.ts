import api from '@/lib/api-client'
import type { CommentSort } from '../lib/comment-cache'

export type PublikasiCommentUser = {
    id: number
    name: string
    avatar: string | null
    jabatan: string | null
}

export type PublikasiComment = {
    id: number
    blog_id: number
    parent_id: number | null
    depth: number
    body: string | null
    is_deleted: boolean
    user: PublikasiCommentUser | null
    can_delete: boolean
    can_edit: boolean
    is_edited: boolean
    created_at: string
    updated_at: string
}

export type PublikasiCommentNode = PublikasiComment & {
    replies: PublikasiCommentNode[]
}

export type PublikasiCommentsMeta = {
    total: number
    root_total: number
    current_page: number
    last_page: number
    per_page: number
    sort: CommentSort
}

export type PublikasiCommentsResponse = {
    data: PublikasiComment[]
    meta: PublikasiCommentsMeta
}

export const getPublikasiComments = async (
    slug: string,
    page = 1,
    sort: CommentSort = 'oldest',
) => {
    return api.get<PublikasiCommentsResponse>(`/blog/${slug}/comments`, {
        params: { page, sort },
    })
}

export const getPublikasiCommentThread = async (slug: string, commentId: number) => {
    return api.get<{ data: PublikasiComment[] }>(`/blog/${slug}/comments/thread/${commentId}`)
}

export const getPublikasiCommentCount = async (slug: string) => {
    const response = await api.get<{ total: number }>(`/blog/${slug}/comments/count`)
    return response.total
}

export const createPublikasiComment = async (
    slug: string,
    payload: { body: string; parent_id?: number },
) => {
    return api.post<{ data: PublikasiComment; message: string }>(`/blog/${slug}/comments`, payload)
}

export const updatePublikasiComment = async (commentId: number, body: string) => {
    return api.put<{ data: PublikasiComment; message: string }>(`/blog/comments/${commentId}`, {
        body,
    })
}

export const deletePublikasiComment = async (commentId: number) => {
    return api.delete<{ message: string }>(`/blog/comments/${commentId}`)
}

export type PublikasiCommentAdminBlog = {
    id: number
    title: string
    slug: string
    is_published: boolean
}

export type PublikasiCommentAdmin = PublikasiComment & {
    body_preview: string | null
    blog: PublikasiCommentAdminBlog
}

export type PublikasiCommentsAdminResponse = {
    data: PublikasiCommentAdmin[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export const getAdminPublikasiComments = async (params?: {
    page?: number
    per_page?: number
    blog_id?: number
    search?: string
    status?: 'all' | 'active' | 'deleted'
}) => {
    return api.get<PublikasiCommentsAdminResponse>('/blog/comments', {
        params: {
            page: params?.page,
            per_page: params?.per_page,
            blog_id: params?.blog_id,
            search: params?.search,
            status: params?.status === 'all' ? undefined : params?.status,
        },
    })
}