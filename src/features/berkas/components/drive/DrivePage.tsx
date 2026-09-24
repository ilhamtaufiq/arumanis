import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, FolderPlus, House, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { useDebounce } from '@/hooks/use-debounce'
import type { UserDriveItem } from '../../api/user-drive'
import {
    useCreateUserDriveFolder,
    useDeleteUserDriveItem,
    useRenameUserDriveItem,
    useShareUserDriveItem,
    useUploadUserDriveFile,
    useUserDriveList,
} from '../../hooks/useUserDrive'
import { sortDriveItems, splitDriveItems, type DriveSort } from '../../lib/drive-view'
import RenameDialog from '../RenameDialog'
import ShareDialog from '../ShareDialog'
import { DriveFileTable, DriveFileGrid } from './DriveFiles'
import { DriveFolderGrid } from './DriveFolderGrid'
import { DriveMediaSection } from './DriveMediaSection'
import { DriveToolbar, type DriveViewMode } from './DriveToolbar'

type Crumb = { id: number | null; name: string }

type DrivePageProps = {
    initialView?: DriveViewMode
    onViewChange?: (view: DriveViewMode) => void
}

/**
 * Halaman Drive pribadi — layout file-manager dashboard-v2
 * (toolbar + folder + grid/list) di atas API user-drive real.
 */
export function DrivePage({ initialView = 'grid', onViewChange }: DrivePageProps) {
    const [view, setView] = useState<DriveViewMode>(initialView)

    useEffect(() => {
        setView(initialView)
    }, [initialView])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<DriveSort>('updated')
    const [crumbs, setCrumbs] = useState<Crumb[]>([{ id: null, name: 'Drive saya' }])
    const [renameItem, setRenameItem] = useState<UserDriveItem | null>(null)
    const [shareItem, setShareItem] = useState<UserDriveItem | null>(null)
    const [newFolderOpen, setNewFolderOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const debouncedSearch = useDebounce(search, 400)
    const currentFolderId = crumbs[crumbs.length - 1]?.id ?? null

    const listQuery = useUserDriveList({
        parent_id: currentFolderId,
        search: debouncedSearch.trim() || undefined,
        per_page: 100,
    })
    const createFolder = useCreateUserDriveFolder()
    const uploadFile = useUploadUserDriveFile()
    const renameItem2 = useRenameUserDriveItem()
    const shareMutation = useShareUserDriveItem()
    const deleteMutation = useDeleteUserDriveItem()

    const { folders, files } = useMemo(() => {
        const split = splitDriveItems(listQuery.data?.data ?? [])
        return {
            folders: sortDriveItems(split.folders, sort),
            files: sortDriveItems(split.files, sort),
        }
    }, [listQuery.data, sort])

    const handleViewChange = (next: DriveViewMode) => {
        setView(next)
        onViewChange?.(next)
    }

    const openFolder = (folder: UserDriveItem) => {
        setCrumbs((prev) => [...prev, { id: folder.id, name: folder.name }])
    }

    const goToCrumb = (index: number) => {
        setCrumbs((prev) => prev.slice(0, index + 1))
    }

    const handleUploadFiles = (fileList: FileList | null) => {
        if (!fileList?.length) return
        Array.from(fileList).forEach((file) => {
            uploadFile.mutate({ file, parent_id: currentFolderId })
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleDelete = (item: UserDriveItem) => {
        if (!confirm(`Hapus "${item.name}" dari drive?`)) return
        deleteMutation.mutate(item.id)
    }

    const handleShare = (userIds: number[]) => {
        if (!shareItem) return
        const jobs = userIds.length
            ? userIds.map((userId) => shareMutation.mutateAsync({ id: shareItem.id, userId }))
            : [shareMutation.mutateAsync({ id: shareItem.id, userId: null })]
        Promise.all(jobs)
            .then(() => setShareItem(null))
            .catch(() => toast.error('Gagal membagikan ke sebagian user'))
    }

    return (
        <>
            <BannerNotification />
            <Header fixed />

            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-4'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                        <div className='flex min-w-0 flex-col gap-1'>
                            <h1 className='text-3xl leading-none font-semibold tracking-tight'>Drive saya</h1>
                            <p className='text-sm text-muted-foreground'>Kelola, bagikan, dan temukan file kerja Anda.</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button variant='outline' onClick={() => setNewFolderOpen(true)}>
                                <FolderPlus />
                                Folder baru
                            </Button>
                            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
                                <Upload />
                                {uploadFile.isPending ? 'Mengunggah...' : 'Unggah'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type='file'
                                multiple
                                className='hidden'
                                onChange={(e) => handleUploadFiles(e.target.files)}
                            />
                        </div>
                    </div>

                    <nav aria-label='Lokasi folder' className='flex flex-wrap items-center gap-1 text-sm'>
                        {crumbs.map((crumb, index) => (
                            <span key={`${crumb.id ?? 'root'}-${index}`} className='flex items-center gap-1'>
                                {index > 0 ? <ChevronRight className='size-3.5 text-muted-foreground' /> : null}
                                <button
                                    type='button'
                                    onClick={() => goToCrumb(index)}
                                    className='flex items-center gap-1 rounded px-1 py-0.5 text-muted-foreground hover:text-foreground'
                                >
                                    {index === 0 ? <House className='size-3.5' /> : null}
                                    {crumb.name}
                                </button>
                            </span>
                        ))}
                    </nav>

                    <DriveToolbar
                        search={search}
                        onSearchChange={setSearch}
                        sort={sort}
                        onSortChange={setSort}
                        view={view}
                        onViewChange={handleViewChange}
                    />

                    <DriveFolderGrid
                        folders={folders}
                        isLoading={listQuery.isLoading}
                        onOpen={openFolder}
                        onRename={setRenameItem}
                        onShare={setShareItem}
                        onDelete={handleDelete}
                    />

                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between gap-4'>
                            <h2 className='text-lg font-medium'>Semua file</h2>
                            <span className='text-sm text-muted-foreground'>{files.length} file</span>
                        </div>
                        {view === 'list' ? (
                            <DriveFileTable
                                files={files}
                                isLoading={listQuery.isLoading}
                                onRename={setRenameItem}
                                onShare={setShareItem}
                                onDelete={handleDelete}
                            />
                        ) : (
                            <DriveFileGrid
                                files={files}
                                isLoading={listQuery.isLoading}
                                onRename={setRenameItem}
                                onShare={setShareItem}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>

                    <DriveMediaSection />
                </div>
            </Main>

            <RenameDialog
                open={newFolderOpen}
                onOpenChange={setNewFolderOpen}
                initialName=''
                onSubmit={(name) => {
                    createFolder.mutate(
                        { name, parent_id: currentFolderId },
                        { onSuccess: () => setNewFolderOpen(false) },
                    )
                }}
                isPending={createFolder.isPending}
            />

            <RenameDialog
                open={renameItem !== null}
                onOpenChange={(open) => !open && setRenameItem(null)}
                initialName={renameItem?.name ?? ''}
                onSubmit={(name) => {
                    if (!renameItem) return
                    renameItem2.mutate(
                        { id: renameItem.id, name },
                        { onSuccess: () => setRenameItem(null) },
                    )
                }}
                isPending={renameItem2.isPending}
            />

            {shareItem ? (
                <ShareDialog
                    open
                    onOpenChange={(open) => !open && setShareItem(null)}
                    itemName={shareItem.name}
                    isOwner={shareItem.is_owner ?? true}
                    onShare={handleShare}
                    isPending={shareMutation.isPending}
                />
            ) : null}
        </>
    )
}
