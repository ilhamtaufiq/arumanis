import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, UserPlus, Search } from 'lucide-react';
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

export function AssignmentManager() {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedPekerjaan, setSelectedPekerjaan] = useState<number[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const { data: pekerjaanList = [], isLoading: loadingPekerjaan } = useQuery({
        queryKey: ['all-pekerjaan-for-assignment'],
        queryFn: async () => {
            // Use per_page=-1 to get ALL pekerjaan for assignment (not paginated)
            const response = await api.get<{ data: Pekerjaan[] }>('/pekerjaan', {
                params: { per_page: -1 }
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

    const filteredPekerjaan = pekerjaanList.filter((p: Pekerjaan) =>
        p.nama_paket?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kecamatan?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desa?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

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

            {/* Table Assignments */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Assignment</CardTitle>
                    <CardDescription>
                        Pekerjaan yang sudah di-assign ke pengawas lapangan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingAssignments ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada assignment
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pengawas</TableHead>
                                    <TableHead>Pekerjaan</TableHead>
                                    <TableHead className="text-right">Pagu</TableHead>
                                    <TableHead className="w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map((assignment: UserPekerjaanAssignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{assignment.user_name}</p>
                                                <p className="text-sm text-muted-foreground">{assignment.user_email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{assignment.pekerjaan_nama}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(assignment.pekerjaan_pagu || 0)}
                                        </TableCell>
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
