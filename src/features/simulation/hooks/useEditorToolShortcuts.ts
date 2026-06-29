import { useEffect } from 'react'
import type { DrawingMode } from './useNetworkEditor'
import { SHORTCUT_TO_MODE } from '../constants/editor-tools'

interface EditorToolShortcutsOptions {
    enabled?: boolean
    canEdit?: boolean
    onModeChange: (mode: DrawingMode) => void
    onFinishLink?: () => void
    onCancelLink?: () => void
    onShowHelp?: () => void
}

export function useEditorToolShortcuts({
    enabled = true,
    canEdit = true,
    onModeChange,
    onFinishLink,
    onCancelLink,
    onShowHelp,
}: EditorToolShortcutsOptions) {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return
            }

            if (e.key === '?' && onShowHelp) {
                e.preventDefault()
                onShowHelp()
                return
            }

            if (e.key === 'Enter' && onFinishLink) {
                e.preventDefault()
                onFinishLink()
                return
            }

            if (!canEdit) return

            const mode = SHORTCUT_TO_MODE[e.key.toLowerCase()]
            if (mode) {
                e.preventDefault()
                onModeChange(mode)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [enabled, canEdit, onModeChange, onFinishLink, onCancelLink, onShowHelp])
}