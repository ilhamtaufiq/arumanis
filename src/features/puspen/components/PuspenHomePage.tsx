import { Link } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { ArrowRight, FileSignature, FileUp, Wrench } from 'lucide-react'

import { PuspenMasterLayout } from './PuspenMasterLayout'

type ToolCard = {
    title: string
    description: string
    href: string
    accent: string
    icon: ComponentType<{ className?: string }>
    status: string
}

const tools: ToolCard[] = [
    {
        title: 'Kelola PDF',
        description: 'Simpan file PDF ke server, atur file yang sudah ada, lalu pakai lagi tanpa upload ulang.',
        href: '/puspen/organize-pdf',
        accent: 'bg-[#8ECAE6]',
        icon: FileUp,
        status: 'Siap',
    },
    {
        title: 'TTD PDF Digital',
        description: 'Upload PDF, upload gambar tanda tangan, lalu klik halaman buat naro tanda tangan digital.',
        href: '/puspen/sign-pdf',
        accent: 'bg-[#FFB703]',
        icon: FileSignature,
        status: 'Siap',
    },
]

function ToolCard({ tool }: { tool: ToolCard }) {
    const Icon = tool.icon

    const content = (
        <article className="overflow-hidden border-[3px] border-[#111111] bg-[#FFFFFF] shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
            <div className={`border-b-[3px] border-[#111111] px-4 py-3 ${tool.accent}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black uppercase tracking-[0.24em]">
                        {tool.status}
                    </div>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-2 shadow-[3px_3px_0_0_#111111]">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                        {tool.title}
                    </h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/75">
                        {tool.description}
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_0_#111111]">
                    Buka Alat
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </article>
    )

    if (tool.status === 'Siap') {
        return (
            <Link to={tool.href} className="block">
                {content}
            </Link>
        )
    }

    return content
}

export function PuspenHomePage() {
    return (
        <PuspenMasterLayout
            eyebrow={(
                <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Puspen Arumanis
                </span>
            )}
            title="PUSPEN ARUMANIS"
            description="Command center untuk workflow Arumanis. Berisi alat kerja buat mempermudah SOP pekerjaan, biar alurnya lebih cepet, rapi, dan gak ribet."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            Panel Info
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            Dua alat aktif
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Nanti kalau ada alat baru yang siap, tinggal masukin ke ruang ini.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            'Kelola PDF buat simpan file ke server dan pakai lagi kapan aja',
                            'TTD PDF Digital buat tanda tangan dokumen tanpa ribet',
                            'Hasilnya bisa diunduh atau langsung disimpan ke server',
                            'Puspen berdiri sendiri tanpa sidebar shell utama',
                        ].map((item, index) => (
                            <div
                                key={item}
                                className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[3px_3px_0_0_#111111]"
                            >
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    Catatan {index + 1}
                                </div>
                                <div className="mt-1 text-sm font-bold leading-6">
                                    {item}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
                {tools.map((tool) => (
                    <ToolCard key={tool.title} tool={tool} />
                ))}
            </div>
        </PuspenMasterLayout>
    )
}
