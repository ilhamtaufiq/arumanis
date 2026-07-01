import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles } from 'lucide-react'
import type { DrawingMode } from '../../hooks/useNetworkEditor'
import { WIZARD_STORAGE_KEY } from '../../constants/editor-tools'

export type WizardStep = 1 | 2 | 3 | null

export function getWizardAllowedModes(step: WizardStep): DrawingMode[] | null {
    if (!step) return null
    if (step === 1) return ['reservoir']
    if (step === 2) return ['junction']
    if (step === 3) return ['pipe']
    return null
}

const STEP_LABELS: Record<1 | 2 | 3, { title: string; desc: string }> = {
    1: {
        title: 'Tambah Reservoir',
        desc: 'Klik peta untuk menempatkan sumber air (reservoir).',
    },
    2: {
        title: 'Tambah Titik Layanan',
        desc: 'Klik peta untuk menambah junction / titik konsumsi.',
    },
    3: {
        title: 'Hubungkan dengan Pipa',
        desc: 'Klik node reservoir lalu node junction untuk membuat pipa.',
    },
}

export function useQuickStartWizard() {
    const [wizardStep, setWizardStep] = useState<WizardStep>(null)
    const [showIntro, setShowIntro] = useState(false)

    useEffect(() => {
        try {
            const done = localStorage.getItem(WIZARD_STORAGE_KEY)
            if (!done) setShowIntro(true)
        } catch {
            // ignore
        }
    }, [])

    const completeWizard = () => {
        setWizardStep(null)
        try {
            localStorage.setItem(WIZARD_STORAGE_KEY, '1')
        } catch {
            // ignore
        }
    }

    const startWizard = () => {
        setShowIntro(false)
        setWizardStep(1)
    }

    return {
        wizardStep,
        setWizardStep,
        showIntro,
        setShowIntro,
        completeWizard,
        startWizard,
    }
}

export function QuickStartIntroDialog({
    open,
    onOpenChange,
    onStart,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onStart: () => void
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md z-[9999]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Mulai Cepat
                    </DialogTitle>
                    <DialogDescription>
                        Panduan 3 langkah untuk membuat jaringan pertama: reservoir → titik
                        layanan → pipa.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Lewati
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false)
                            onStart()
                        }}
                    >
                        Mulai Panduan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function QuickStartWizardProgress({
    step,
    onClose,
}: {
    step: WizardStep
    onClose: () => void
}) {
    if (!step) return null
    const info = STEP_LABELS[step]
    const progress = (step / 3) * 100

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold">
                        Panduan {step}/3: {info.title}
                    </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>
                    Lewati
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{info.desc}</p>
            <Progress value={progress} className="h-1.5" />
        </div>
    )
}

export function useWizardAutoAdvance(
    step: WizardStep,
    setStep: (s: WizardStep) => void,
    complete: () => void,
    counts: { reservoirs: number; junctions: number; pipes: number },
) {
    useEffect(() => {
        if (!step) return
        if (step === 1 && counts.reservoirs > 0) setStep(2)
        if (step === 2 && counts.junctions > 0) setStep(3)
        if (step === 3 && counts.pipes > 0) complete()
    }, [step, counts.reservoirs, counts.junctions, counts.pipes, setStep, complete])
}