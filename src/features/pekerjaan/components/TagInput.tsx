import { useState, useEffect, useRef } from 'react';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getTags, createTag } from '../api/tags';
import type { Tag } from '../types';
import { toast } from 'sonner';

interface TagInputProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    disabled?: boolean;
}

// Default colors for new tags
const TAG_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
];

export default function TagInput({ selectedTags, onTagsChange, disabled }: TagInputProps) {
    const [open, setOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [creating, setCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch available tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                setLoading(true);
                const response = await getTags();
                setAvailableTags(response.data);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchTags();
        }
    }, [open]);

    const handleSelect = (tag: Tag) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        if (isSelected) {
            onTagsChange(selectedTags.filter(t => t.id !== tag.id));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const handleRemove = (tagId: number) => {
        onTagsChange(selectedTags.filter(t => t.id !== tagId));
    };

    const handleCreateTag = async () => {
        if (!searchValue.trim()) return;

        // Check if tag already exists
        const exists = availableTags.some(
            t => t.name.toLowerCase() === searchValue.trim().toLowerCase()
        );

        if (exists) {
            toast.error('Tag sudah ada');
            return;
        }

        try {
            setCreating(true);
            const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
            const response = await createTag({
                name: searchValue.trim(),
                color: randomColor
            });
            const newTag = response.data;

            setAvailableTags(prev => [...prev, newTag]);
            onTagsChange([...selectedTags, newTag]);
            setSearchValue('');
            toast.success('Tag berhasil dibuat');
        } catch (error) {
            console.error('Failed to create tag:', error);
            toast.error('Gagal membuat tag');
        } finally {
            setCreating(false);
        }
    };

    // Filter available tags based on search
    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Check if we should show "create new tag" option
    const showCreateOption = searchValue.trim() &&
        !filteredTags.some(t => t.name.toLowerCase() === searchValue.trim().toLowerCase());

    return (
        <div className="space-y-2">
            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {selectedTags.map(tag => (
                    <Badge
                        key={tag.id}
                        variant="secondary"
                        className="px-2 py-1 text-sm gap-1"
                        style={{
                            backgroundColor: tag.color ? `${tag.color}20` : undefined,
                            borderColor: tag.color || undefined,
                            color: tag.color || undefined
                        }}
                    >
                        {tag.name}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => handleRemove(tag.id)}
                                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </Badge>
                ))}
            </div>

            {/* Tag Selector */}
            {!disabled && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 border-dashed"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Tambah Tag
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput
                                ref={inputRef}
                                placeholder="Cari atau buat tag..."
                                value={searchValue}
                                onValueChange={setSearchValue}
                            />
                            <CommandList>
                                {loading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <CommandEmpty>
                                            {showCreateOption ? (
                                                <div className="py-2 px-3 text-sm text-muted-foreground">
                                                    Tekan Enter untuk membuat tag baru
                                                </div>
                                            ) : (
                                                'Tidak ada tag ditemukan'
                                            )}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {filteredTags.map(tag => {
                                                const isSelected = selectedTags.some(t => t.id === tag.id);
                                                return (
                                                    <CommandItem
                                                        key={tag.id}
                                                        value={tag.name}
                                                        onSelect={() => handleSelect(tag)}
                                                    >
                                                        <div
                                                            className="mr-2 h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: tag.color || '#6B7280' }}
                                                        />
                                                        <span className="flex-1">{tag.name}</span>
                                                        {isSelected && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </CommandItem>
                                                );
                                            })}

                                            {/* Create new tag option */}
                                            {showCreateOption && (
                                                <CommandItem
                                                    value={`create-${searchValue}`}
                                                    onSelect={handleCreateTag}
                                                    disabled={creating}
                                                >
                                                    {creating ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Plus className="h-4 w-4 mr-2" />
                                                    )}
                                                    <span>Buat tag "{searchValue}"</span>
                                                </CommandItem>
                                            )}
                                        </CommandGroup>
                                    </>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
