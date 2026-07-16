import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
    fetchOnlyOfficeConfig,
    type OnlyOfficeEditorConfig,
    type OnlyOfficeEditorMode,
} from '../api/onlyoffice'
import {
    destroyOnlyOfficeEditor,
    forceSaveOnlyOfficeEditor,
    isMobileDocumentViewport,
    mapOnlyOfficeLoadError,
    mapOnlyOfficeRuntimeError,
    resolveDocumentServerUrl,
} from './onlyoffice-editor'

type UseOnlyOfficeEditorOptions = {
    mediaId: number
    enabled?: boolean
    /** Initial preferred mode; may be forced to view on mobile or by permissions */
    preferredMode?: OnlyOfficeEditorMode
    forceViewOnMobile?: boolean
}

export function useOnlyOfficeEditor({
    mediaId,
    enabled = true,
    preferredMode,
    forceViewOnMobile = true,
}: UseOnlyOfficeEditorOptions) {
    const editorInstanceId = useId().replace(/:/g, '')
    const editorDomId = `onlyoffice-${editorInstanceId}`
    const documentDirtyRef = useRef(false)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editorConfig, setEditorConfig] = useState<OnlyOfficeEditorConfig | null>(null)
    const [editorMounted, setEditorMounted] = useState(false)
    const [mode, setMode] = useState<OnlyOfficeEditorMode | undefined>(preferredMode)
    const [dirty, setDirty] = useState(false)
    const [saving, setSaving] = useState(false)
    const [reloadToken, setReloadToken] = useState(0)
    const [isMobile, setIsMobile] = useState(() => isMobileDocumentViewport())

    useEffect(() => {
        const onResize = () => setIsMobile(isMobileDocumentViewport())
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const fetchConfig = useCallback(
        async (requestedMode?: OnlyOfficeEditorMode) => {
            if (!enabled || !Number.isFinite(mediaId) || mediaId <= 0) {
                setError('Media ID tidak valid.')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)
            setEditorConfig(null)
            setEditorMounted(false)
            documentDirtyRef.current = false
            setDirty(false)

            try {
                const mobileView = forceViewOnMobile && isMobileDocumentViewport()
                const effectiveMode: OnlyOfficeEditorMode | undefined = mobileView
                    ? 'view'
                    : requestedMode

                const config = await fetchOnlyOfficeConfig(mediaId, effectiveMode)
                setEditorConfig(config)
                setMode(config.mode)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat editor ONLYOFFICE.')
            } finally {
                setLoading(false)
            }
        },
        [enabled, mediaId, forceViewOnMobile],
    )

    useEffect(() => {
        if (!enabled) return
        void fetchConfig(preferredMode)
    }, [enabled, mediaId, preferredMode, reloadToken, fetchConfig])

    useEffect(() => {
        if (!enabled || loading || error || !editorConfig) {
            setEditorMounted(false)
            return
        }

        const mountTimer = window.setTimeout(() => setEditorMounted(true), 0)
        return () => {
            window.clearTimeout(mountTimer)
            setEditorMounted(false)
            destroyOnlyOfficeEditor(editorDomId)
        }
    }, [enabled, loading, error, editorConfig, editorDomId])

    const switchMode = useCallback(
        async (next: OnlyOfficeEditorMode) => {
            if (next === 'edit' && editorConfig && !editorConfig.can_edit) {
                setError('Anda tidak memiliki izin mengedit dokumen ini.')
                return
            }
            if (dirty) {
                const ok = window.confirm(
                    'Ada perubahan belum tersimpan. Ganti mode tetap dilanjutkan? Perubahan mungkin hilang.',
                )
                if (!ok) return
            }
            await fetchConfig(next)
        },
        [dirty, editorConfig, fetchConfig],
    )

    const retry = useCallback(() => {
        setReloadToken((n) => n + 1)
    }, [])

    const requestForceSave = useCallback(() => {
        setSaving(true)
        const ok = forceSaveOnlyOfficeEditor(editorDomId)
        if (!ok) {
            setSaving(false)
            return false
        }
        window.setTimeout(() => {
            setSaving(false)
            documentDirtyRef.current = false
            setDirty(false)
        }, 1500)
        return true
    }, [editorDomId])

    const handleLoadComponentError = useCallback((errorCode: number, errorDescription: string) => {
        setError(mapOnlyOfficeLoadError(errorCode, errorDescription))
        setEditorMounted(false)
    }, [])

    const handleDocumentStateChange = useCallback((event: { data?: boolean }) => {
        if (event.data) {
            documentDirtyRef.current = true
            setDirty(true)
        } else {
            documentDirtyRef.current = false
            setDirty(false)
        }
    }, [])

    const handleRuntimeError = useCallback((event: { data?: string }) => {
        setError(mapOnlyOfficeRuntimeError(event))
        setEditorMounted(false)
    }, [])

    const documentServerUrl = editorConfig
        ? resolveDocumentServerUrl(editorConfig.documentServerUrl)
        : ''

    return {
        editorDomId,
        loading,
        error,
        editorConfig,
        editorMounted,
        mode,
        dirty,
        dirtyRef: documentDirtyRef,
        saving,
        isMobile,
        documentServerUrl,
        canEdit: editorConfig?.can_edit ?? false,
        switchMode,
        retry,
        requestForceSave,
        handleLoadComponentError,
        handleDocumentStateChange,
        handleRuntimeError,
        destroy: () => destroyOnlyOfficeEditor(editorDomId),
    }
}
