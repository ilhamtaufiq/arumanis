import { Link } from '@tanstack/react-router'
import {
    ClipboardCheck,
    ClipboardList,
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Kontrak, KontrakBapExportParams } from '../types'

export type KontrakActionsProps = {
    item: Kontrak
    isAdmin: boolean
    onDeleteRequest: (id: number) => void
    handleExportDoc: (kontrak: Kontrak) => void
    handleExportRingkasan: (kontrak: Kontrak) => void
    handleExportCover: (kontrak: Kontrak) => void
    handleExportBAP: (kontrak: Kontrak) => void | Promise<void>
    handlePreview: (
        kontrak: Kontrak,
        type: 'spk' | 'ringkasan' | 'bap',
        bapPayload?: KontrakBapExportParams,
    ) => void
}

/**
 * Menu aksi per kontrak — dipakai bersama oleh baris tabel desktop
 * dan kartu mobile supaya isi menunya tidak duplikat.
 */
export function KontrakActionsMenu({
    item,
    isAdmin,
    onDeleteRequest,
    handleExportDoc,
    handleExportRingkasan,
    handleExportCover,
    handleExportBAP,
    handlePreview,
}: KontrakActionsProps) {
    const menuLabel = item.spk || item.pekerjaans?.[0]?.nama_paket || `Kontrak #${item.id}`

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={`Menu aksi kontrak ${menuLabel}`}
                >
                    <span className="sr-only">Menu aksi kontrak {menuLabel}</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    Umum
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link to="/kontrak/$id" params={{ id: item.id.toString() }}>
                        <Eye className="mr-2 h-4 w-4 text-primary" />
                        <span>Detail Kontrak</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    SPK
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handlePreview(item, 'spk')}>
                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Pratinjau SPK</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportDoc(item)}>
                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Ekspor SPK (Word)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    Ringkasan
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handlePreview(item, 'ringkasan')}>
                    <Eye className="mr-2 h-4 w-4 text-green-600" />
                    <span>Pratinjau Ringkasan</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportRingkasan(item)}>
                    <ClipboardList className="mr-2 h-4 w-4 text-green-600" />
                    <span>Ekspor Ringkasan</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCover(item)}>
                    <FileText className="mr-2 h-4 w-4 text-purple-600" />
                    <span>Download Cover Kontrak</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    BAP & Lainnya
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExportBAP(item)}>
                    <ClipboardCheck className="mr-2 h-4 w-4 text-orange-600" />
                    <span>Buat BAP</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/kontrak/$id/edit" params={{ id: item.id.toString() }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Ubah Data</span>
                    </Link>
                </DropdownMenuItem>

                {isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => onDeleteRequest(item.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus Kontrak</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
