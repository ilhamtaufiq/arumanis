export type CmsPanduanPage = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  section: string;
  sort_order: number;
  body: string;
  is_published: boolean;
  updated_at?: string | null;
};

function apiBase(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/bff/api`;
  }
  // Prerender / SSR fallback (production public host)
  return 'https://arumanis.cianjur.space/bff/api';
}

export async function fetchCmsPanduanSummary(): Promise<
  Array<Pick<CmsPanduanPage, 'id' | 'slug' | 'title' | 'description' | 'section' | 'sort_order'>>
> {
  try {
    const res = await fetch(`${apiBase()}/panduan?summary=1`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: CmsPanduanPage[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCmsPanduanBySlug(slug: string): Promise<CmsPanduanPage | null> {
  try {
    const res = await fetch(`${apiBase()}/panduan/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: CmsPanduanPage } | CmsPanduanPage;
    if (json && typeof json === 'object' && 'data' in json && json.data) {
      return json.data;
    }
    return json as CmsPanduanPage;
  } catch {
    return null;
  }
}
