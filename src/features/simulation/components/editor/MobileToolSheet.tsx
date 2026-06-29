import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Wrench } from 'lucide-react'
import type { DrawingMode } from '../../hooks/useNetworkEditor'
import { EditorToolbar } from './EditorToolbar'

interface MobileToolSheetProps {
    drawingMode: DrawingMode
    canEdit: boolean
    allowedModes: DrawingMode[] | null
    onModeChange: (mode: DrawingMode) => void
    onShowShortcuts: () => void
    onStartWizard: () => void
    pipeStartNode: string | null
    onCancelLink: () => void
    onFinishLink?: () => void
}

export function MobileToolSheet(props: MobileToolSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="lg"
                    className="fixed bottom-6 right-6 z-[1100] h-14 w-14 rounded-full shadow-lg lg:hidden"
                    aria-label="Buka toolbar"
                >
                    <Wrench className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] overflow-y-auto lg:hidden">
                <SheetHeader>
                    <SheetTitle>Alat Editor</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                    <EditorToolbar {...props} compact />
                </div>
            </SheetContent>
        </Sheet>
    )
}