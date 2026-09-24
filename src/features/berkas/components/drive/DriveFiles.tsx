import {
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    File as FileIcon,
    FileQuestion,
    Presentation,
    type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Inbox } from 'lucide-react'
import type { UserDriveItem } from '../../api/user-drive'
import { fileKindFromMime, formatBytes, formatDriveDate, type DriveFileKind } from '../../lib/drive-view'
import { DriveFileActions } from './DriveFileActions'

const KIND_ICONS: Record<DriveFileKind, LucideIcon> = {
    document: FileText,
    spreadsheet: FileSpreadsheet,
    presentation: Presentation,
    pdf: FileIcon,
    image: FileImage,
    archive: FileArchive,
    other: FileQuestion,
}

const KIND_LABELS: Record<DriveFileKind, string> = {
    document: 'Dokumen',
    spreadsheet: 'Spreadsheet',
    presentation: 'Presentasi',
    pdf: 'PDF',
    image: 'Gambar',
    archive: 'Arsip',
    other: 'Lainnya',
}

type DriveFilesProps = {
    files: UserDriveItem[]
    isLoading: boolean
    onRename: (item: UserDriveItem) => void
    onShare: (item: UserDriveItem) => void
    onDelete: (item: UserDriveItem) => void
}

/** Grid file gaya `file-grid-view` v2 (tanpa star: tanpa backend favorit). */
export function DriveFileGrid({ files, isLoading, onRename, onShare, onDelete }: DriveFilesProps) {
    if (isLoading) {
        return (
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent>
                            <Skeleton className='h-36 w-full rounded-lg' />
                        </CardContent>
                        <CardHeader>
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-3 w-1/2' />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        )
    }

    if (files.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <Inbox />
                    </EmptyMedia>
                    <EmptyTitle>Belum ada file</EmptyTitle>
                    <EmptyDescription>Unggah file pertama Anda lewat tombol Unggah.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {files.map((file) => {
                const kind = fileKindFromMime(file.mime_type, file.original_filename ?? file.name)
                const KindIcon = KIND_ICONS[kind]
                return (
                    <Card key={file.id} className='group/file'>
                        <CardContent>
                            <div className='relative flex h-36 items-center justify-center rounded-lg bg-muted/50'>
                                <KindIcon className='size-12 text-muted-foreground' aria-hidden='true' />
                                <div className='absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 text-xs text-muted-foreground'>
                                    <span>{KIND_LABELS[kind]}</span>
                                    <span>{formatBytes(file.file_size)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardHeader>
                            <CardTitle className='truncate' title={file.name}>
                                {file.name}
                            </CardTitle>
                            <CardDescription className='truncate'>
                                {formatDriveDate(file.updated_at)} oleh {file.owner?.name ?? 'saya'}
                            </CardDescription>
                            <CardAction>
                                <DriveFileActions item={file} onRename={onRename} onShare={onShare} onDelete={onDelete} />
                            </CardAction>
                        </CardHeader>
                    </Card>
                )
            })}
        </div>
    )
}

/** Tampilan list tabel untuk file drive. */
export function DriveFileTable({ files, isLoading, onRename, onShare, onDelete }: DriveFilesProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className='flex flex-col gap-2 pt-6'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className='h-10 w-full' />
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (files.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <Inbox />
                    </EmptyMedia>
                    <EmptyTitle>Belum ada file</EmptyTitle>
                    <EmptyDescription>Unggah file pertama Anda lewat tombol Unggah.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className='overflow-x-auto rounded-xl border bg-card'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className='text-right'>Ukuran</TableHead>
                        <TableHead>Diubah</TableHead>
                        <TableHead className='text-right'>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.map((file) => {
                        const kind = fileKindFromMime(file.mime_type, file.original_filename ?? file.name)
                        const KindIcon = KIND_ICONS[kind]
                        return (
                            <TableRow key={file.id}>
                                <TableCell className='max-w-72'>
                                    <span className='flex items-center gap-2'>
                                        <KindIcon className='size-4 shrink-0 text-muted-foreground' />
                                        <span className='truncate font-medium' title={file.name}>
                                            {file.name}
                                        </span>
                                    </span>
                                    <span className='mt-0.5 block truncate pl-6 text-xs text-muted-foreground'>
                                        {file.owner?.name ?? 'saya'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant='secondary' className='text-[11px]'>
                                        {KIND_LABELS[kind]}
                                    </Badge>
                                </TableCell>
                                <TableCell className='text-right text-sm whitespace-nowrap tabular-nums'>
                                    {formatBytes(file.file_size)}
                                </TableCell>
                                <TableCell className='text-sm whitespace-nowrap text-muted-foreground'>
                                    {formatDriveDate(file.updated_at)}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <DriveFileActions item={file} onRename={onRename} onShare={onShare} onDelete={onDelete} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
