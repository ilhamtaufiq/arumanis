import { useMemo, useState } from 'react';
import { BookOpen, Copy, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    filterPlaceholderGroups,
    formatKontrakPlaceholder,
    KONTRAK_PLACEHOLDER_SYNTAX,
    type KontrakPlaceholderItem,
} from '../constants/kontrak-template-placeholders';

function PlaceholderRow({ item }: { item: KontrakPlaceholderItem }) {
    const token = formatKontrakPlaceholder(item.key);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(token);
            toast.success(`Disalin: ${token}`);
        } catch {
            toast.error('Gagal menyalin placeholder');
        }
    };

    return (
        <div className="flex items-start justify-between gap-3 rounded-md border bg-background/80 px-3 py-2">
            <div className="min-w-0 space-y-0.5">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{token}</code>
                <p className="text-sm text-foreground">{item.label}</p>
                {item.example ? (
                    <p className="text-xs text-muted-foreground">Contoh: {item.example}</p>
                ) : null}
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export function KontrakPlaceholderReference() {
    const [query, setQuery] = useState('');
    const groups = useMemo(() => filterPlaceholderGroups(query), [query]);
    const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

    return (
        <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-5 w-5" />
                    Placeholder Tersedia
                </CardTitle>
                <CardDescription>
                    Sisipkan placeholder ke template Word atau Excel dengan format{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{KONTRAK_PLACEHOLDER_SYNTAX}</code>.
                    Sistem menggantinya otomatis saat generate dokumen.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari placeholder..."
                        className="pl-9"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{totalItems} placeholder</Badge>
                    <span>Word (.docx) dan Excel (.xlsx) mendukung format yang sama.</span>
                </div>

                <div className="max-h-[calc(100vh-18rem)] space-y-5 overflow-y-auto pr-1">
                    {groups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada placeholder yang cocok dengan pencarian.</p>
                    ) : (
                        groups.map((group) => (
                            <div key={group.id} className="space-y-2">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {group.label}
                                    </p>
                                    {group.description ? (
                                        <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    {group.items.map((item) => (
                                        <PlaceholderRow key={`${group.id}-${item.key}`} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}