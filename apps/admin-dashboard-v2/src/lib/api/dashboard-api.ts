export interface SubKegiatanItem {
  name: string;
  count: number;
  /** Juta rupiah. */
  paguM: number;
  progress: number;
  /** false = paket ada tapi belum ada realisasi; progress 0 bukan berarti 0%. */
  hasProgress: boolean;
  /** Total SP2D realisasi keuangan (rupiah). */
  sp2dTotal: number;
  /** Paket dibatalkan. */
  batal: number;
  /** Paket aktif belum punya kontrak. */
  belumBerkontrak: number;
}

export interface KegiatanStats {
  totalKegiatan: number;
  totalPagu: number;
  kegiatanPerTahun: Array<{ name: string; value: number }>;
  kegiatanPerSumberDana: Array<{ name: string; value: number }>;
  subKegiatanStats?: SubKegiatanItem[];
  paguPerTahun: Array<{ name: string; value: number }>;
  availableYears: number[];
  totalPekerjaan: number;
  totalPaguPekerjaan: number;
  pekerjaanAktif: number;
  pekerjaanBatal: number;
  pekerjaanBerkontrak: number;
  pekerjaanBelumBerkontrak: number;
  pekerjaanFisik: number;
  pekerjaanKonsultan: number;
  pekerjaanFisikBerkontrak: number;
  pekerjaanFisikBelumBerkontrak: number;
  totalPaguPekerjaanFisik: number;
  totalPaguPekerjaanKonsultan: number;
  pekerjaanPerKecamatan: Array<{ name: string; value: number }>;
  /** paguJt = pagu asli per desa dalam juta rupiah. */
  pekerjaanPerDesa: Array<{ name: string; value: number; paguJt: number }>;
  paguPekerjaanPerKecamatan: Array<{ name: string; value: number }>;
  totalKontrak: number;
  totalNilaiKontrak: number;
  kontrakPerPenyedia: Array<{ name: string; value: number }>;
  nilaiKontrakPerPenyedia: Array<{ name: string; value: number }>;
  totalOutput: number;
  outputPerSatuan: Array<{ name: string; value: number }>;
  outputPerKomponen: Array<{ name: string; value: number }>;
  totalPenerima: number;
  totalJiwa: number;
  penerimaKomunalVsIndividu: Array<{ name: string; value: number }>;
}

export interface TrendPoint {
  week: string;
  rencana: number;
  realisasi: number;
}

export interface RegionData {
  name: string;
  value: number;
  /** false = kecamatan punya paket tapi belum ada realisasi. */
  hasProgress?: boolean;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface AnalyticsStats {
  trend: TrendPoint[];
  regions: RegionData[];
  categories: CategoryData[];
}

export interface MonthlyProgressTrend {
  month: string;
  fisik_avg: number;
  rencana_avg: number;
  keuangan_sum: number;
}

export interface ExecutiveProgressData {
  monthly_trend: MonthlyProgressTrend[];
  totals: {
    keuangan_total: number;
  };
}

export interface KecamatanItem {
  id: number;
  n_kec: string;
}

// Hanya lewat BFF. Jangan tambahkan origin apiamis.test langsung — kena CORS
// dan melewati proxy yang menyuntikkan Authorization dari cookie sesi.
const API_CANDIDATES = ["/bff/api"];

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const cookieMatch = document.cookie.match(/auth_user_data=([^;]+)/);
    if (cookieMatch?.[1]) {
      const parsed = JSON.parse(decodeURIComponent(cookieMatch[1]));
      if (parsed?.token) return parsed.token;
    }
    const tokenMatch = document.cookie.match(/arumanis_session=([^;]+)/);
    if (tokenMatch?.[1]) return tokenMatch[1];
    return localStorage.getItem("auth_token") || localStorage.getItem("token") || null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchFromApi(endpoint: string, params?: Record<string, string | undefined>): Promise<unknown> {
  if (typeof window === "undefined") return null;

  const query = params
    ? "?" +
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
        .join("&")
    : "";

  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let lastError: ApiError | null = null;

  for (const baseUrl of API_CANDIDATES) {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${endpoint}${query}`, { headers, credentials: "include" });
    } catch (err) {
      lastError = new ApiError(err instanceof Error ? err.message : "Gagal menghubungi server");
      continue;
    }

    if (!res.ok) {
      // Jangan telan status: 401 ≠ data kosong.
      lastError = new ApiError(
        res.status === 401 || res.status === 403 ? "Sesi berakhir, silakan login ulang" : `Server error ${res.status}`,
        res.status,
      );
      continue;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      lastError = new ApiError("Respons server bukan JSON");
      continue;
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  throw lastError ?? new ApiError("Tidak ada endpoint API yang tersedia");
}

export async function getDashboardStats(tahun?: string, kecamatanIds?: string[]): Promise<KegiatanStats | null> {
  const params: Record<string, string | undefined> = { tahun };
  if (kecamatanIds && kecamatanIds.length > 0) {
    params.kecamatan_ids = kecamatanIds.join(",");
  }
  try {
    return (await fetchFromApi("/dashboard/stats", params)) as KegiatanStats | null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 500) {
      console.warn("[Dashboard API] 500 Server error on /dashboard/stats", err);
      return null;
    }
    throw err;
  }
}

export async function getAnalyticsStats(tahun?: string, kecamatanIds?: string[]): Promise<AnalyticsStats | null> {
  const params: Record<string, string | undefined> = { tahun };
  if (kecamatanIds && kecamatanIds.length > 0) {
    params.kecamatan_ids = kecamatanIds.join(",");
  }
  try {
    return (await fetchFromApi("/dashboard/analytics", params)) as AnalyticsStats | null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 500) {
      console.warn("[Dashboard API] 500 Server error on /dashboard/analytics", err);
      return null;
    }
    throw err;
  }
}

export async function getExecutiveProgress(
  tahun?: string,
  kecamatanIds?: string[],
): Promise<ExecutiveProgressData | null> {
  const params: Record<string, string | undefined> = { tahun };
  if (kecamatanIds && kecamatanIds.length > 0) {
    params.kecamatan_ids = kecamatanIds.join(",");
  }
  try {
    return (await fetchFromApi("/dashboard/executive-progress", params)) as ExecutiveProgressData | null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 500) {
      console.warn("[Dashboard API] 500 Server error on /dashboard/executive-progress", err);
      return null;
    }
    throw err;
  }
}

export async function getKecamatanList(): Promise<KecamatanItem[]> {
  const data = (await fetchFromApi("/kecamatan")) as KecamatanItem[] | null;
  return Array.isArray(data) ? data : [];
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role?: string;
  n_kec?: string;
  n_desa?: string;
}

export async function getUserList(): Promise<UserItem[]> {
  try {
    const res = (await fetchFromApi("/users")) as any;
    const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return items;
  } catch {
    return [];
  }
}

export interface LiveChatMessage {
  id: number;
  thread_id: number;
  user_id: number;
  user?: { id: number; name?: string; email?: string };
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface LiveChatThread {
  id: number;
  user_id: number;
  user?: { id: number; name?: string; email?: string };
  status: "open" | "closed";
  last_message_at: string | null;
  latest_message?: LiveChatMessage | null;
  unread_count?: number;
  created_at: string;
}

export async function getLiveChatInbox(): Promise<LiveChatThread[]> {
  try {
    const res = (await fetchFromApi("/live-chat/inbox")) as any;
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function getLiveChatMessages(threadId: number): Promise<LiveChatMessage[]> {
  try {
    const res = (await fetchFromApi(`/live-chat/threads/${threadId}/messages`)) as any;
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

async function postJson(endpoint: string, body: unknown, method = "POST"): Promise<unknown> {
  if (typeof window === "undefined") return null;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_CANDIDATES[0]}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(`Server error ${res.status}`, res.status);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function sendLiveChatMessage(threadId: number, message: string): Promise<LiveChatMessage | null> {
  try {
    return (await postJson(`/live-chat/threads/${threadId}/messages`, { message })) as LiveChatMessage;
  } catch (err) {
    console.warn("[Dashboard API] Gagal kirim pesan live chat", err);
    return null;
  }
}

export async function closeLiveChatThread(threadId: number): Promise<boolean> {
  try {
    await postJson(`/live-chat/threads/${threadId}/close`, {}, "PATCH");
    return true;
  } catch (err) {
    console.warn("[Dashboard API] Gagal menutup thread live chat", err);
    return false;
  }
}

export interface BerkasItem {
  id: number;
  pekerjaan_id: number;
  jenis_dokumen: string;
  file_name?: string | null;
  original_name?: string | null;
  berkas_url: string;
  pekerjaan?: {
    id: number;
    nama_paket: string;
    tahun_anggaran?: string;
    desa?: { n_desa?: string };
    kecamatan?: { n_kec?: string };
  };
  created_at: string;
}

export async function getBerkasData(params?: { search?: string; tahun?: string; pekerjaan_id?: number }): Promise<BerkasItem[]> {
  try {
    const res = (await fetchFromApi("/berkas", params)) as any;
    const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return items;
  } catch (err) {
    console.warn("[Dashboard API] Error fetching /berkas", err);
    return [];
  }
}

export async function getBerkasJenisDokumenList(): Promise<string[]> {
  try {
    const res = (await fetchFromApi("/berkas/jenis-dokumen")) as any;
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch {
    return ["KONTRAK", "SP2D", "LAPORAN", "FOTO", "BAST"];
  }
}

export interface IncompletePekerjaanItem {
  id: number;
  nama_paket: string;
  n_desa?: string;
  progress: number;
  status: "On Track" | "Watch" | "Lagging";
  dueText: string;
}

export async function getTopIncompletePekerjaan(tahun?: string): Promise<IncompletePekerjaanItem[]> {
  const params: Record<string, string | undefined> = {
    tahun,
    status: "active",
    per_page: "50",
  };

  try {
    const rawRes = await fetchFromApi("/pekerjaan", params);
    let items: any[] = [];

    if (Array.isArray(rawRes)) {
      items = rawRes;
    } else if (rawRes && typeof rawRes === "object" && "data" in rawRes && Array.isArray((rawRes as any).data)) {
      items = (rawRes as any).data;
    }

    // Filter paket aktif yang progres fisiknya < 100%
    const incomplete = items.filter((i: any) => {
      const prog = typeof i.progress_estimasi_fisik === "number"
        ? i.progress_estimasi_fisik
        : typeof i.progress_fisik === "number"
        ? i.progress_fisik
        : 0;
      return prog < 100;
    });

    // Urutkan berdasarkan progres terbesar (misal 90%, 80%, 65%) yang belum 100%
    incomplete.sort((a: any, b: any) => {
      const progA = a.progress_estimasi_fisik ?? a.progress_fisik ?? 0;
      const progB = b.progress_estimasi_fisik ?? b.progress_fisik ?? 0;
      return progB - progA;
    });

    if (incomplete.length > 0) {
      return incomplete.slice(0, 3).map((item: any) => {
        const prog = typeof item.progress_estimasi_fisik === "number"
          ? item.progress_estimasi_fisik
          : typeof item.progress_fisik === "number"
          ? item.progress_fisik
          : 0;

        const status: "On Track" | "Watch" | "Lagging" =
          prog >= 70 ? "On Track" : prog >= 50 ? "Watch" : "Lagging";

        const desaName = item.desa?.n_desa || item.n_desa || item.kecamatan?.n_kec || "Kab. Cianjur";

        return {
          id: item.id,
          nama_paket: item.nama_paket || "Paket Pekerjaan",
          n_desa: `Desa ${desaName}`,
          progress: Math.round(prog),
          status,
          dueText: item.tahun_anggaran ? `TA ${item.tahun_anggaran}` : "Aktif",
        };
      });
    }
  } catch (err) {
    console.warn("[Dashboard API] Could not fetch /pekerjaan items", err);
  }

  // Fallback ke subKegiatan jika /pekerjaan tidak mengembalikan item
  try {
    const stats = await getDashboardStats(tahun);
    const subList = stats?.subKegiatanStats ?? [];

    const incompleteSub = subList
      .filter((s) => s.count > 0 && s.progress < 100)
      .sort((a, b) => b.progress - a.progress);

    if (incompleteSub.length > 0) {
      return incompleteSub.slice(0, 3).map((item, idx) => {
        const status: "On Track" | "Watch" | "Lagging" =
          !item.hasProgress ? "Watch" : item.progress >= 70 ? "On Track" : item.progress >= 50 ? "Watch" : "Lagging";

        return {
          id: idx + 1000,
          nama_paket: item.name,
          n_desa: `${item.count} Paket (Belum 100%)`,
          progress: item.hasProgress ? Math.round(item.progress) : 0,
          status,
          dueText: "Aktif (<100%)",
        };
      });
    }
  } catch (err) {
    console.warn("[Dashboard API] Fallback on getTopIncompletePekerjaan", err);
  }

  return [];
}

export interface SpmCoverageStats {
  spamCoverage: number | null;
  spamPenambahanInfo: string | null;
  sanitasiCoverage: number | null;
  sanitasiPenambahanInfo: string | null;
}

export async function getSpmCoverageStats(tahun?: string): Promise<SpmCoverageStats> {
  const params: Record<string, string | undefined> = { tahun };
  try {
    const [spamRes, sanitasiRes, sanitasiAllRes, spamAllRes] = await Promise.all([
      fetchFromApi("/spam-units/stats", params).catch(() => null),
      fetchFromApi("/spm-sanitasi/stats", params).catch(() => null),
      fetchFromApi("/spm-sanitasi/stats").catch(() => null),
      fetchFromApi("/spam-units/stats").catch(() => null),
    ]);

    const spamData = spamRes as {
      coverage_percentage?: number;
      total_bjp_kk?: number;
      total_kk?: number;
      total_bjp_jiwa?: number;
      total_jiwa?: number;
    } | null;
    const spamAllData = spamAllRes as { coverage_percentage?: number } | null;

    const sanitasiData = sanitasiRes as {
      coverage_percentage?: number;
      coverage_kk_percentage?: number;
      total_pemanfaat_kk?: number;
      total_pemanfaat_jiwa?: number;
    } | null;
    const sanitasiAllData = sanitasiAllRes as {
      coverage_percentage?: number;
      coverage_kk_percentage?: number;
    } | null;

    // Coverage percentage: jika data filter tahunan 0/null, pakai akumulasi all-time agar capaian kumulatif tetap tampil
    const spamCoverage =
      typeof spamData?.coverage_percentage === "number" && spamData.coverage_percentage > 0
        ? spamData.coverage_percentage
        : typeof spamAllData?.coverage_percentage === "number"
        ? spamAllData.coverage_percentage
        : null;

    const sanitasiCoverage =
      typeof sanitasiData?.coverage_percentage === "number" && sanitasiData.coverage_percentage > 0
        ? sanitasiData.coverage_percentage
        : typeof sanitasiAllData?.coverage_percentage === "number"
        ? sanitasiAllData.coverage_percentage
        : typeof sanitasiData?.coverage_kk_percentage === "number" && sanitasiData.coverage_kk_percentage > 0
        ? sanitasiData.coverage_kk_percentage
        : typeof sanitasiAllData?.coverage_kk_percentage === "number"
        ? sanitasiAllData.coverage_kk_percentage
        : null;

    // Info Penambahan pada Tahun Anggaran berjalan
    const spamAddKk = spamData?.total_bjp_kk || spamData?.total_kk || 0;
    const spamAddJiwa = spamData?.total_bjp_jiwa || spamData?.total_jiwa || 0;
    const spamPenambahanInfo =
      spamAddKk > 0
        ? `+${spamAddKk.toLocaleString("id-ID")} KK (${spamAddJiwa.toLocaleString("id-ID")} Jiwa)`
        : spamAddJiwa > 0
        ? `+${spamAddJiwa.toLocaleString("id-ID")} Jiwa`
        : "Belum ada penambahan";

    const sanitasiAddKk = sanitasiData?.total_pemanfaat_kk || 0;
    const sanitasiAddJiwa = sanitasiData?.total_pemanfaat_jiwa || 0;
    const sanitasiPenambahanInfo =
      sanitasiAddKk > 0
        ? `+${sanitasiAddKk.toLocaleString("id-ID")} KK (${sanitasiAddJiwa.toLocaleString("id-ID")} Jiwa)`
        : sanitasiAddJiwa > 0
        ? `+${sanitasiAddJiwa.toLocaleString("id-ID")} Jiwa`
        : "Belum ada penambahan";

    return {
      spamCoverage,
      spamPenambahanInfo,
      sanitasiCoverage,
      sanitasiPenambahanInfo,
    };
  } catch {
    return {
      spamCoverage: null,
      spamPenambahanInfo: null,
      sanitasiCoverage: null,
      sanitasiPenambahanInfo: null,
    };
  }
}
