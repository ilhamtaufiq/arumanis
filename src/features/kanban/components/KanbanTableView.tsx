import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Inbox, Link2, MessageSquare, PenLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { flattenBoardCards } from '../lib/kanban-board'
import type { KanbanBoard, KanbanCard } from '../types'
import { KanbanCardDialog } from './KanbanCardDialog'

type KanbanTableViewProps = {
    board: KanbanBoard
    canManage: boolean
}

/**
 * Dashboard-v2 pilot (tasks): tampilan tabel datar di atas data board yang sama.
 * Meniru pola toolbar+tabel screen `tasks` temp-apps — tanpa mock,
 * filter search/source tetap dari `KanbanPage` via board yang sudah difilter.
 */
export function KanbanTableView({ board, canManage }: KanbanTableViewProps) {
    const rows = useMemo(() => flattenBoardCards(board), [board])
    const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const openEditDialog = (card: KanbanCard) => {
        setSelectedCard(card)
        setDialogOpen(true)
    }

    if (rows.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <Inbox />
                    </EmptyMedia>
                    <EmptyTitle>Tidak ada kartu</EmptyTitle>
                    <EmptyDescription>
                        Belum ada kartu pada board ini atau filter menyembunyikan semuanya.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className='overflow-x-auto rounded-xl border bg-card'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Kolom</TableHead>
                        <TableHead>Sumber</TableHead>
                        <TableHead>Pekerjaan</TableHead>
                        <TableHead className='text-right'>Diperbarui</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(({ column, card }) => {
                        const isFromTiket = card.source === 'tiket'
                        const updatedLabel = card.updated_at
                            ? formatDistanceToNow(new Date(card.updated_at), { addSuffix: true, locale: localeId })
                            : '-'
                        return (
                            <TableRow
                                key={card.id}
                                className='cursor-pointer'
                                onClick={() => openEditDialog(card)}
                            >
                                <TableCell className='max-w-72'>
                                    <p className='truncate font-medium'>{card.title}</p>
                                    <span className='mt-1 flex flex-wrap items-center gap-1'>
                                        <Badge
                                            variant='secondary'
                                            className={cn(
                                                'gap-1 px-1.5 py-0 text-[10px] font-medium',
                                                isFromTiket
                                                    ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
                                                    : 'bg-muted',
                                            )}
                                        >
                                            {isFromTiket ? (
                                                <MessageSquare className='h-3 w-3' />
                                            ) : (
                                                <PenLine className='h-3 w-3' />
                                            )}
                                            {isFromTiket ? 'Tiket' : 'Manual'}
                                        </Badge>
                                        {card.status_label ? (
                                            <span className='truncate rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200'>
                                                {card.status_label}
                                            </span>
                                        ) : null}
                                        {card.tiket_id ? (
                                            <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]'>
                                                <Link2 className='h-3 w-3' />#{card.tiket_id}
                                            </span>
                                        ) : null}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className='inline-flex items-center gap-1.5 whitespace-nowrap text-sm'>
                                        {column.color ? (
                                            <span
                                                className='size-2 rounded-full'
                                                style={{ backgroundColor: column.color }}
                                            />
                                        ) : null}
                                        {column.title}
                                    </span>
                                </TableCell>
                                <TableCell className='text-sm text-muted-foreground'>
                                    {card.creator?.name ?? '-'}
                                </TableCell>
                                <TableCell className='max-w-56 truncate text-sm'>
                                    {card.pekerjaan?.nama_paket ?? '-'}
                                </TableCell>
                                <TableCell className='text-right text-xs whitespace-nowrap text-muted-foreground'>
                                    {updatedLabel}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            <KanbanCardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                columnId={selectedCard?.column_id ?? null}
                card={selectedCard}
                canManage={canManage}
            />
        </div>
    )
}
