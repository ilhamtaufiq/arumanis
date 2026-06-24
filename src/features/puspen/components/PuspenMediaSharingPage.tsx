import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    FileText,
    FolderPlus,
    FolderSearch,
    Image,
    Loader2,
    Search,
    Share2,
    Upload,
    Video,
} from 'lucide-react'
import { toast } from 'sonner'

import {
    createPuspenMediaShare,
    deletePuspenMediaShare,
    getPuspenMediaLibrary,
    getPuspenMediaShares,
    type PuspenMediaLibraryItem,
} from '../api/media-sharing'
import { formatFileSize, getFileTypeLabel, isPreviewableMime } from '../lib/media-sharing-format'
import { puspenBorder, puspenPressable, puspenShadowLg, puspenShadowMd } from '../lib/tokens'
import { PuspenToolLayout } from './PuspenToolLayout'
import { MediaSharingShareTable } from './media-sharing/MediaSharingShareTable'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { useAuthStore } from '@/stores/auth-stores'

type SourceMode = 'upload' | 'library'
type MimeGroup = 'all' | 'image' | 'video' | 'document'

const SHARES_PER_PAGE = 10

function getDefaultTitle(file?: File | null, libraryItem?: PuspenMediaLibraryItem | null) {
    const name = file?.name ?? libraryItem?.fileName ?? ''
    return name ? name.replace(/\.[^.]+$/, '') : ''
}

function getFileKey(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`
}

function getLibraryKey(item: PuspenMediaLibraryItem) {
    return item.id
}

function getUploadFolder(file: File) {
    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath
    if (!relativePath || !relativePath.includes('/')) return ''

    return relativePath.split('/').slice(0, -1).join('/')
}

function LocalMediaPreview({ file }: { file: File }) {
    const [url, setUrl] = useState('')

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file)
        setUrl(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    if (!url || !isPreviewableMime(file.type)) {
        return (
            <div className="flex aspect-video items-center justify-center bg-[#FFF7E8]">
                <FileText className="h-7 w-7" />
            </div>
        )
    }

    if (file.type.startsWith('video/')) {
        return <video src={url} className="aspect-video w-full bg-[#111111] object-cover" muted controls />
    }

    if (file.type.includes('pdf')) {
        return <iframe src={url} title={file.name} className="aspect-video w-full bg-[#FFF7E8]" />
    }

    return <img src={url} alt={file.name} className="aspect-video w-full bg-[#FFF7E8] object-cover" />
}

export function PuspenMediaSharingPage() {
    const { auth } = useAuthStore()
    const tool = PUSPEN_TOOLS.mediaSharing
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const folderInputRef = useRef<HTMLInputElement | null>(null)
    const [sourceMode, setSourceMode] = useState<SourceMode>('upload')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [selectedLibraryItems, setSelectedLibraryItems] = useState<PuspenMediaLibraryItem[]>([])
    const [fileFolders, setFileFolders] = useState<Record<string, string>>({})
    const [libraryFolders, setLibraryFolders] = useState<Record<string, string>>({})
    const [bulkFolderName, setBulkFolderName] = useState('')
    const [shareSearch, setShareSearch] = useState('')
    const [sharePage, setSharePage] = useState(1)
    const [librarySearch, setLibrarySearch] = useState('')
    const [mimeGroup, setMimeGroup] = useState<MimeGroup>('all')
    const [isDropActive, setIsDropActive] = useState(false)

    const sharesQuery = useQuery({
        queryKey: ['puspen-media-shares', shareSearch, sharePage],
        queryFn: () => getPuspenMediaShares({
            search: shareSearch.trim() || undefined,
            page: sharePage,
            per_page: SHARES_PER_PAGE,
        }),
    })

    const libraryQuery = useQuery({
        queryKey: ['puspen-media-library', librarySearch, mimeGroup],
        queryFn: () => getPuspenMediaLibrary({
            search: librarySearch.trim() || undefined,
            mime_group: mimeGroup,
            limit: 60,
        }),
        enabled: sourceMode === 'library',
    })

    const createMutation = useMutation({
        mutationFn: createPuspenMediaShare,
        onSuccess: async (share) => {
            await queryClient.invalidateQueries({ queryKey: ['puspen-media-shares'] })
            setSelectedFiles([])
            setSelectedLibraryItems([])
            setFileFolders({})
            setLibraryFolders({})
            setBulkFolderName('')
            setTitle('')
            setDescription('')
            toast.success('Link media sharing dibuat')
            await navigator.clipboard?.writeText(share.publicUrl)
        },
        onError: (error) => {
            console.error('Failed to create puspen media share:', error)
            toast.error('Gagal membuat media sharing')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deletePuspenMediaShare,
        onSuccess: async () => {
            if (shares.length === 1 && sharePage > 1) {
                setSharePage((current) => Math.max(1, current - 1))
            }
            await queryClient.invalidateQueries({ queryKey: ['puspen-media-shares'] })
            toast.success('Media sharing dihapus')
        },
        onError: (error) => {
            console.error('Failed to delete puspen media share:', error)
            toast.error('Gagal menghapus media sharing')
        },
    })

    const selectedCount = sourceMode === 'upload' ? selectedFiles.length : selectedLibraryItems.length
    const selectedSourceName = useMemo(() => {
        const names = sourceMode === 'upload'
            ? selectedFiles.map((file) => file.name)
            : selectedLibraryItems.map((item) => item.fileName)

        if (names.length === 0) return ''
        if (names.length === 1) return names[0]

        return `${names.length} media dipilih`
    }, [selectedFiles, selectedLibraryItems, sourceMode])
    const canSubmit = Boolean(title.trim() && selectedCount > 0)

    const shares = sharesQuery.data?.data ?? []
    const sharesMeta = sharesQuery.data?.meta
    const shareTotalPages = sharesMeta?.last_page ?? 1
    const shareTotalCount = sharesMeta?.total ?? shares.length
    const libraryItems = libraryQuery.data ?? []

    const sourceMeta = useMemo(() => {
        if (selectedFiles.length > 0) {
            const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0)

            return {
                type: `${selectedFiles.length} MEDIA`,
                size: formatFileSize(totalSize),
                source: 'Upload perangkat',
            }
        }

        if (selectedLibraryItems.length > 0) {
            const totalSize = selectedLibraryItems.reduce((total, item) => total + item.size, 0)

            return {
                type: `${selectedLibraryItems.length} MEDIA`,
                size: formatFileSize(totalSize),
                source: 'Media library',
            }
        }

        return null
    }, [selectedFiles, selectedLibraryItems])

    const handleFiles = (files: File[]) => {
        if (files.length === 0) return
        setSourceMode('upload')
        setSelectedFiles(files)
        setSelectedLibraryItems([])
        setLibraryFolders({})
        setFileFolders(Object.fromEntries(files.map((file) => [getFileKey(file), getUploadFolder(file)])))
        setTitle((current) => current || (files.length === 1 ? getDefaultTitle(files[0], null) : 'Media Puspen'))
    }

    const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? [])
        event.target.value = ''
        handleFiles(files)
    }

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDropActive(false)

        handleFiles(Array.from(event.dataTransfer.files ?? []))
    }

    const selectLibraryItem = (item: PuspenMediaLibraryItem) => {
        setSourceMode('library')
        setSelectedLibraryItems((current) => {
            const exists = current.some((selected) => selected.id === item.id)
            const next = exists ? current.filter((selected) => selected.id !== item.id) : [...current, item]
            setTitle((titleValue) => titleValue || (next.length === 1 ? getDefaultTitle(null, next[0]) : 'Media Puspen'))
            setLibraryFolders((folders) => {
                if (!exists) return folders
                const nextFolders = { ...folders }
                delete nextFolders[getLibraryKey(item)]
                return nextFolders
            })
            return next
        })
        setSelectedFiles([])
        setFileFolders({})
    }

    const applyFolderToSelection = (folderName: string) => {
        const nextFolder = folderName.trim()

        if (sourceMode === 'upload') {
            setFileFolders(Object.fromEntries(selectedFiles.map((file) => [getFileKey(file), nextFolder])))
            return
        }

        setLibraryFolders(Object.fromEntries(selectedLibraryItems.map((item) => [getLibraryKey(item), nextFolder])))
    }

    const submitShare = () => {
        if (!canSubmit) {
            toast.error('Isi judul dan pilih file dulu')
            return
        }

        createMutation.mutate({
            title: title.trim(),
            description: description.trim() || undefined,
            files: selectedFiles,
            fileFolders: selectedFiles.map((file) => fileFolders[getFileKey(file)] ?? ''),
            mediaIds: selectedLibraryItems.map((item) => item.id),
            mediaFolders: selectedLibraryItems.map((item) => libraryFolders[getLibraryKey(item)] ?? ''),
            isPublic: true,
        })
    }

    const copyText = async (text: string, message: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(message)
        } catch (error) {
            console.error('Failed to copy text:', error)
            toast.error('Gagal menyalin')
        }
    }

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            playerName={auth.user?.name}
            eyebrow={(
                <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Mode
                </span>
            )}
            title={tool.title}
            description="Kelola media yang boleh dibagikan publik. Upload beberapa media, pilih folder, atau pilih beberapa item dari Spatie Media Library, lalu bagikan URL publik buat download."
            aside={(
                <>
                    <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            Link Aktif
                        </div>
                        <div className="mt-2 text-4xl font-black uppercase tracking-[0.04em]">
                            {shareTotalCount}
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Setiap item punya URL publik sendiri. Orang yang dapat link bisa membuka halaman publik dan download file tanpa login.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            'Drop beberapa media baru untuk membuat satu link sharing',
                            'Pilih folder dari perangkat jika media sudah dikelompokkan',
                            'Pilih satu atau beberapa file lama dari Spatie Media Library',
                            'URL publik otomatis disalin setelah link dibuat',
                            'Media yang dipilih dari library disalin agar link publik stabil',
                        ].map((item, index) => (
                            <div
                                key={item}
                                className={`bg-[#FFF7E8] p-3 ${puspenBorder} ${puspenShadowMd}`}
                            >
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    Rule {index + 1}
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
            <div className="mt-8 space-y-5">
                <section className={`space-y-4 bg-[#FFFFFF] p-4 ${puspenBorder} ${puspenShadowLg}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className={`inline-flex items-center gap-2 bg-[#FFB703] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] ${puspenBorder} ${puspenShadowMd}`}>
                            <Upload className="h-4 w-4" />
                            Buat Link
                        </div>
                        <div className="flex gap-2">
                            {(['upload', 'library'] as SourceMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setSourceMode(mode)}
                                    className={`px-3 py-2 text-xs font-black uppercase tracking-[0.16em] ${puspenBorder} ${puspenShadowMd} ${
                                        sourceMode === mode ? 'bg-[#8ECAE6]' : 'bg-[#FFFFFF]'
                                    }`}
                                >
                                    {mode === 'upload' ? 'Dropzone' : 'Library'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-black uppercase tracking-[0.18em]">Judul</span>
                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Nama file publik"
                                className="mt-2 block w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-black uppercase tracking-[0.18em]">Sumber</span>
                            <input
                                type="text"
                                value={selectedSourceName}
                                readOnly
                                placeholder="Belum ada file"
                                className="mt-2 block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold outline-none"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-sm font-black uppercase tracking-[0.18em]">Deskripsi Publik</span>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            placeholder="Catatan singkat yang tampil di halaman publik..."
                            className="mt-2 block w-full resize-y border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 text-sm font-bold leading-6 outline-none focus:bg-[#8ECAE6]"
                        />
                    </label>

                    {sourceMode === 'upload' ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragEnter={() => setIsDropActive(true)}
                            onDragLeave={() => setIsDropActive(false)}
                            onDragOver={(event) => {
                                event.preventDefault()
                                setIsDropActive(true)
                            }}
                            onDrop={handleDrop}
                            role="button"
                            tabIndex={0}
                            className={`cursor-pointer border-[3px] border-dashed border-[#111111] p-5 shadow-[3px_3px_0_0_#111111] transition ${
                                isDropActive ? 'bg-[#8ECAE6]' : 'bg-[#FFF7E8]'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                            <input
                                ref={folderInputRef}
                                type="file"
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                                {...{ webkitdirectory: '' }}
                            />
                            <div className="flex items-center gap-3">
                                <div className={`bg-[#FFFFFF] p-3 ${puspenBorder} ${puspenShadowMd}`}>
                                    <Image className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-[0.2em]">
                                        Dropzone Upload
                                    </div>
                                    <p className="mt-1 text-sm font-bold leading-6 text-[#111111]/75">
                                        Tarik media ke sini atau klik buat pilih beberapa file dari perangkat.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        fileInputRef.current?.click()
                                    }}
                                    className={`bg-[#8ECAE6] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                                >
                                    Pilih Media
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        folderInputRef.current?.click()
                                    }}
                                    className={`bg-[#FFB703] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                                >
                                    Pilih Folder
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`space-y-3 bg-[#FFF7E8] p-3 ${puspenBorder} ${puspenShadowMd}`}>
                            <div className="flex flex-col gap-2 md:flex-row">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={librarySearch}
                                        onChange={(event) => setLibrarySearch(event.target.value)}
                                        placeholder="Cari file di media library..."
                                        className="block w-full border-[3px] border-[#111111] bg-[#FFFFFF] py-3 pl-10 pr-4 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                                    />
                                </div>
                                <select
                                    value={mimeGroup}
                                    onChange={(event) => setMimeGroup(event.target.value as MimeGroup)}
                                    className="border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-black outline-none"
                                >
                                    <option value="all">Semua</option>
                                    <option value="image">Gambar</option>
                                    <option value="video">Video</option>
                                    <option value="document">Dokumen</option>
                                </select>
                            </div>

                            {libraryQuery.isLoading ? (
                                <div className={`flex items-center justify-center border-dashed bg-[#FFFFFF] py-12 ${puspenBorder}`}>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : libraryItems.length === 0 ? (
                                <div className={`bg-[#FFFFFF] p-4 text-sm font-bold text-[#111111]/70 ${puspenBorder}`}>
                                    Tidak ada file media library yang cocok.
                                </div>
                            ) : (
                                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                    {libraryItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => selectLibraryItem(item)}
                                            className={`block w-full p-3 text-left ${puspenBorder} ${puspenShadowMd} ${
                                                selectedLibraryItems.some((selected) => selected.id === item.id)
                                                    ? 'bg-[#FFB703]'
                                                    : 'bg-[#FFFFFF]'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-black">{item.fileName}</div>
                                                    <div className="mt-1 text-xs font-bold text-[#111111]/65">
                                                        {item.collectionName} / {item.modelType}
                                                    </div>
                                                </div>
                                                <div className={`bg-[#8ECAE6] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${puspenBorder}`}>
                                                    {getFileTypeLabel(item.mimeType)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedCount > 0 ? (
                        <div className={`space-y-3 bg-[#FFFFFF] p-3 ${puspenBorder} ${puspenShadowMd}`}>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                        Media Dipilih
                                    </div>
                                    <div className="mt-1 text-sm font-bold text-[#111111]/70">
                                        Isi folder bisa sama untuk semua media atau berbeda per item.
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        type="text"
                                        value={bulkFolderName}
                                        onChange={(event) => setBulkFolderName(event.target.value)}
                                        placeholder="Nama folder"
                                        className="border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => applyFolderToSelection(bulkFolderName)}
                                        className={`inline-flex items-center justify-center gap-2 bg-[#2ECC71] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                                    >
                                        <FolderPlus className="h-4 w-4" />
                                        Terapkan
                                    </button>
                                </div>
                            </div>

                            <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                                {(sourceMode === 'upload' ? selectedFiles : selectedLibraryItems).map((item, index) => {
                                    const name = item instanceof File ? item.name : item.fileName
                                    const size = item instanceof File ? item.size : item.size
                                    const mimeType = item instanceof File ? item.type : item.mimeType
                                    const key = item instanceof File ? getFileKey(item) : getLibraryKey(item)
                                    const folderValue = item instanceof File ? fileFolders[key] ?? '' : libraryFolders[key] ?? ''
                                    const setFolder = (value: string) => {
                                        if (item instanceof File) {
                                            setFileFolders((folders) => ({ ...folders, [key]: value }))
                                            return
                                        }

                                        setLibraryFolders((folders) => ({ ...folders, [key]: value }))
                                    }

                                    return (
                                        <div key={`${name}-${index}`} className={`overflow-hidden bg-[#FFF7E8] ${puspenBorder} ${puspenShadowMd}`}>
                                            {item instanceof File ? (
                                                <LocalMediaPreview file={item} />
                                            ) : item.url && item.mimeType.startsWith('image/') ? (
                                                <img src={item.url} alt={item.fileName} className="aspect-video w-full bg-[#FFF7E8] object-cover" />
                                            ) : item.url && item.mimeType.startsWith('video/') ? (
                                                <video src={item.url} className="aspect-video w-full bg-[#111111] object-cover" muted controls />
                                            ) : item.url && item.mimeType.includes('pdf') ? (
                                                <iframe src={item.url} title={item.fileName} className="aspect-video w-full bg-[#FFF7E8]" />
                                            ) : (
                                                <div className="flex aspect-video items-center justify-center bg-[#FFFFFF]">
                                                    {mimeType.startsWith('video/') ? <Video className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                                                </div>
                                            )}
                                            <div className="space-y-2 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-black">{name}</div>
                                                        <div className="mt-1 text-xs font-bold text-[#111111]/60">
                                                            {getFileTypeLabel(mimeType)} / {formatFileSize(size)}
                                                        </div>
                                                    </div>
                                                    <span className={`shrink-0 bg-[#8ECAE6] px-2 py-1 text-[10px] font-black uppercase ${puspenBorder}`}>
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <label className="block">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#111111]/60">Folder</span>
                                                    <input
                                                        type="text"
                                                        value={folderValue}
                                                        onChange={(event) => setFolder(event.target.value)}
                                                        placeholder="Kosong = root"
                                                        className="mt-1 block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-xs font-bold outline-none focus:bg-[#8ECAE6]"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : null}

                    {sourceMeta ? (
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className={`bg-[#8ECAE6] p-3 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">Tipe</div>
                                <div className="mt-1 text-sm font-black">{sourceMeta.type}</div>
                            </div>
                            <div className={`bg-[#FFB703] p-3 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">Ukuran</div>
                                <div className="mt-1 text-sm font-black">{sourceMeta.size}</div>
                            </div>
                            <div className={`bg-[#2ECC71] p-3 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">Sumber</div>
                                <div className="mt-1 truncate text-sm font-black">{sourceMeta.source}</div>
                            </div>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={submitShare}
                        disabled={!canSubmit || createMutation.isPending}
                        className={`inline-flex w-full items-center justify-center gap-2 bg-[#FB8500] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] ${puspenBorder} ${puspenShadowLg} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                        Buat Link Publik
                    </button>
                </section>

                <section className={`space-y-4 bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowLg}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className={`inline-flex items-center gap-2 bg-[#8ECAE6] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] ${puspenBorder} ${puspenShadowMd}`}>
                            <FolderSearch className="h-4 w-4" />
                            File Shareable
                        </div>
                        <input
                            type="text"
                            value={shareSearch}
                            onChange={(event) => {
                                setShareSearch(event.target.value)
                                setSharePage(1)
                            }}
                            placeholder="Cari link..."
                            className="border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6] md:w-72"
                        />
                    </div>

                    <MediaSharingShareTable
                        shares={shares}
                        isLoading={sharesQuery.isLoading}
                        isDeleting={deleteMutation.isPending}
                        page={sharePage}
                        perPage={SHARES_PER_PAGE}
                        total={shareTotalCount}
                        totalPages={shareTotalPages}
                        onPageChange={setSharePage}
                        onCopyUrl={(url) => void copyText(url, 'URL publik disalin')}
                        onDelete={(id) => deleteMutation.mutate(id)}
                    />
                </section>
            </div>
        </PuspenToolLayout>
    )
}
