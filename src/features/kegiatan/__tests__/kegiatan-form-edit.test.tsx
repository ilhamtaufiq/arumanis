import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api-client';

const KEGIATAN = {
    id: 7,
    nama_program: 'PROGRAM AIR MINUM',
    sub_bidang: 'Air Minum',
    nama_kegiatan: 'Pengelolaan SPAM',
    nama_sub_kegiatan: 'Perluasan SPAM',
    tahun_anggaran: '2026',
    sumber_dana: 'DAK',
    pagu: 1000,
    kode_rekening: ['1'],
    nama_pptk: null,
    nip_pptk: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

vi.mock('@/lib/api-client', () => ({
    default: { get: vi.fn() },
    ApiError: class extends Error {},
}));

vi.mock('@tanstack/react-router', () => ({
    useParams: () => ({ id: '7' }),
    useNavigate: () => vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock('@/components/layout/page-container', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import KegiatanForm from '../components/KegiatanForm';

function renderForm() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={qc}>
            <KegiatanForm />
        </QueryClientProvider>,
    );
}

describe('KegiatanForm edit — dropdown terisi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('menampilkan Sub Bidang & Sumber Dana terpilih dari data API { data: ... }', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: KEGIATAN });
        renderForm();

        await waitFor(() => {
            expect(screen.getByText('Air Minum')).toBeInTheDocument();
            expect(screen.getByText('DAK')).toBeInTheDocument();
        });
    });

    it('menampilkan Sub Bidang & Sumber Dana ketika data disajikan tanpa wrapper { data: ... }', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce(KEGIATAN as any);
        renderForm();

        await waitFor(() => {
            expect(screen.getByText('Air Minum')).toBeInTheDocument();
            expect(screen.getByText('DAK')).toBeInTheDocument();
        });
    });

    it('menormalisasi sub_bidang & sumber_dana dengan variasi casing, spasi, dan underscore', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({
            data: {
                ...KEGIATAN,
                sub_bidang: 'air_minum',
                sumber_dana: 'dbh_pajak_rokok',
            },
        });
        renderForm();

        await waitFor(() => {
            expect(screen.getByText('Air Minum')).toBeInTheDocument();
            expect(screen.getByText('DBH Pajak Rokok')).toBeInTheDocument();
        });
    });
});
