import { FileSignature } from 'lucide-react'

import { useAuthStore } from '@/stores/auth-stores'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { PuspenPdfSignTool } from './PuspenPdfSignTool'
import { PuspenToolLayout } from './PuspenToolLayout'

export default function PuspenPage() {
    const { auth } = useAuthStore()
    const tool = PUSPEN_TOOLS.signPdf

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            playerName={auth.user?.name}
            eyebrow={(
                <span className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4" />
                    Sign Mode
                </span>
            )}
            title={tool.title}
            description="Upload PDF, tempel tanda tangan digital per halaman, lalu simpan hasil ke server Puspen."
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
        </PuspenToolLayout>
    )
}