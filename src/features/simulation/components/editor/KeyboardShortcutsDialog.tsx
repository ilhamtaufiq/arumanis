import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ALL_EDITOR_TOOLS } from '../../constants/editor-tools'

interface KeyboardShortcutsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const SYSTEM_SHORTCUTS = [
    { keys: 'Ctrl+Z', action: 'Undo' },
    { keys: 'Ctrl+Y', action: 'Redo' },
    { keys: 'Delete', action: 'Hapus terpilih' },
    { keys: 'Esc', action: 'Batal / pilih mode' },
    { keys: 'Enter', action: 'Selesaikan pipa (snap node terdekat)' },
    { keys: '↑ ↓ ← →', action: 'Geser peta' },
    { keys: '?', action: 'Tampilkan pintasan ini' },
]

export function KeyboardShortcutsDialog({
    open,
    onOpenChange,
}: KeyboardShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md z-[9999]">
                <DialogHeader>
                    <DialogTitle>Pintasan Keyboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                            Alat
                        </p>
                        <div className="space-y-1">
                            {ALL_EDITOR_TOOLS.map((tool) => (
                                <div
                                    key={tool.mode}
                                    className="flex justify-between text-sm"
                                >
                                    <span>{tool.label}</span>
                                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                                        {tool.shortcut}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                            Umum
                        </p>
                        <div className="space-y-1">
                            {SYSTEM_SHORTCUTS.map((s) => (
                                <div key={s.keys} className="flex justify-between text-sm">
                                    <span>{s.action}</span>
                                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                                        {s.keys}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}