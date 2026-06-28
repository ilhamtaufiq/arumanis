import { useState } from 'react';
import { Check, Loader2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Tag } from '../types';
import { toast } from 'sonner';
import { tagKeys, useCreateTag, useTagsList } from '../hooks/useTags';

const TAG_COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#F97316',
];

const MAX_VISIBLE_PILLS = 2;

interface PekerjaanTagSelectProps {
    selectedTags: Tag[];
    disabled?: boolean;
    onChange: (tags: Tag[]) => void;
}

export function PekerjaanTagSelect({ selectedTags, disabled, onChange }: PekerjaanTagSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const queryClient = useQueryClient();
    const { data: tagsData, isLoading } = useTagsList(undefined, open);
    const createTagMutation = useCreateTag();
    const availableTags = tagsData?.data ?? [];

    const visibleTags = selectedTags.slice(0, MAX_VISIBLE_PILLS);
    const hiddenTags = selectedTags.slice(MAX_VISIBLE_PILLS);

    const handleToggleTag = (tag: Tag) => {
        const isSelected = selectedTags.some((entry) => entry.id === tag.id);
        if (isSelected) {
            onChange(selectedTags.filter((entry) => entry.id !== tag.id));
            return;
        }
        onChange([...selectedTags, tag]);
    };

    const handleCreateTag = async () => {
        const name = searchValue.trim();
        if (!name) return;

        const exists = availableTags.some(
            (tag) => tag.name.toLowerCase() === name.toLowerCase(),
        );

        if (exists) {
            toast.error('Tag sudah ada');
            return;
        }

        try {
            const response = await createTagMutation.mutateAsync({
                name,
                color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
            });
            const newTag = response.data;
            await queryClient.invalidateQueries({ queryKey: tagKeys.all });
            onChange([...selectedTags, newTag]);
            setSearchValue('');
            toast.success('Tag berhasil dibuat');
        } catch {
            toast.error('Gagal membuat tag');
        }
    };

    const filteredTags = availableTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchValue.toLowerCase()),
    );

    const showCreateOption =
        searchValue.trim().length > 0 &&
        !filteredTags.some(
            (tag) => tag.name.toLowerCase() === searchValue.trim().toLowerCase(),
        );

    return (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {visibleTags.map((tag) => (
                <Badge
                    key={tag.id}
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-medium"
                    style={{
                        borderColor: tag.color || undefined,
                        color: tag.color || undefined,
                        backgroundColor: tag.color ? `${tag.color}14` : undefined,
                    }}
                >
                    {tag.name}
                </Badge>
            ))}

            {hiddenTags.length > 0 && (
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className="h-5 cursor-default px-1.5 text-[10px] text-muted-foreground"
                            >
                                +{hiddenTags.length}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px]">
                            <p className="text-xs">{hiddenTags.map((tag) => tag.name).join(', ')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        className="h-5 gap-0.5 border-dashed px-1.5 text-[10px] font-normal"
                    >
                        <Plus className="h-3 w-3" />
                        Tag
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Cari atau buat tag..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandList>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>
                                        {showCreateOption
                                            ? 'Pilih opsi buat tag baru di bawah'
                                            : 'Tidak ada tag ditemukan'}
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {filteredTags.map((tag) => {
                                            const isSelected = selectedTags.some(
                                                (entry) => entry.id === tag.id,
                                            );

                                            return (
                                                <CommandItem
                                                    key={tag.id}
                                                    value={tag.name}
                                                    onSelect={() => handleToggleTag(tag)}
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
                                        {showCreateOption && (
                                            <CommandItem
                                                value={`create-${searchValue}`}
                                                onSelect={handleCreateTag}
                                                disabled={createTagMutation.isPending}
                                            >
                                                {createTagMutation.isPending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="mr-2 h-4 w-4" />
                                                )}
                                                <span>Buat tag &quot;{searchValue.trim()}&quot;</span>
                                            </CommandItem>
                                        )}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}