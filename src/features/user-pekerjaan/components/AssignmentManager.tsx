import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, UserPlus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
    getAssignments,
    getAvailableUsers,
    assignPekerjaan,
    deleteAssignment,
    type UserPekerjaanAssignment,
    type AvailableUser,
} from '../api/user-pekerjaan';
import api from '@/lib/api-client';

interface Pekerjaan {
    id: number;
    nama_paket: string;
    pagu: number;
    kecamatan?: { nama: string };
    desa?: { nama: string };
}

const ITEMS_PER_PAGE = 5;

export function AssignmentManager() {
    const queryClient = useQueryClient();
    const { tahunAnggaran } = useAppSettingsValues();
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<number[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Assignment list state
    const [assignmentSearch, setAssignmentSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch assignments
    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['user-pekerjaan-assignments'],
        queryFn: getAssignments,
    });

    // Fetch available users (non-admin)
    const { data: users = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['available-users'],
        queryFn: getAvailableUsers,
    });

    // Fetch pekerjaan - only 10 by default, more via search
    const { data: pekerjaanList = [], isLoading: loadingPekerjaan } = useQuery({
        queryKey: ['pekerjaan-for-assignment', tahunAnggaran, debouncedSearch],
        queryFn: async () => {
            // Fetch only 10 items by default, or search results
            const response = await api.get<{ data: Pekerjaan[] }>('/pekerjaan', {
                params: {
                    per_page: 10,
                    tahun: tahunAnggaran || undefined,
                    search: debouncedSearch || undefined
                }
            });
            return response.data;
        },
    });

    // Assign mutation
    const assignMutation = useMutation({
        mutationFn: assignPekerjaan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-pekerjaan-assignments'] });
            toast.success('Pekerjaan berhasil di-assign');
            setSelectedUser('');
            setSelectedPekerjaan([]);
        },
        onError: () => {
            toast.error('Gagal assign pekerjaan');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-pekerjaan-assignments'] });
            toast.success('Assignment berhasil dihapus');
            setDeleteId(null);
        },
        onError: () => {
            toast.error('Gagal menghapus assignment');
        },
    });

    const handleAssign = () => {
        if (!selectedUser || selectedPekerjaan.length === 0) {
            toast.error('Pilih user dan minimal 1 pekerjaan');
            return;
        }
        assignMutation.mutate({
            user_id: parseInt(selectedUser),
            pekerjaan_ids: selectedPekerjaan,
        });
    };

    const togglePekerjaan = (id: number) => {
        setSelectedPekerjaan(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // No client-side filtering needed - server handles search
    const filteredPekerjaan = pekerjaanList;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Filter assignments by search term
    const filteredAssignments = useMemo(() => {
        if (!assignmentSearch) return assignments;
        const searchLower = assignmentSearch.toLowerCase();
        return assignments.filter((a: UserPekerjaanAssignment) =>
            a.user_name.toLowerCase().includes(searchLower) ||
            a.pekerjaan_nama.toLowerCase().includes(searchLower)
        );
    }, [assignments, assignmentSearch]);

    // Group assignments by user
    const groupedAssignments = useMemo(() => {
        const groups: Record<string, {
            user_id: number;
            user_name: string;
            user_email: string;
            assignments: UserPekerjaanAssignment[];
            totalPagu: number;
        }> = {};

        filteredAssignments.forEach((assignment: UserPekerjaanAssignment) => {
            const key = assignment.user_id.toString();
            if (!groups[key]) {
                groups[key] = {
                    user_id: assignment.user_id,
                    user_name: assignment.user_name,
                    user_email: assignment.user_email,
                    assignments: [],
                    totalPagu: 0,
                };
            }
            groups[key].assignments.push(assignment);
            groups[key].totalPagu += assignment.pekerjaan_pagu || 0;
        });

        return Object.values(groups);
    }, [filteredAssignments]);

    // Pagination
    const totalPages = Math.ceil(groupedAssignments.length / ITEMS_PER_PAGE);
    const paginatedGroups = groupedAssignments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [assignmentSearch]);

    return (
        <div className="space-y-6">
            {/* Form Assign */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Assign Pekerjaan ke Pengawas
                    </CardTitle>
                    <CardDescription>
                        Pilih pengawas lapangan dan pekerjaan yang akan di-assign
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Pilih Pengawas Lapangan</Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingUsers ? (
                                        <div className="p-2">Loading...</div>
                                    ) : (
                                        users.map((user: AvailableUser) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Cari Pekerjaan</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama paket, kecamatan, desa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pekerjaan List */}
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {loadingPekerjaan ? (
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : filteredPekerjaan.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                Tidak ada pekerjaan ditemukan
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredPekerjaan.map((pekerjaan: Pekerjaan) => (
                                    <label
                                        key={pekerjaan.id}
                                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedPekerjaan.includes(pekerjaan.id)}
                                            onCheckedChange={() => togglePekerjaan(pekerjaan.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{pekerjaan.nama_paket}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {pekerjaan.kecamatan?.nama} - {pekerjaan.desa?.nama} • {formatCurrency(pekerjaan.pagu || 0)}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedPekerjaan.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {selectedPekerjaan.length} pekerjaan dipilih
                        </p>
                    )}

                    <Button
                        onClick={handleAssign}
                        disabled={!selectedUser || selectedPekerjaan.length === 0 || assignMutation.isPending}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {assignMutation.isPending ? 'Menyimpan...' : 'Assign Pekerjaan'}
                    </Button>
                </CardContent>
            </Card>

            {/* Table Assignments - Grouped by User */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Daftar Assignment</CardTitle>
                            <CardDescription>
                                Pekerjaan yang sudah di-assign ke pengawas lapangan
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari user atau pekerjaan..."
                                value={assignmentSearch}
                                onChange={(e) => setAssignmentSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingAssignments ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : groupedAssignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {assignmentSearch ? 'Tidak ada assignment ditemukan' : 'Belum ada assignment'}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {paginatedGroups.map((group) => (
                                    <div key={group.user_id} className="border rounded-lg overflow-hidden">
                                        {/* User Header */}
                                        <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{group.user_name}</p>
                                                <p className="text-sm text-muted-foreground">{group.user_email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">{group.assignments.length} pekerjaan</p>
                                                <p className="font-medium text-sm">{formatCurrency(group.totalPagu)}</p>
                                            </div>
                                        </div>
                                        {/* Pekerjaan Table */}
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">No</TableHead>
                                                    <TableHead>Pekerjaan</TableHead>
                                                    <TableHead className="w-[80px]">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.assignments.map((assignment, idx) => (
                                                    <TableRow key={assignment.id}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{assignment.pekerjaan_nama}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeleteId(assignment.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Halaman {currentPage} dari {totalPages} ({groupedAssignments.length} user)
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Assignment akan dihapus. Pengawas tidak akan bisa melihat pekerjaan ini lagi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
