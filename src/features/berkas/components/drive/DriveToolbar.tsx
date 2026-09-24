import { LayoutGrid, Search, TableProperties } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { DriveSort } from '../../lib/drive-view'

export type DriveViewMode = 'grid' | 'list'

type DriveToolbarProps = {
    search: string
    onSearchChange: (value: string) => void
    sort: DriveSort
    onSortChange: (sort: DriveSort) => void
    view: DriveViewMode
    onViewChange: (view: DriveViewMode) => void
}

/** Toolbar drive: pola `file-manager-toolbar` v2 dengan kontrol Radix milik repo. */
export function DriveToolbar({ search, onSearchChange, sort, onSortChange, view, onViewChange }: DriveToolbarProps) {
    return (
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center'>
            <InputGroup className='md:max-w-lg'>
                <InputGroupInput
                    placeholder='Cari file dan folder...'
                    aria-label='Cari file dan folder'
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup>
            <div className='flex flex-1 flex-wrap items-center gap-2 xl:justify-end'>
                <div className='flex items-center gap-1.5'>
                    <Label htmlFor='drive-sort' className='sr-only'>
                        Urutkan
                    </Label>
                    <Select value={sort} onValueChange={(value) => onSortChange(value as DriveSort)}>
                        <SelectTrigger id='drive-sort' size='sm' className='w-36 text-xs'>
                            <SelectValue placeholder='Urutkan' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='updated' className='text-xs'>
                                Terakhir diubah
                            </SelectItem>
                            <SelectItem value='name' className='text-xs'>
                                Nama
                            </SelectItem>
                            <SelectItem value='size' className='text-xs'>
                                Ukuran
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex items-center gap-1 rounded-lg border bg-card p-1' role='group' aria-label='Tampilan drive'>
                    <Button
                        type='button'
                        size='sm'
                        variant={view === 'grid' ? 'default' : 'ghost'}
                        className={cn('h-7 gap-1.5 px-2.5 text-xs')}
                        onClick={() => onViewChange('grid')}
                        aria-pressed={view === 'grid'}
                    >
                        <LayoutGrid className='h-3.5 w-3.5' />
                        <span className='hidden sm:inline'>Grid</span>
                    </Button>
                    <Button
                        type='button'
                        size='sm'
                        variant={view === 'list' ? 'default' : 'ghost'}
                        className={cn('h-7 gap-1.5 px-2.5 text-xs')}
                        onClick={() => onViewChange('list')}
                        aria-pressed={view === 'list'}
                    >
                        <TableProperties className='h-3.5 w-3.5' />
                        <span className='hidden sm:inline'>List</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
