import { useState, useCallback, useRef, useEffect } from 'react'
import type { NetworkState } from './useNetworkEditor'

const MAX_HISTORY_SIZE = 50

interface HistoryEntry {
  state: NetworkState
  description: string
  timestamp: number
}

/**
 * Hook for managing undo/redo functionality
 */
export function useNetworkHistory(
  initialState: NetworkState,
  onStateChange: (state: NetworkState) => void
) {
  // History stacks
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([])
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([])

  // Current state reference for comparison
  const currentStateRef = useRef<NetworkState>(initialState)

  // Track if we're in the middle of an undo/redo operation
  const isUndoRedoRef = useRef(false)


  /**
   * Push current state to history before making changes
   */
  const pushToHistory = useCallback((description: string = 'Change') => {
    if (isUndoRedoRef.current) return

    const entry: HistoryEntry = {
      state: JSON.parse(JSON.stringify(currentStateRef.current)),
      description,
      timestamp: Date.now(),
    }

    setUndoStack(prev => {
      const newStack = [...prev, entry]
      // Limit history size
      if (newStack.length > MAX_HISTORY_SIZE) {
        return newStack.slice(-MAX_HISTORY_SIZE)
      }
      return newStack
    })

    // Clear redo stack when new action is performed
    setRedoStack([])
  }, [])

  /**
   * Update current state reference
   */
  const updateCurrentState = useCallback((newState: NetworkState) => {
    currentStateRef.current = newState
  }, [])

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    if (undoStack.length === 0) return false

    isUndoRedoRef.current = true

    // Save current state to redo stack
    const currentEntry: HistoryEntry = {
      state: JSON.parse(JSON.stringify(currentStateRef.current)),
      description: 'Redo point',
      timestamp: Date.now(),
    }
    setRedoStack(prev => [...prev, currentEntry])

    // Pop from undo stack and apply
    const lastEntry = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))

    currentStateRef.current = lastEntry.state
    onStateChange(lastEntry.state)

    isUndoRedoRef.current = false
    return true
  }, [undoStack, onStateChange])

  /**
   * Redo the last undone action
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return false

    isUndoRedoRef.current = true

    // Save current state to undo stack
    const currentEntry: HistoryEntry = {
      state: JSON.parse(JSON.stringify(currentStateRef.current)),
      description: 'Undo point',
      timestamp: Date.now(),
    }
    setUndoStack(prev => [...prev, currentEntry])

    // Pop from redo stack and apply
    const lastEntry = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))

    currentStateRef.current = lastEntry.state
    onStateChange(lastEntry.state)

    isUndoRedoRef.current = false
    return true
  }, [redoStack, onStateChange])

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setUndoStack([])
    setRedoStack([])
  }, [])

  /**
   * Check if undo is available
   */
  const canUndo = undoStack.length > 0

  /**
   * Check if redo is available
   */
  const canRedo = redoStack.length > 0

  return {
    pushToHistory,
    updateCurrentState,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    undoStackSize: undoStack.length,
    redoStackSize: redoStack.length,
  }
}

/**
 * Hook for keyboard shortcuts (undo/redo)
 */
export function useNetworkKeyboardShortcuts(
  undo: () => boolean,
  redo: () => boolean,
  deleteSelected: () => void,
  clearSelection: () => void,
  onPan?: (direction: 'up' | 'down' | 'left' | 'right') => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl+Y / Cmd+Shift+Z = Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault()
        redo()
        return
      }

      // Delete / Backspace = Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }

      // Escape = Clear selection
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        return
      }

      // Arrow keys for panning
      if (onPan) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          onPan('up')
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          onPan('down')
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          onPan('left')
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          onPan('right')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteSelected, clearSelection, onPan, enabled])
}

// =============================================================================
// Local Storage Auto-Save
// =============================================================================

const AUTOSAVE_KEY = 'arumanis_simulation_autosave'
const AUTOSAVE_DEBOUNCE_MS = 2000

interface AutosaveData {
  network: NetworkState
  name: string
  timestamp: number
}

/**
 * Hook for auto-saving to localStorage
 */
export function useNetworkAutosave(
  network: NetworkState,
  networkName: string,
  enabled: boolean = true
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Save to localStorage with debounce
  useEffect(() => {
    if (!enabled) return

    // Check if network has any data
    const hasData =
      network.junctions.length > 0 ||
      network.reservoirs.length > 0 ||
      network.tanks.length > 0 ||
      network.pipes.length > 0

    if (!hasData) return

    setHasUnsavedChanges(true)

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        const data: AutosaveData = {
          network,
          name: networkName || 'Untitled Network',
          timestamp: Date.now(),
        }
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Failed to autosave network:', error)
      }
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [network, networkName, enabled])

  /**
   * Load autosaved network from localStorage
   */
  const loadAutosave = useCallback((): AutosaveData | null => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY)
      if (!saved) return null
      return JSON.parse(saved) as AutosaveData
    } catch {
      return null
    }
  }, [])

  /**
   * Clear autosave from localStorage
   */
  const clearAutosave = useCallback(() => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY)
      setLastSaved(null)
    } catch (error) {
      console.error('Failed to clear autosave:', error)
    }
  }, [])

  /**
   * Check if autosave exists
   */
  const hasAutosave = useCallback((): boolean => {
    return localStorage.getItem(AUTOSAVE_KEY) !== null
  }, [])

  /**
   * Force save now (bypass debounce)
   */
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      const data: AutosaveData = {
        network,
        name: networkName || 'Untitled Network',
        timestamp: Date.now(),
      }
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save network:', error)
    }
  }, [network, networkName])

  return {
    lastSaved,
    hasUnsavedChanges,
    loadAutosave,
    clearAutosave,
    hasAutosave,
    saveNow,
  }
}
