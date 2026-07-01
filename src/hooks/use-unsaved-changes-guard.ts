import { useCallback, useEffect } from 'react'

const DEFAULT_MESSAGE =
    'Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?'

export function useUnsavedChangesGuard(
    hasChanges: boolean,
    message: string = DEFAULT_MESSAGE,
) {
    useEffect(() => {
        if (!hasChanges) return

        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = message
        }

        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [hasChanges, message])

    const confirmLeave = useCallback(() => {
        if (!hasChanges) return true
        return window.confirm(message)
    }, [hasChanges, message])

    return { confirmLeave }
}