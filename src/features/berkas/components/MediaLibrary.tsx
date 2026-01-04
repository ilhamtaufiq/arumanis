import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { getBerkasList, deleteBerkas } from '../api';
import { getFotoList, deleteFoto } from '@/features/foto/api';
import type { Berkas, BerkasResponse } from '../types';
import type { Foto, FotoResponse } from '@/features/foto/types';
import MediaCard, { type MediaItem } from './MediaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Search,
    RefreshCw,
    Grid3X3,
    List,
    Image as ImageIcon,
    FileText,
    Files,
    X,
    Download,
    Trash2,
    ExternalLink,
    MapPin,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Check,
    Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'images' | 'docs';
type SortType = 'date' | 'name';
type ViewType = 'grid' | 'list';

// Convert Foto to MediaItem
function fotoToMediaItem(foto: Foto): MediaItem {
    return {
        id: foto.id,
        type: 'image',
        name: foto.komponen?.komponen || `Foto ${foto.keterangan}`,
        url: foto.foto_url,
        pekerjaan_id: foto.pekerjaan_id,
        pekerjaan_name: foto.pekerjaan?.nama_paket || '-',
        created_at: foto.created_at,
        progress: foto.keterangan,
        koordinat: foto.koordinat,
        komponen: foto.komponen?.komponen,
    };
}

// Convert Berkas to MediaItem
function berkasToMediaItem(berkas: Berkas): MediaItem {
    return {
        id: berkas.id,
        type: 'document',
        name: berkas.jenis_dokumen,
        url: berkas.berkas_url,
        pekerjaan_id: berkas.pekerjaan_id,
        pekerjaan_name: berkas.pekerjaan?.nama_paket || '-',
        created_at: berkas.created_at,
        jenis_dokumen: berkas.jenis_dokumen,
    };
}

export default function MediaLibrary() {
    const { tahunAnggaran } = useAppSettingsValues();
    const searchParams = useSearch({ from: '/_authenticated/berkas/' });

    // State
    const [fotoData, setFotoData] = useState<FotoResponse | null>(null);
    const [berkasData, setBerkasData] = useState<BerkasResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>((searchParams as { type?: FilterType }).type || 'all');
    const [pekerjaanFilter, setPekerjaanFilter] = useState<string>('all');
    const [sort, setSort] = useState<SortType>('date');
    const [view, setView] = useState<ViewType>('grid');
    const [page, setPage] = useState(1);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectionType, setSelectionType] = useState<'image' | 'document' | null>(null);

    // Delete / Preview
    const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
    const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

    // Pekerjaan combobox
    const [pekerjaanPopoverOpen, setPekerjaanPopoverOpen] = useState(false);

    // Fetch both data sources
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [fotoRes, berkasRes] = await Promise.all([
                filter !== 'docs' ? getFotoList({ page, search, tahun: tahunAnggaran }) : Promise.resolve(null),
                filter !== 'images' ? getBerkasList({ page, search, tahun: tahunAnggaran }) : Promise.resolve(null),
            ]);
            setFotoData(fotoRes);
            setBerkasData(berkasRes);
        } catch (error) {
            console.error('Failed to fetch media:', error);
            toast.error('Gagal memuat data media');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, tahunAnggaran, filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    // Merge and sort data
    const mediaItems = useMemo(() => {
        let items: MediaItem[] = [];

        if (fotoData?.data && filter !== 'docs') {
            items.push(...fotoData.data.map(fotoToMediaItem));
        }
        if (berkasData?.data && filter !== 'images') {
            items.push(...berkasData.data.map(berkasToMediaItem));
        }

        // Filter by pekerjaan
        if (pekerjaanFilter !== 'all') {
            items = items.filter(item => item.pekerjaan_name === pekerjaanFilter);
        }

        // Sort
        items.sort((a, b) => {
            if (sort === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return a.name.localeCompare(b.name);
        });

        return items;
    }, [fotoData, berkasData, filter, sort, pekerjaanFilter]);

    // Get unique pekerjaan names for filter
    const pekerjaanList = useMemo(() => {
        const names = new Set<string>();
        if (fotoData?.data) {
            fotoData.data.forEach(f => f.pekerjaan?.nama_paket && names.add(f.pekerjaan.nama_paket));
        }
        if (berkasData?.data) {
            berkasData.data.forEach(b => b.pekerjaan?.nama_paket && names.add(b.pekerjaan.nama_paket));
        }
        return Array.from(names).sort();
    }, [fotoData, berkasData]);

    const totalItems = useMemo(() => {
        let total = 0;
        if (filter !== 'docs' && fotoData?.meta?.total) total += fotoData.meta.total;
        if (filter !== 'images' && berkasData?.meta?.total) total += berkasData.meta.total;
        return total;
    }, [fotoData, berkasData, filter]);

    // Selection handlers
    const handleSelect = (id: number, type: 'image' | 'document') => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                if (next.size === 0) setSelectionType(null);
            } else {
                next.add(id);
                setSelectionType(type);
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
        setSelectionType(null);
    };

    // Delete handler
    const handleDelete = async () => {
        if (!deleteItem) return;

        try {
            if (deleteItem.type === 'image') {
                await deleteFoto(deleteItem.id);
            } else {
                await deleteBerkas(deleteItem.id);
            }
            toast.success('File berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Gagal menghapus file');
        } finally {
            setDeleteItem(null);
        }
    };

    // Check if URL is a PDF
    const isPdf = (url: string) => {
        try {
            const pathname = new URL(url, 'https://placeholder.local').pathname;
            return pathname.toLowerCase().endsWith('.pdf');
        } catch {
            return url.toLowerCase().includes('.pdf');
        }
    };

    // Click handler
    const handleItemClick = (item: MediaItem) => {
        if (item.type === 'image' || isPdf(item.url)) {
            setPreviewItem(item);
        } else {
            window.open(item.url, '_blank');
        }
    };

    const hasNextPage = (fotoData?.links?.next || berkasData?.links?.next);
    const hasPrevPage = page > 1;

    return (
        <>
            <Header />
            <Main>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                            <p className="text-muted-foreground">
                                Kelola foto dan dokumen pekerjaan
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search files..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={filter === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilter('all')}
                                    >
                                        <Files className="h-4 w-4 mr-2" />
                                        All Files
                                    </Button>
                                    <Button
                                        variant={filter === 'images' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilter('images')}
                                    >
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Images
                                    </Button>
                                    <Button
                                        variant={filter === 'docs' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilter('docs')}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Docs
                                    </Button>
                                </div>

                                {/* Pekerjaan Filter - Searchable Combobox */}
                                {pekerjaanList.length > 0 && (
                                    <Popover open={pekerjaanPopoverOpen} onOpenChange={setPekerjaanPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={pekerjaanPopoverOpen}
                                                className="w-[250px] justify-between"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <Briefcase className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">
                                                        {pekerjaanFilter === 'all'
                                                            ? 'Semua Paket'
                                                            : pekerjaanFilter}
                                                    </span>
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Cari nama paket..." />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem
                                                            value="all"
                                                            onSelect={() => {
                                                                setPekerjaanFilter('all');
                                                                setPekerjaanPopoverOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    pekerjaanFilter === 'all' ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            Semua Paket
                                                        </CommandItem>
                                                        {pekerjaanList.map((name) => (
                                                            <CommandItem
                                                                key={name}
                                                                value={name}
                                                                onSelect={() => {
                                                                    setPekerjaanFilter(name);
                                                                    setPekerjaanPopoverOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        pekerjaanFilter === name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <span className="truncate">{name}</span>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{mediaItems.length}</span> of <span className="font-medium">{totalItems}</span> assets
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Sort by:</span>
                                <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Date Added</SelectItem>
                                        <SelectItem value="name">Name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="rounded-r-none"
                                    onClick={() => setView('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
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

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : mediaItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg">
                            <Files className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada media ditemukan.</p>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {mediaItems.map((item) => (
                                <MediaCard
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    isSelected={selectedIds.has(item.id) && selectionType === item.type}
                                    onSelect={() => handleSelect(item.id, item.type)}
                                    onClick={handleItemClick}
                                    onDelete={() => setDeleteItem(item)}
                                />
                            ))}
                        </div>
                    ) : (
                        // List view - simplified
                        <div className="border rounded-lg divide-y">
                            {mediaItems.map((item) => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleItemClick(item)}
                                >
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{item.pekerjaan_name}</p>
                                    </div>
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
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {(hasNextPage || hasPrevPage) && (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!hasPrevPage}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-2">Page {page}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasNextPage}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Selection Action Bar */}
                {selectedIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-4 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl">
                            <span className="flex items-center justify-center bg-white/20 rounded-full h-7 w-7 text-sm font-medium">
                                {selectedIds.size}
                            </span>
                            <span>Selected</span>
                            <div className="flex items-center gap-2 ml-4">
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full text-primary-foreground hover:bg-white/20"
                                    onClick={clearSelection}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Dialog */}
                <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus File?</AlertDialogTitle>
                            <AlertDialogDescription>
                                File "{deleteItem?.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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

                {/* Preview Dialog (Images & PDFs) */}
                <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
                    <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="truncate pr-4">
                                {previewItem?.name}
                            </DialogTitle>
                        </DialogHeader>
                        {previewItem && (
                            <div className="flex flex-col">
                                {/* Preview Area */}
                                {previewItem.type === 'image' ? (
                                    <div className="relative flex items-center justify-center bg-black/5 dark:bg-black/20 min-h-[300px] max-h-[60vh]">
                                        <img
                                            src={previewItem.url}
                                            alt="Preview"
                                            className="max-w-full max-h-[60vh] object-contain"
                                        />
                                    </div>
                                ) : isPdf(previewItem.url) ? (
                                    <div className="relative bg-muted min-h-[500px] h-[65vh]">
                                        <iframe
                                            src={previewItem.url}
                                            title="PDF Preview"
                                            className="w-full h-full border-0"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-20 bg-muted">
                                        <FileText className="h-20 w-20 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Footer Info */}
                                <div className="p-4 border-t bg-muted/30 space-y-2">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        {previewItem.progress && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Progress:</span>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                                                    {previewItem.progress}
                                                </span>
                                            </div>
                                        )}
                                        {previewItem.koordinat && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span className="font-mono text-xs">{previewItem.koordinat}</span>
                                            </div>
                                        )}
                                        {previewItem.jenis_dokumen && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Jenis:</span>
                                                <span className="font-medium">{previewItem.jenis_dokumen}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-sm text-muted-foreground truncate flex-1">
                                            {previewItem.pekerjaan_name}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(previewItem.url, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Open
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setPreviewItem(null)}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}
