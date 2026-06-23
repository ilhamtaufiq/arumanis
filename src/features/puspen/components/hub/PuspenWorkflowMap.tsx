import { ArrowRight, Award, FileSignature, FileUp, Share2, TrendingUp } from 'lucide-react'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

const steps = [
    { label: 'Kelola PDF', icon: FileUp, color: 'bg-[#8ECAE6]' },
    { label: 'TTD Digital', icon: FileSignature, color: 'bg-[#FFB703]' },
    { label: 'Progress Fisik', icon: TrendingUp, color: 'bg-[#2ECC71]' },
    { label: 'Media Share', icon: Share2, color: 'bg-[#FB8500]' },
    { label: 'KPI Pengawas', icon: Award, color: 'bg-[#7C3AED]' },
]

export function PuspenWorkflowMap() {
    return (
        <section className={`bg-[#FFFFFF] p-5 sm:p-6 ${puspenBorder} shadow-[6px_6px_0_0_#111111]`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div className={`${puspenLabel} text-[#111111]/60`}>Workflow Map</div>
                    <h2 className="text-lg font-black uppercase tracking-[0.08em] sm:text-xl">Alur SOP Puspen</h2>
                </div>
                <span className={`bg-[#1A1A2E] px-3 py-1.5 text-[#FFB703] ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                    Route A → D
                </span>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    return (
                        <div key={step.label} className="flex flex-1 items-center gap-3">
                            <div className={`flex flex-1 items-center gap-3 ${step.color} p-3 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className={`bg-[#FFF7E8] p-2 ${puspenBorder} ${puspenShadowMd}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className={`${puspenLabel} text-[#111111]/55`}>Step {index + 1}</div>
                                    <div className="text-sm font-black uppercase tracking-[0.1em]">{step.label}</div>
                                </div>
                            </div>
                            {index < steps.length - 1 ? (
                                <ArrowRight className="hidden h-5 w-5 shrink-0 lg:block" />
                            ) : null}
                        </div>
                    )
                })}
            </div>

            <p className="mt-4 text-sm font-bold leading-6 text-[#111111]/70">
                Dokumen masuk lewat PDF → ditandatangani → progress dilaporkan → materi dibagikan → lihat statistik input data pengawas. Tiap langkah bisa dijalankan mandiri.
            </p>
        </section>
    )
}