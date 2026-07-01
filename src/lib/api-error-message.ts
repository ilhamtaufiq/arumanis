import { ApiError } from '@/lib/api-client'

type LaravelValidationData = {
    message?: string
    errors?: Record<string, string[]>
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof ApiError)) {
        return error instanceof Error ? error.message : fallback
    }

    const data = error.data as LaravelValidationData | undefined
    if (data?.errors) {
        const messages = Object.values(data.errors).flat().filter(Boolean)
        if (messages.length > 0) {
            return messages.join(' ')
        }
    }

    return data?.message || error.message || fallback
}