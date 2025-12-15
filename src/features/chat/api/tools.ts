import api from '@/lib/api-client';
import type { ToolDefinition } from '../types';

// Tool definitions for OpenRouter function calling
export const chatTools: ToolDefinition[] = [
    {
        type: 'function',
        function: {
            name: 'get_dashboard_stats',
            description: 'Mendapatkan statistik dashboard lengkap: total pekerjaan, kontrak, output, penerima, serta data per kecamatan dan desa. Gunakan untuk pertanyaan umum tentang statistik.',
            parameters: {
                type: 'object',
                properties: {
                    tahun: {
                        type: 'string',
                        description: 'Tahun anggaran untuk filter (opsional, contoh: "2024")'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_kecamatan_list',
            description: 'Mendapatkan daftar semua kecamatan beserta jumlah desa. Gunakan untuk pertanyaan tentang daftar kecamatan.',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_pekerjaan',
            description: 'Mencari pekerjaan berdasarkan kata kunci nama paket atau kode rekening. Gunakan untuk mencari pekerjaan spesifik.',
            parameters: {
                type: 'object',
                properties: {
                    search: {
                        type: 'string',
                        description: 'Kata kunci pencarian (nama paket atau kode rekening)'
                    },
                    tahun: {
                        type: 'string',
                        description: 'Filter tahun anggaran (opsional)'
                    }
                },
                required: ['search']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_kontrak',
            description: 'Mencari kontrak/SPK berdasarkan nama pekerjaan. Mengembalikan nomor SPK, tanggal SPK, nilai kontrak, dan nama penyedia.',
            parameters: {
                type: 'object',
                properties: {
                    search: {
                        type: 'string',
                        description: 'Kata kunci pencarian (nama pekerjaan)'
                    }
                },
                required: ['search']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_pekerjaan_by_kecamatan',
            description: 'Mendapatkan daftar pekerjaan di kecamatan tertentu berdasarkan nama kecamatan.',
            parameters: {
                type: 'object',
                properties: {
                    kecamatan_name: {
                        type: 'string',
                        description: 'Nama kecamatan (contoh: "Cugenang", "Cianjur")'
                    }
                },
                required: ['kecamatan_name']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_foto',
            description: 'Mencari foto dokumentasi berdasarkan kata kunci atau nama pekerjaan. Mengembalikan daftar foto dengan keterangan progress (0%, 25%, 50%, 75%, 100%), lokasi koordinat, dan link foto.',
            parameters: {
                type: 'object',
                properties: {
                    search: {
                        type: 'string',
                        description: 'Kata kunci pencarian (nama pekerjaan atau keterangan)'
                    },
                    tahun: {
                        type: 'string',
                        description: 'Filter tahun anggaran (opsional)'
                    }
                },
                required: ['search']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_foto_by_pekerjaan',
            description: 'Mendapatkan semua foto dokumentasi untuk pekerjaan tertentu berdasarkan ID pekerjaan.',
            parameters: {
                type: 'object',
                properties: {
                    pekerjaan_id: {
                        type: 'number',
                        description: 'ID pekerjaan untuk mencari fotonya'
                    }
                },
                required: ['pekerjaan_id']
            }
        }
    }
];

// API Response types
interface DashboardStats {
    totalPekerjaan: number;
    totalKontrak: number;
    totalOutput: number;
    totalPenerima: number;
    totalJiwa: number;
    totalPagu: number;
    totalNilaiKontrak: number;
    pekerjaanPerKecamatan: Array<{ name: string; value: number }>;
    pekerjaanPerDesa: Array<{ name: string; value: number }>;
}

interface Kecamatan {
    id: number;
    nama_kecamatan: string;
    jumlah_desa: number;
}

interface Pekerjaan {
    id: number;
    nama_paket: string;
    pagu: number;
    kecamatan?: { nama_kecamatan: string };
    desa?: { nama_desa: string };
}

interface Kontrak {
    id: number;
    spk: string | null;
    tgl_spk: string | null;
    spmk: string | null;
    tgl_spmk: string | null;
    nilai_kontrak: number | null;
    pekerjaan?: { nama_paket: string };
    penyedia?: { nama: string };
}

interface Foto {
    id: number;
    pekerjaan_id: number;
    komponen_id: number;
    penerima_id?: number;
    keterangan: string;
    koordinat: string;
    validasi_koordinat: boolean;
    foto_url: string;
    pekerjaan?: { nama_paket: string };
    komponen?: { komponen: string };
    penerima?: { nama: string };
    created_at: string;
}

// Tool execution functions
export async function executeTool(toolName: string, args: Record<string, unknown>): Promise<string> {
    try {
        switch (toolName) {
            case 'get_dashboard_stats':
                return await getDashboardStats(args.tahun as string | undefined);
            case 'get_kecamatan_list':
                return await getKecamatanList();
            case 'search_pekerjaan':
                return await searchPekerjaan(args.search as string, args.tahun as string | undefined);
            case 'search_kontrak':
                return await searchKontrak(args.search as string);
            case 'get_pekerjaan_by_kecamatan':
                return await getPekerjaanByKecamatan(args.kecamatan_name as string);
            case 'search_foto':
                return await searchFoto(args.search as string, args.tahun as string | undefined);
            case 'get_foto_by_pekerjaan':
                return await getFotoByPekerjaan(args.pekerjaan_id as number);
            default:
                return JSON.stringify({ error: `Unknown tool: ${toolName}` });
        }
    } catch (error) {
        console.error(`Tool execution error (${toolName}):`, error);
        return JSON.stringify({ error: `Gagal mengeksekusi ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
}

async function getDashboardStats(tahun?: string): Promise<string> {
    const params = tahun ? { tahun } : undefined;
    const response = await api.get<{ data: DashboardStats }>('/dashboard/stats', { params });
    const stats = response.data;

    return JSON.stringify({
        totalPekerjaan: stats.totalPekerjaan,
        totalKontrak: stats.totalKontrak,
        totalOutput: stats.totalOutput,
        totalPenerima: stats.totalPenerima,
        totalJiwa: stats.totalJiwa,
        totalPagu: stats.totalPagu,
        totalNilaiKontrak: stats.totalNilaiKontrak,
        pekerjaanPerKecamatan: stats.pekerjaanPerKecamatan,
        pekerjaanPerDesa: stats.pekerjaanPerDesa?.slice(0, 5) // Top 5
    });
}

async function getKecamatanList(): Promise<string> {
    const response = await api.get<{ data: Kecamatan[] }>('/kecamatan');
    return JSON.stringify({
        total: response.data.length,
        kecamatan: response.data.map(k => ({
            id: k.id,
            nama: k.nama_kecamatan,
            jumlah_desa: k.jumlah_desa
        }))
    });
}

async function searchPekerjaan(search: string, tahun?: string): Promise<string> {
    const params: Record<string, string | number> = { search, per_page: 10 };
    if (tahun) params.tahun = tahun;

    const response = await api.get<{ data: Pekerjaan[]; meta: { total: number } }>('/pekerjaan', { params });

    return JSON.stringify({
        total: response.meta?.total || response.data.length,
        results: response.data.map(p => ({
            id: p.id,
            nama_paket: p.nama_paket,
            pagu: p.pagu,
            kecamatan: p.kecamatan?.nama_kecamatan,
            desa: p.desa?.nama_desa
        }))
    });
}

async function searchKontrak(search: string): Promise<string> {
    const response = await api.get<{ data: Kontrak[] }>('/kontrak', {
        params: { search, per_page: 10 }
    });

    return JSON.stringify({
        total: response.data.length,
        results: response.data.map(k => ({
            id: k.id,
            nomor_spk: k.spk,
            tanggal_spk: k.tgl_spk,
            nomor_spmk: k.spmk,
            tanggal_spmk: k.tgl_spmk,
            nilai_kontrak: k.nilai_kontrak,
            nama_pekerjaan: k.pekerjaan?.nama_paket,
            nama_penyedia: k.penyedia?.nama
        }))
    });
}

async function getPekerjaanByKecamatan(kecamatanName: string): Promise<string> {
    // First get kecamatan list to find ID by name
    const kecResponse = await api.get<{ data: Kecamatan[] }>('/kecamatan');
    const kecamatan = kecResponse.data.find(
        k => k.nama_kecamatan.toLowerCase().includes(kecamatanName.toLowerCase())
    );

    if (!kecamatan) {
        return JSON.stringify({
            error: `Kecamatan "${kecamatanName}" tidak ditemukan`,
            available: kecResponse.data.map(k => k.nama_kecamatan)
        });
    }

    const response = await api.get<{ data: Pekerjaan[]; meta: { total: number } }>(
        `/pekerjaan/kecamatan/${kecamatan.id}`
    );

    return JSON.stringify({
        kecamatan: kecamatan.nama_kecamatan,
        total: response.meta?.total || response.data.length,
        pekerjaan: response.data.map(p => ({
            id: p.id,
            nama_paket: p.nama_paket,
            pagu: p.pagu,
            desa: p.desa?.nama_desa
        }))
    });
}

async function searchFoto(search: string, tahun?: string): Promise<string> {
    const params: Record<string, string | number> = { search, per_page: 10 };
    if (tahun) params.tahun = tahun;

    const response = await api.get<{ data: Foto[]; meta?: { total: number } }>('/foto', { params });

    return JSON.stringify({
        total: response.meta?.total || response.data.length,
        results: response.data.map(f => ({
            id: f.id,
            nama_pekerjaan: f.pekerjaan?.nama_paket,
            komponen: f.komponen?.komponen,
            keterangan_progress: f.keterangan,
            koordinat: f.koordinat,
            validasi_koordinat: f.validasi_koordinat,
            foto_url: f.foto_url,
            penerima: f.penerima?.nama,
            tanggal_upload: f.created_at
        }))
    });
}

async function getFotoByPekerjaan(pekerjaanId: number): Promise<string> {
    const response = await api.get<{ data: Foto[]; meta?: { total: number } }>('/foto', {
        params: { pekerjaan_id: pekerjaanId, per_page: 50 }
    });

    if (response.data.length === 0) {
        return JSON.stringify({
            error: `Tidak ada foto untuk pekerjaan dengan ID ${pekerjaanId}`,
            total: 0
        });
    }

    return JSON.stringify({
        pekerjaan_id: pekerjaanId,
        nama_pekerjaan: response.data[0]?.pekerjaan?.nama_paket,
        total: response.meta?.total || response.data.length,
        foto: response.data.map(f => ({
            id: f.id,
            komponen: f.komponen?.komponen,
            keterangan_progress: f.keterangan,
            koordinat: f.koordinat,
            validasi_koordinat: f.validasi_koordinat,
            foto_url: f.foto_url,
            penerima: f.penerima?.nama,
            tanggal_upload: f.created_at
        }))
    });
}
