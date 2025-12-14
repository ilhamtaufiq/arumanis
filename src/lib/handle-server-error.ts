import { ApiError } from '@/lib/api-client'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
    // eslint-disable-next-line no-console
    console.log(error)

    let errMsg = 'Something went wrong!'

    if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        Number(error.status) === 204
    ) {
        errMsg = 'Content not found.'
    }

    if (error instanceof ApiError) {
        errMsg = (error.data as { title?: string })?.title || error.message
    }

    toast.error(errMsg)
}
