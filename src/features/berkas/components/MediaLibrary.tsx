import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useFotoList, useDeleteFoto } from '@/features/foto/hooks/useFoto';
import { useBerkasList, useDeleteBerkas } from '../hooks/useBerkas';
import { usePekerjaanList, usePekerjaanDetail } from '@/features/pekerjaan/hooks/usePekerjaan';
import {
    useCreateUserDriveFolder,
    useDeleteUserDriveItem,
    useUploadUserDriveFile,
    useUserDriveFolderDetail,
    useUserDriveList,
} from '../hooks/useUserDrive';
import { getPuspenMediaLibrary } from '@/features/puspen/api/media-sharing';
import MediaCard, { type MediaItem } from './MediaCard';
import PekerjaanFolderCard from './PekerjaanFolderCard';
import DriveZoneCard from './DriveZoneCard';
import DriveFolderCard from './DriveFolderCard';
import {
    buildMediaItems,
    buildPekerjaanFoldersFromList,
    filterToMimeGroup,
    formatFolderLocation,
    isImageMediaItem,
    pekerjaanListSortParams,
    puspenToMediaItem,
    sortDriveItems,
    userDriveFileToMediaItem,
    type DriveSortDirection,
    type DriveSortField,
    type DriveZone,
} from '../lib/media-library-utils';
import { ListPagination } from '@/components/shared/ListPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    RefreshCw,
    Grid3X3,
    List,
    FileText,
    ChevronRight,
    Home,
    FolderOpen,
    Plus,
    Trash2,
    LayoutGrid,
    Share2,
    Briefcase,
    User,
    FolderPlus,
    Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useAuthStore } from '@/stores/auth-stores';
import { cn } from '@/lib/utils';
import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal';
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal';
import { getFileExtension } from '@/lib/file-preview';

type FilterType = 'all' | 'images' | 'docs';
type ViewType = 'grid' | 'list';

type BerkasSearch = {
    type?: FilterType;
    zone?: DriveZone;
    pekerjaan?: number;
    folder?: number;
};

const ROOT_PER_PAGE = 24;
const FOLDER_FOTO_PER_PAGE = 48;
const USER_DRIVE_PER_PAGE = 48;
const PUSPEN_LIMIT = 60;

const ZONE_META: Record<DriveZone, { title: string; description: string }> = {
    puspen: {
        title: 'Puspen',
        description: 'Perpustakaan media dan berkas dari modul Puspen',
    },
    pekerjaan: {
        title: 'Pekerjaan',
        description: 'Foto dan berkas per paket pekerjaan',
    },
    users: {
        title: 'Users',
        description: 'Folder pribadi tanpa keterkaitan pekerjaan',
    },
};

function buildSearch(current: BerkasSearch, patch: Partial<BerkasSearch>): BerkasSearch {
    const next: BerkasSearch = { ...current, ...patch };
    if (patch.zone === undefined && 'zone' in patch) delete next.zone;
    if (patch.pekerjaan === undefined && 'pekerjaan' in patch) delete next.pekerjaan;
    if (patch.folder === undefined && 'folder' in patch) delete next.folder;
    if (patch.type === undefined && 'type' in patch) delete next.type;
    return next;
}

export default function MediaLibrary() {
    const { tahunAnggaran } = useAppSettingsValues();
    const { auth } = useAuthStore();
    const searchParams = useSearch({ from: '/_authenticated/berkas/' });
    const navigate = useNavigate();

    const activeZone = searchParams.zone;
    const activePekerjaanId = searchParams.pekerjaan;
    const activeUserFolderId = searchParams.folder;

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>(searchParams.type || 'all');
    const [sortField, setSortField] = useState<DriveSortField>('date');
    const [sortDirection, setSortDirection] = useState<DriveSortDirection>('desc');
    const [view, setView] = useState<ViewType>('grid');
    const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
    const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
    const [rootPage, setRootPage] = useState(1);
    const [folderPage, setFolderPage] = useState(1);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const deleteBerkasMutation = useDeleteBerkas();
    const deleteFotoMutation = useDeleteFoto();
    const createFolderMutation = useCreateUserDriveFolder();
    const uploadFileMutation = useUploadUserDriveFile();
    const deleteUserDriveMutation = useDeleteUserDriveItem();

    const isDriveHome = !activeZone;
    const isPuspenZone = activeZone === 'puspen';
    const isPekerjaanZone = activeZone === 'pekerjaan';
    const isUsersZone = activeZone === 'users';
    const isPekerjaanRoot = isPekerjaanZone && !activePekerjaanId;
    const isPekerjaanFolder = isPekerjaanZone && !!activePekerjaanId;
    const isUsersRoot = isUsersZone && !activeUserFolderId;

    const {
        data: pekerjaanData,
        isLoading: pekerjaanLoading,
        refetch: refetchPekerjaan,
    } = usePekerjaanList(
        {
            page: rootPage,
            per_page: ROOT_PER_PAGE,
            search: debouncedSearch || undefined,
            tahun: tahunAnggaran,
            ...pekerjaanListSortParams(sortField, sortDirection),
        },
        isPekerjaanRoot && !!tahunAnggaran,
    );

    const {
        data: activePekerjaanDetail,
        isLoading: pekerjaanDetailLoading,
        refetch: refetchPekerjaanDetail,
    } = usePekerjaanDetail(activePekerjaanId ?? 0, isPekerjaanFolder);

    const loadFoto = isPekerjaanFolder && filter !== 'docs';
    const loadBerkas = isPekerjaanFolder && filter !== 'images';

    const {
        data: berkasData,
        isLoading: berkasLoading,
        isError: berkasError,
        refetch: refetchBerkas,
    } = useBerkasList(
        {
            page: folderPage,
            search: debouncedSearch || undefined,
            pekerjaan_id: activePekerjaanId,
            tahun: tahunAnggaran,
        },
        loadBerkas,
    );

    const {
        data: fotoData,
        isLoading: fotoLoading,
        isError: fotoError,
        refetch: refetchFoto,
    } = useFotoList(
        {
            page: folderPage,
            per_page: FOLDER_FOTO_PER_PAGE,
            search: debouncedSearch || undefined,
            pekerjaan_id: activePekerjaanId,
            tahun: tahunAnggaran,
        },
        loadFoto,
    );

    const {
        data: puspenData,
        isLoading: puspenLoading,
        isError: puspenError,
        refetch: refetchPuspen,
    } = useQuery({
        queryKey: ['drive-puspen-library', debouncedSearch, filter],
        queryFn: () => getPuspenMediaLibrary({
            search: debouncedSearch || undefined,
            mime_group: filterToMimeGroup(filter),
            limit: PUSPEN_LIMIT,
        }),
        enabled: isPuspenZone,
    });

    const {
        data: userDriveData,
        isLoading: userDriveLoading,
        isError: userDriveError,
        refetch: refetchUserDrive,
    } = useUserDriveList(
        {
            parent_id: activeUserFolderId ?? null,
            search: debouncedSearch || undefined,
            page: folderPage,
            per_page: USER_DRIVE_PER_PAGE,
        },
        isUsersZone,
    );

    const {
        data: activeUserFolder,
        isLoading: userFolderDetailLoading,
    } = useUserDriveFolderDetail(activeUserFolderId ?? 0, isUsersZone && !!activeUserFolderId);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setRootPage(1);
    }, [debouncedSearch, activeZone, sortField, sortDirection]);

    useEffect(() => {
        setFolderPage(1);
    }, [activePekerjaanId, activeUserFolderId, filter, debouncedSearch, activeZone, sortField, sortDirection]);

    useEffect(() => {
        if (berkasError) toast.error('Gagal memuat data berkas');
    }, [berkasError]);

    useEffect(() => {
        if (fotoError) toast.error('Gagal memuat data foto');
    }, [fotoError]);

    useEffect(() => {
        if (puspenError) toast.error('Gagal memuat media Puspen');
    }, [puspenError]);

    useEffect(() => {
        if (userDriveError) toast.error('Gagal memuat drive pengguna');
    }, [userDriveError]);

    const isLoading = isDriveHome
        ? false
        : isPuspenZone
            ? puspenLoading
            : isPekerjaanRoot
                ? pekerjaanLoading
                : isPekerjaanFolder
                    ? pekerjaanDetailLoading || (loadFoto && fotoLoading) || (loadBerkas && berkasLoading)
                    : isUsersZone
                        ? userDriveLoading || userFolderDetailLoading
                        : false;

    const pekerjaanFolders = useMemo(
        () => buildPekerjaanFoldersFromList(pekerjaanData?.data ?? []),
        [pekerjaanData?.data],
    );

    const activePekerjaan = activePekerjaanDetail?.data ?? null;

    const pekerjaanFileItems = useMemo(
        () => sortDriveItems(
            buildMediaItems(fotoData?.data, berkasData?.data, filter),
            sortField,
            sortDirection,
        ),
        [fotoData, berkasData, filter, sortField, sortDirection],
    );

    const puspenItems = useMemo(
        () => sortDriveItems(
            (puspenData ?? []).map(puspenToMediaItem),
            sortField,
            sortDirection,
        ),
        [puspenData, sortField, sortDirection],
    );

    const userDriveFolders = useMemo(
        () => (userDriveData?.data ?? []).filter((item) => item.kind === 'folder'),
        [userDriveData?.data],
    );

    const userDriveFiles = useMemo(() => {
        let files = (userDriveData?.data ?? [])
            .filter((item) => item.kind === 'file')
            .map(userDriveFileToMediaItem);

        if (filter === 'images') {
            files = files.filter((item) => item.type === 'image');
        } else if (filter === 'docs') {
            files = files.filter((item) => item.type === 'document');
        }

        return sortDriveItems(files, sortField, sortDirection);
    }, [userDriveData?.data, filter, sortField, sortDirection]);

    const navigateSearch = (patch: Partial<BerkasSearch>) => {
        const next = buildSearch(
            {
                type: filter === 'all' ? undefined : filter,
                zone: activeZone,
                pekerjaan: activePekerjaanId,
                folder: activeUserFolderId,
            },
            patch,
        );
        void navigate({ to: '/berkas', search: next });
    };

    const goDriveHome = () => navigateSearch({ zone: undefined, pekerjaan: undefined, folder: undefined });
    const openZone = (zone: DriveZone) => navigateSearch({ zone, pekerjaan: undefined, folder: undefined });
    const openPekerjaanFolder = (pekerjaanId: number) => navigateSearch({ zone: 'pekerjaan', pekerjaan: pekerjaanId });
    const openUserFolder = (folderId: number) => navigateSearch({ zone: 'users', folder: folderId });

    const fetchData = () => {
        if (isDriveHome) return;
        if (isPuspenZone) {
            void refetchPuspen();
            return;
        }
        if (isPekerjaanRoot) {
            void refetchPekerjaan();
            return;
        }
        if (isPekerjaanFolder) {
            void refetchPekerjaanDetail();
            if (loadFoto) void refetchFoto();
            if (loadBerkas) void refetchBerkas();
            return;
        }
        if (isUsersZone) void refetchUserDrive();
    };

    const handleDelete = () => {
        if (!deleteItem) return;

        const onDone = () => setDeleteItem(null);

        if (deleteItem.source === 'puspen') {
            toast.error('File Puspen tidak dapat dihapus dari Drive');
            setDeleteItem(null);
            return;
        }

        if (deleteItem.source === 'user') {
            deleteUserDriveMutation.mutate(Number(deleteItem.id), { onSettled: onDone });
            return;
        }

        if (deleteItem.type === 'image') {
            deleteFotoMutation.mutate(Number(deleteItem.id), {
                onSuccess: () => void refetchFoto(),
                onSettled: onDone,
            });
            return;
        }

        deleteBerkasMutation.mutate(Number(deleteItem.id), {
            onSuccess: () => void refetchBerkas(),
            onSettled: onDone,
        });
    };

    const handleCreateFolder = () => {
        const name = newFolderName.trim();
        if (!name) return;

        createFolderMutation.mutate(
            { name, parent_id: activeUserFolderId ?? null },
            {
                onSuccess: () => {
                    setNewFolderOpen(false);
                    setNewFolderName('');
                },
            },
        );
    };

    const handleUploadFiles = (files: FileList | null) => {
        if (!files?.length) return;

        Array.from(files).forEach((file) => {
            uploadFileMutation.mutate({
                file,
                parent_id: activeUserFolderId ?? null,
            });
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const previewIsImage = previewItem ? isImageMediaItem(previewItem) : false;

    const pageTitle = isDriveHome
        ? 'Drive Arumanis'
        : isPuspenZone
            ? 'Puspen'
            : isPekerjaanFolder && activePekerjaan
                ? activePekerjaan.nama_paket
                : isPekerjaanZone
                    ? 'Pekerjaan'
                    : activeUserFolder
                        ? activeUserFolder.name
                        : 'Users';

    const pageSubtitle = isDriveHome
        ? 'Pilih zona: Puspen, Pekerjaan, atau Users'
        : isPuspenZone
            ? 'Media dan berkas dari ekosistem Puspen'
            : isPekerjaanFolder && activePekerjaan
                ? formatFolderLocation(activePekerjaan)
                : isPekerjaanZone
                    ? 'Folder per paket pekerjaan'
                    : isUsersRoot
                        ? `Drive pribadi ${auth.user?.name ?? 'pengguna'}`
                        : 'Folder pribadi Anda';

    const searchPlaceholder = isDriveHome
        ? 'Pilih zona di bawah...'
        : isPuspenZone
            ? 'Cari media Puspen...'
            : isPekerjaanRoot
                ? 'Cari folder pekerjaan...'
                : isUsersZone
                    ? 'Cari folder atau file...'
                    : 'Cari file di folder ini...';

    const pekerjaanTotalPages = pekerjaanData?.meta?.last_page ?? 1;
    const pekerjaanFileTotalPages = useMemo(() => {
        if (filter === 'images') return fotoData?.meta?.last_page ?? 1;
        if (filter === 'docs') return berkasData?.meta?.last_page ?? 1;
        return Math.max(fotoData?.meta?.last_page ?? 1, berkasData?.meta?.last_page ?? 1);
    }, [filter, fotoData?.meta?.last_page, berkasData?.meta?.last_page]);

    const userDriveTotalPages = userDriveData?.meta?.last_page ?? 1;

    const renderFileGrid = (items: MediaItem[], allowDelete = true) => (
        <div className="space-y-4">
            {view === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {items.map((item) => (
                        <MediaCard
                            key={`${item.source ?? 'file'}-${item.id}`}
                            item={item}
                            showPekerjaan={item.source === 'puspen'}
                            onClick={setPreviewItem}
                            onDelete={allowDelete ? setDeleteItem : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border divide-y">
                    {items.map((item) => (
                        <div
                            key={`${item.source ?? 'file'}-${item.id}`}
                            className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                            onClick={() => setPreviewItem(item)}
                        >
                            {isImageMediaItem(item) ? (
                                <img src={item.url} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.type === 'image' ? 'Foto' : getFileExtension(item.url || item.name).toUpperCase() || 'Berkas'}
                                    {' · '}
                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            {allowDelete ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteItem(item);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Header />
            <Main>
                <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-5">
                    <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <button
                                    type="button"
                                    onClick={goDriveHome}
                                    className={cn(
                                        'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground',
                                        isDriveHome && 'font-medium text-foreground',
                                    )}
                                >
                                    <Home className="h-4 w-4" />
                                    Drive
                                </button>
                                {activeZone ? (
                                    <>
                                        <ChevronRight className="h-4 w-4" />
                                        <button
                                            type="button"
                                            onClick={() => openZone(activeZone)}
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground',
                                                !activePekerjaanId && !activeUserFolderId && 'font-medium text-foreground',
                                            )}
                                        >
                                            <FolderOpen className="h-4 w-4 text-amber-500" />
                                            {ZONE_META[activeZone].title}
                                        </button>
                                    </>
                                ) : null}
                                {activePekerjaan ? (
                                    <>
                                        <ChevronRight className="h-4 w-4" />
                                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                            {activePekerjaan.nama_paket}
                                        </span>
                                    </>
                                ) : null}
                                {activeUserFolder ? (
                                    <>
                                        <ChevronRight className="h-4 w-4" />
                                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                            {activeUserFolder.name}
                                        </span>
                                    </>
                                ) : null}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{pageTitle}</h1>
                                <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {!isDriveHome ? (
                                <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                                    <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                                    Refresh
                                </Button>
                            ) : null}
                            {isUsersZone ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setNewFolderOpen(true)}>
                                        <FolderPlus className="mr-2 h-4 w-4" />
                                        Folder Baru
                                    </Button>
                                    <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Unggah File
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleUploadFiles(e.target.files)}
                                    />
                                </>
                            ) : null}
                            {isPekerjaanFolder ? (
                                <Button size="sm" asChild>
                                    <Link
                                        to="/berkas/new"
                                        search={{ pekerjaan_id: String(activePekerjaanId) }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Unggah Berkas
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    {!isDriveHome ? (
                        <div className="flex flex-col gap-3 rounded-2xl border bg-card/60 p-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                                    {([
                                        ['all', 'Semua'],
                                        ['images', 'Foto'],
                                        ['docs', 'Berkas'],
                                    ] as const).map(([value, label]) => (
                                        <Button
                                            key={value}
                                            variant={filter === value ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="h-8 rounded-md text-xs"
                                            onClick={() => setFilter(value)}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>

                                <Select value={sortField} onValueChange={(value) => setSortField(value as DriveSortField)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Terbaru</SelectItem>
                                        <SelectItem value="name">Nama</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sortDirection}
                                    onValueChange={(value) => setSortDirection(value as DriveSortDirection)}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Turun</SelectItem>
                                        <SelectItem value="asc">Naik</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center rounded-lg border">
                                    <Button
                                        type="button"
                                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="rounded-r-none"
                                        onClick={() => setView('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={view === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="rounded-l-none"
                                        onClick={() => setView('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="flex flex-1 items-center justify-center py-20">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : isDriveHome ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <DriveZoneCard
                                title="Puspen"
                                description={ZONE_META.puspen.description}
                                icon={Share2}
                                accentClass="hover:border-violet-500/40 hover:bg-violet-50/40 dark:hover:bg-violet-950/20"
                                onOpen={() => openZone('puspen')}
                            />
                            <DriveZoneCard
                                title="Pekerjaan"
                                description={ZONE_META.pekerjaan.description}
                                icon={Briefcase}
                                accentClass="hover:border-amber-500/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
                                onOpen={() => openZone('pekerjaan')}
                            />
                            <DriveZoneCard
                                title="Users"
                                description={ZONE_META.users.description}
                                icon={User}
                                accentClass="hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                                itemLabel={auth.user?.name ? `Drive ${auth.user.name}` : undefined}
                                onOpen={() => openZone('users')}
                            />
                        </div>
                    ) : isPuspenZone ? (
                        puspenItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
                                <Share2 className="mx-auto mb-3 h-12 w-12 opacity-40" />
                                <p>Belum ada media Puspen untuk filter ini.</p>
                            </div>
                        ) : (
                            renderFileGrid(puspenItems, false)
                        )
                    ) : isPekerjaanRoot ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                {pekerjaanData?.meta?.total ?? pekerjaanFolders.length} folder pekerjaan
                            </div>
                            {pekerjaanFolders.length === 0 ? (
                                <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
                                    <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-40" />
                                    <p>Belum ada pekerjaan untuk tahun anggaran ini.</p>
                                </div>
                            ) : (
                                <>
                                    {view === 'grid' ? (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {pekerjaanFolders.map((folder) => (
                                                <PekerjaanFolderCard
                                                    key={folder.pekerjaan.id}
                                                    folder={folder}
                                                    variant="grid"
                                                    onOpen={() => openPekerjaanFolder(folder.pekerjaan.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-2xl border divide-y">
                                            {pekerjaanFolders.map((folder) => (
                                                <PekerjaanFolderCard
                                                    key={folder.pekerjaan.id}
                                                    folder={folder}
                                                    variant="list"
                                                    onOpen={() => openPekerjaanFolder(folder.pekerjaan.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <ListPagination
                                        page={rootPage}
                                        totalPages={pekerjaanTotalPages}
                                        onPageChange={setRootPage}
                                        disabled={pekerjaanLoading}
                                        meta={{
                                            from: pekerjaanData?.meta?.from,
                                            to: pekerjaanData?.meta?.to,
                                            total: pekerjaanData?.meta?.total,
                                            label: 'pekerjaan',
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    ) : isPekerjaanFolder ? (
                        pekerjaanFileItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
                                <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
                                <p>Folder ini belum berisi file untuk filter yang dipilih.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {renderFileGrid(pekerjaanFileItems)}
                                <ListPagination
                                    page={folderPage}
                                    totalPages={pekerjaanFileTotalPages}
                                    onPageChange={setFolderPage}
                                    disabled={isLoading}
                                />
                            </div>
                        )
                    ) : isUsersZone ? (
                        userDriveFolders.length === 0 && userDriveFiles.length === 0 ? (
                            <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
                                <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-40" />
                                <p>Folder kosong. Buat folder atau unggah file.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userDriveFolders.length > 0 ? (
                                    view === 'grid' ? (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {userDriveFolders.map((folder) => (
                                                <DriveFolderCard
                                                    key={folder.id}
                                                    name={folder.name}
                                                    subtitle="Folder pribadi"
                                                    meta={new Date(folder.updated_at).toLocaleDateString('id-ID')}
                                                    accent="blue"
                                                    variant="grid"
                                                    onOpen={() => openUserFolder(folder.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-2xl border divide-y">
                                            {userDriveFolders.map((folder) => (
                                                <DriveFolderCard
                                                    key={folder.id}
                                                    name={folder.name}
                                                    subtitle="Folder pribadi"
                                                    meta={new Date(folder.updated_at).toLocaleDateString('id-ID')}
                                                    accent="blue"
                                                    variant="list"
                                                    onOpen={() => openUserFolder(folder.id)}
                                                />
                                            ))}
                                        </div>
                                    )
                                ) : null}
                                {userDriveFiles.length > 0 ? renderFileGrid(userDriveFiles) : null}
                                <ListPagination
                                    page={folderPage}
                                    totalPages={userDriveTotalPages}
                                    onPageChange={setFolderPage}
                                    disabled={isLoading}
                                    meta={{
                                        from: userDriveData?.meta?.from,
                                        to: userDriveData?.meta?.to,
                                        total: userDriveData?.meta?.total,
                                        label: 'item',
                                    }}
                                />
                            </div>
                        )
                    ) : null}
                </div>

                <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Buat Folder Baru</DialogTitle>
                        </DialogHeader>
                        <Input
                            placeholder="Nama folder"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Batal</Button>
                            <Button onClick={handleCreateFolder} disabled={createFolderMutation.isPending}>
                                Buat
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus File?</AlertDialogTitle>
                            <AlertDialogDescription>
                                File &quot;{deleteItem?.name}&quot; akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {previewItem && previewIsImage ? (
                    <ImagePreviewModal
                        open
                        onOpenChange={(open) => !open && setPreviewItem(null)}
                        imageUrl={previewItem.url}
                        title={previewItem.name}
                        badge={previewItem.progress}
                        coordinate={previewItem.koordinat}
                    />
                ) : null}

                {previewItem && !previewIsImage ? (
                    <DocumentPreviewModal
                        isOpen
                        onClose={() => setPreviewItem(null)}
                        url={previewItem.url}
                        title={previewItem.name}
                        fileName={previewItem.name}
                        mediaId={previewItem.media_id}
                        onDocumentSaved={() => {
                            if (isPekerjaanFolder) void refetchBerkas();
                        }}
                    />
                ) : null}
            </Main>
        </>
    );
}