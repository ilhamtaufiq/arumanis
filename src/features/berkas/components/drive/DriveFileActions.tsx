import { Download, MoreVertical, Pencil, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserDriveItem } from '../../api/user-drive'

type DriveFileActionsProps = {
    item: UserDriveItem
    onRename: (item: UserDriveItem) => void
    onShare: (item: UserDriveItem) => void
    onDelete: (item: UserDriveItem) => void
}

/** Aksi file gaya `file-actions` v2 di atas API user-drive real (tanpa star: tanpa backend). */
export function DriveFileActions({ item, onRename, onShare, onDelete }: DriveFileActionsProps) {
    const canDownload = item.kind === 'file' && !!item.file_url

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon-sm' aria-label={`Aksi untuk ${item.name}`}>
                    <MoreVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-48' align='end'>
                <DropdownMenuGroup>
                    {canDownload ? (
                        <DropdownMenuItem asChild>
                            <a href={item.file_url ?? ''} target='_blank' rel='noopener noreferrer'>
                                <Download />
                                Unduh
                            </a>
                        </DropdownMenuItem>
                    ) : null}
                    {item.can_manage !== false ? (
                        <>
                            <DropdownMenuItem onSelect={() => onRename(item)}>
                                <Pencil />
                                Ganti nama
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onShare(item)}>
                                <Share2 />
                                Bagikan
                            </DropdownMenuItem>
                        </>
                    ) : null}
                </DropdownMenuGroup>
                {item.can_manage !== false ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem variant='destructive' onSelect={() => onDelete(item)}>
                                <Trash2 />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
