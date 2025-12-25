import api from '@/lib/api-client';

export interface UserPekerjaanAssignment {
    id: number;
    user_id: number;
    pekerjaan_id: number;
    user_name: string;
    user_email: string;
    pekerjaan_nama: string;
    pekerjaan_pagu: number;
    created_at: string;
}

export interface AvailableUser {
    id: number;
    name: string;
    email: string;
}

export interface AssignmentRequest {
    user_id: number;
    pekerjaan_ids: number[];
}

// Get all assignments
export async function getAssignments(): Promise<UserPekerjaanAssignment[]> {
    const response = await api.get<{ status: string; data: UserPekerjaanAssignment[] }>('/user-pekerjaan');
    return response.data;
}

// Assign pekerjaan to user
export async function assignPekerjaan(data: AssignmentRequest): Promise<void> {
    await api.post('/user-pekerjaan', data);
}

// Delete assignment
export async function deleteAssignment(id: number): Promise<void> {
    await api.delete(`/user-pekerjaan/${id}`);
}

// Get available users (non-admin)
export async function getAvailableUsers(): Promise<AvailableUser[]> {
    const response = await api.get<{ status: string; data: AvailableUser[] }>('/user-pekerjaan/available-users');
    return response.data;
}

export async function getAssignmentsByUser(userId: number) {
    const response = await api.get<{ data: unknown }>(`/user-pekerjaan/user/${userId}`);
    return response.data;
}

export async function getAssignmentsByPekerjaan(pekerjaanId: number) {
    const response = await api.get<{ data: unknown }>(`/user-pekerjaan/pekerjaan/${pekerjaanId}`);
    return response.data;
}
