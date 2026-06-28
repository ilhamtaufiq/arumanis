import api from '@/lib/api-client'

export type PuspenReviewNote = {
    id: number
    pekerjaanId: number
    userId: number
    user: {
        id: number
        name: string
        email?: string
    } | null
    content: string
    createdAt: string
    updatedAt: string
}

type PuspenReviewNoteApi = {
    id: number
    pekerjaan_id: number
    user_id: number
    user?: {
        id: number
        name: string
        email?: string
    } | null
    content: string
    created_at: string
    updated_at: string
}

const mapNote = (note: PuspenReviewNoteApi): PuspenReviewNote => ({
    id: note.id,
    pekerjaanId: note.pekerjaan_id,
    userId: note.user_id,
    user: note.user
        ? { id: note.user.id, name: note.user.name, email: note.user.email }
        : null,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
})

export async function getPuspenReviewNotes(pekerjaanId: number): Promise<PuspenReviewNote[]> {
    const response = await api.get<{ data: PuspenReviewNoteApi[] }>(
        `/puspen/pekerjaan/${pekerjaanId}/review-notes`,
    )
    const items = Array.isArray(response.data) ? response.data : []
    return items.map(mapNote)
}

export async function createPuspenReviewNote(
    pekerjaanId: number,
    content: string,
): Promise<PuspenReviewNote> {
    const response = await api.post<PuspenReviewNoteApi>(
        `/puspen/pekerjaan/${pekerjaanId}/review-notes`,
        { content },
    )
    return mapNote(response)
}

export async function deletePuspenReviewNote(noteId: number): Promise<void> {
    await api.delete(`/puspen/review-notes/${noteId}`)
}