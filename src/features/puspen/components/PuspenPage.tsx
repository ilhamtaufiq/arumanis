import { PenTool } from 'lucide-react'

import { PuspenPdfSignTool } from './PuspenPdfSignTool'
import { PuspenMasterLayout } from './PuspenMasterLayout'

export default function PuspenPage() {
    return (
        <PuspenMasterLayout
            eyebrow={(
                <span className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Ruang Kerja
                </span>
            )}
            title="PUSPEN ARUMANIS"
            description="Ruang kerja mandiri buat ngerjain PDF digital. Sign file, simpan ulang, dan kelola alurnya buat bantu SOP pekerjaan di Arumanis."
        >
            <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[6px_6px_0_0_#111111]">
                <div
                    className="border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[3px_3px_0_0_#111111]"
                    style={{
                        backgroundImage: `
                            linear-gradient(90deg, rgba(17,17,17,0.08) 1px, transparent 1px),
                            linear-gradient(rgba(17,17,17,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '18px 18px',
                    }}
                >
                    <PuspenPdfSignTool />
                </div>
            </div>
        </PuspenMasterLayout>
    )
}
