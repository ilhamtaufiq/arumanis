import { Clock, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserDriveItem } from '../../api/user-drive'
import { formatDriveDate } from '../../lib/drive-view'
import { DriveFileActions } from './DriveFileActions'

type DriveFolderGridProps = {
    folders: UserDriveItem[]
    isLoading: boolean
    onOpen: (folder: UserDriveItem) => void
    onRename: (item: UserDriveItem) => void
    onShare: (item: UserDriveItem) => void
    onDelete: (item: UserDriveItem) => void
}

/** Kartu folder gaya `folders-section` v2 di atas data user-drive real. */
export function DriveFolderGrid({ folders, isLoading, onOpen, onRename, onShare, onDelete }: DriveFolderGridProps) {
    return (
        <section className='flex flex-col gap-2' aria-labelledby='drive-folders-heading'>
            <div className='flex items-center justify-between'>
                <h2 id='drive-folders-heading' className='text-lg font-medium'>
                    Folder
                </h2>
                <span className='text-sm text-muted-foreground'>{folders.length} folder</span>
            </div>
            {isLoading ? (
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className='h-9 w-3/4' />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className='h-4 w-1/2' />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : folders.length > 0 ? (
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                    {folders.map((folder) => (
                        <Card key={folder.id}>
                            <CardHeader>
                                <button
                                    type='button'
                                    onClick={() => onOpen(folder)}
                                    className='flex min-w-0 flex-1 items-center gap-2 text-left'
                                >
                                    <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                                        <Folder className='size-4' />
                                    </div>
                                    <div className='flex min-w-0 flex-col gap-1'>
                                        <CardTitle className='truncate leading-none'>{folder.name}</CardTitle>
                                        <CardDescription className='text-xs'>
                                            {folder.owner?.name ?? 'Drive saya'}
                                        </CardDescription>
                                    </div>
                                </button>
                                <CardAction>
                                    <DriveFileActions item={folder} onRename={onRename} onShare={onShare} onDelete={onDelete} />
                                </CardAction>
                            </CardHeader>
                            <CardContent className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
                                <div className='flex items-center gap-1.5'>
                                    <Clock className='size-3.5' />
                                    <span>Diubah {formatDriveDate(folder.updated_at)}</span>
                                </div>
                                <Button variant='link' size='sm' className='h-auto p-0 text-xs' onClick={() => onOpen(folder)}>
                                    Buka
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Empty className='min-h-32'>
                    <EmptyHeader>
                        <EmptyMedia variant='icon'>
                            <Folder />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada folder</EmptyTitle>
                        <EmptyDescription>Buat folder untuk merapikan drive Anda.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </section>
    )
}
