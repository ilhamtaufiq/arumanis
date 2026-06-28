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
export async function getAvailableUsers(search?: string): Promise<AvailableUser[]> {
    const response = await api.get<{ status: string; data: AvailableUser[] }>('/user-pekerjaan/available-users', {
        params: { search: search || undefined },
    });
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

export type CompletenessGapType = 'foto' | 'penerima' | 'progress';

export type CompletenessPekerjaanGap = {
    pekerjaan_id: number;
    nama_paket: string;
    gaps: CompletenessGapType[];
    gap_details: Partial<Record<CompletenessGapType, string>>;
};

export type CompletenessUserGap = {
    user_id: number;
    user_name: string;
    user_email: string;
    pekerjaan: CompletenessPekerjaanGap[];
    gap_counts: Record<CompletenessGapType, number>;
};

export type CompletenessGapsResult = {
    users: CompletenessUserGap[];
    summary: {
        total_users: number;
        total_pekerjaan_with_gaps: number;
        by_gap: Record<CompletenessGapType, number>;
    };
};

export type CompletenessGapsParams = {
    gaps?: CompletenessGapType[];
    tahun?: string;
};

export type BroadcastReminderRequest = CompletenessGapsParams & {
    user_ids?: number[];
    title?: string;
    message_prefix?: string;
    notification_type?: 'info' | 'success' | 'warning' | 'error';
};

export async function getCompletenessGaps(
    params?: CompletenessGapsParams,
): Promise<CompletenessGapsResult> {
    const searchParams = new URLSearchParams();
    if (params?.tahun) {
        searchParams.append('tahun', params.tahun);
    }
    params?.gaps?.forEach((gap) => searchParams.append('gaps[]', gap));

    const query = searchParams.toString();
    const endpoint = query
        ? `/user-pekerjaan/completeness-gaps?${query}`
        : '/user-pekerjaan/completeness-gaps';

    const response = await api.get<{ status: string; data: CompletenessGapsResult }>(endpoint);
    return response.data;
}

export async function broadcastCompletenessReminders(
    data: BroadcastReminderRequest,
): Promise<{ recipient_count: number }> {
    const response = await api.post<{
        status: string;
        message: string;
        recipient_count: number;
    }>('/user-pekerjaan/broadcast-reminders', data);
    return { recipient_count: response.recipient_count };
}
