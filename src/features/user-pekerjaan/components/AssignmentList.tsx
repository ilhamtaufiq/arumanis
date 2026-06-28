import { useEffect, useMemo, useState } from 'react'
import { Briefcase, Mail } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchInput } from '@/components/shared/SearchInput'
import { ListPagination } from '@/components/shared/ListPagination'
import { ListRowActions } from '@/components/shared/ListRowActions'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { formatCurrency } from '../lib/format'
import { useAssignments, useDeleteAssignment } from '../hooks/useUserPekerjaan'
import type { UserPekerjaanAssignment } from '../api/user-pekerjaan'

const ITEMS_PER_PAGE = 5

type AssignmentGroup = {
    user_id: number
    user_name: string
    user_email: string
    assignments: UserPekerjaanAssignment[]
    totalPagu: number
}

export function AssignmentList() {
    const [assignmentSearch, setAssignmentSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const { data: assignments = [], isLoading } = useAssignments()
    const deleteMutation = useDeleteAssignment()

    const groupedAssignments = useMemo(() => {
        const searchLower = assignmentSearch.toLowerCase()
        const filtered = assignmentSearch
            ? assignments.filter(
                  (assignment) =>
                      assignment.user_name.toLowerCase().includes(searchLower) ||
                      assignment.pekerjaan_nama.toLowerCase().includes(searchLower) ||
                      assignment.user_email.toLowerCase().includes(searchLower),
              )
            : assignments

        const groups: Record<string, AssignmentGroup> = {}

        filtered.forEach((assignment) => {
            const key = assignment.user_id.toString()
            if (!groups[key]) {
                groups[key] = {
                    user_id: assignment.user_id,
                    user_name: assignment.user_name,
                    user_email: assignment.user_email,
                    assignments: [],
                    totalPagu: 0,
                }
            }
            groups[key].assignments.push(assignment)
            groups[key].totalPagu += assignment.pekerjaan_pagu || 0
        })

        return Object.values(groups).sort((a, b) => a.user_name.localeCompare(b.user_name))
    }, [assignments, assignmentSearch])

    const totalPages = Math.max(1, Math.ceil(groupedAssignments.length / ITEMS_PER_PAGE))
    const paginatedGroups = groupedAssignments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [assignmentSearch])

    const handleDelete = () => {
        if (!deleteId) return
        deleteMutation.mutate(deleteId, {
            onSettled: () => setDeleteId(null),
        })
    }

    return (
        <>
            <Card className="border-muted/60 shadow-sm">
                <CardContent className="space-y-5 pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold">Daftar Assignment</h3>
                            <p className="text-sm text-muted-foreground">
                                Pekerjaan yang sudah ditugaskan ke pengawas lapangan
                            </p>
                        </div>
                        <SearchInput
                            defaultValue={assignmentSearch}
                            onSearch={setAssignmentSearch}
                            placeholder="Cari pengawas atau pekerjaan..."
                            className="w-full sm:w-72"
                            delay={300}
                        />
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-36 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : groupedAssignments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/10 px-6 py-12 text-center">
                            <Briefcase className="h-10 w-10 text-muted-foreground/50" />
                            <p className="font-medium">
                                {assignmentSearch ? 'Tidak ada assignment ditemukan' : 'Belum ada assignment'}
                            </p>
                            <p className="max-w-md text-sm text-muted-foreground">
                                Gunakan form di atas untuk menugaskan pekerjaan pertama ke pengawas lapangan.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paginatedGroups.map((group) => (
                                <div
                                    key={group.user_id}
                                    className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-4 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                className="h-11 w-11"
                                                name={group.user_name}
                                                email={group.user_email}
                                                id={group.user_id}
                                            />
                                            <div>
                                                <p className="font-semibold">{group.user_name}</p>
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {group.user_email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                            <Badge variant="outline">
                                                {group.assignments.length} pekerjaan
                                            </Badge>
                                            <Badge variant="secondary">{formatCurrency(group.totalPagu)}</Badge>
                                        </div>
                                    </div>

                                    <div className="divide-y">
                                        {group.assignments.map((assignment, index) => (
                                            <div
                                                key={assignment.id}
                                                className="flex items-center justify-between gap-3 px-4 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                        #{index + 1}
                                                    </p>
                                                    <p className="truncate font-medium">{assignment.pekerjaan_nama}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCurrency(assignment.pekerjaan_pagu || 0)}
                                                    </p>
                                                </div>
                                                <ListRowActions onDelete={() => setDeleteId(assignment.id)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                {groupedAssignments.length > 0 ? (
                    <CardFooter className="border-t bg-muted/5">
                        <ListPagination
                            page={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            meta={{
                                from: groupedAssignments.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                to: Math.min(currentPage * ITEMS_PER_PAGE, groupedAssignments.length),
                                total: groupedAssignments.length,
                                label: 'pengawas',
                            }}
                        />
                    </CardFooter>
                ) : null}
            </Card>

            <ConfirmDeleteDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Assignment"
                description="Assignment akan dihapus. Pengawas tidak akan bisa melihat pekerjaan ini di aplikasi pengawasan."
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    )
}