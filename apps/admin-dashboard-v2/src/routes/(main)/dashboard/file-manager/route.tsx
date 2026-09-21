import { useCallback, useEffect, useMemo, useState } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";

import { FolderPlus, Grid2X2, List, RotateCw, Search, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  type BerkasItem,
  getBerkasData,
  getBerkasJenisDokumenList,
} from "@/lib/api/dashboard-api";

import { type FileManagerFile, type FileManagerFolder, type FileManagerView } from "./-components/data";
import { FileGridView } from "./-components/file-grid-view";
import { FileListView } from "./-components/file-list-view";
import { FoldersSection } from "./-components/folders-section";

export const Route = createFileRoute("/(main)/dashboard/file-manager")({
  validateSearch: (search: Record<string, unknown>): { view: FileManagerView } => ({
    view: search.view === "list" ? "list" : "grid",
  }),
  component: Page,
});

function mapBerkasToFile(b: BerkasItem): FileManagerFile {
  const jenis = (b.jenis_dokumen || "DOKUMEN").toUpperCase();
  let kind: "document" | "spreadsheet" | "design" | "pdf" | "archive" = "document";

  const rawName = b.original_name || b.file_name || "";
  if (jenis.includes("KONTRAK") || rawName.endsWith(".pdf") || b.berkas_url?.endsWith(".pdf")) {
    kind = "pdf";
  } else if (jenis.includes("FOTO") || rawName.match(/\.(jpg|jpeg|png|webp)/i) || b.berkas_url?.match(/\.(jpg|jpeg|png|webp)/i)) {
    kind = "design";
  } else if (jenis.includes("SP2D") || jenis.includes("EXCEL") || rawName.match(/\.(xlsx|xls|csv)/i)) {
    kind = "spreadsheet";
  } else if (jenis.includes("ZIP") || jenis.includes("RAR") || rawName.match(/\.(zip|rar|7z)/i)) {
    kind = "archive";
  }

  // Menampilkan original_name dari upload jika tersedia, fallback ke file_name / jenis_dokumen
  const fileName = b.original_name || b.file_name || `${b.jenis_dokumen || "Berkas"}_${b.id}`;
  const owner = b.pekerjaan?.nama_paket ? (b.pekerjaan.nama_paket.length > 24 ? `${b.pekerjaan.nama_paket.slice(0, 24)}…` : b.pekerjaan.nama_paket) : "Tim Teknis";
  const dateStr = b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Terbaru";

  return {
    id: String(b.id),
    name: fileName,
    kind,
    size: b.jenis_dokumen || "Digital",
    owner,
    ownerInitials: owner.slice(0, 2).toUpperCase(),
    modifiedAt: dateStr,
    shared: true,
    starred: false,
  };
}

function Page() {
  const { view: activeView } = Route.useSearch();
  const [berkasList, setBerkasList] = useState<BerkasItem[]>([]);
  const [jenisList, setJenisList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [items, jenis] = await Promise.all([
        getBerkasData(),
        getBerkasJenisDokumenList(),
      ]);
      setBerkasList(items);
      setJenisList(jenis);
    } catch {
      setBerkasList([]);
      setJenisList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Compute dynamic folder categories from real jenis_dokumen
  const dynamicFolders: FileManagerFolder[] = useMemo(() => {
    if (!berkasList.length && !jenisList.length) {
      return [
        { id: "KONTRAK", name: "Dokumen Kontrak", fileCount: 0, size: "Digital", updatedAt: "Terbaru" },
        { id: "SP2D", name: "Pencairan SP2D", fileCount: 0, size: "Digital", updatedAt: "Terbaru" },
        { id: "LAPORAN", name: "Laporan Progres", fileCount: 0, size: "Digital", updatedAt: "Terbaru" },
        { id: "FOTO", name: "Foto Kegiatan", fileCount: 0, size: "Digital", updatedAt: "Terbaru" },
      ];
    }

    const categoriesMap: Record<string, number> = {};
    berkasList.forEach((b) => {
      const cat = (b.jenis_dokumen || "Lainnya").toUpperCase();
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    return Object.entries(categoriesMap).map(([catName, count]) => ({
      id: catName,
      name: catName,
      fileCount: count,
      size: "Digital",
      updatedAt: "Terupdate",
    }));
  }, [berkasList, jenisList]);

  // Filter files
  const filteredFiles = useMemo(() => {
    let result = berkasList;
    if (selectedFolder) {
      result = result.filter((b) => (b.jenis_dokumen || "").toUpperCase() === selectedFolder.toUpperCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          (b.file_name || "").toLowerCase().includes(q) ||
          (b.jenis_dokumen || "").toLowerCase().includes(q) ||
          (b.pekerjaan?.nama_paket || "").toLowerCase().includes(q),
      );
    }
    return result.map(mapBerkasToFile);
  }, [berkasList, selectedFolder, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight font-semibold">Manajemen Berkas & Dokumen</h1>
          <p className="text-muted-foreground text-sm">Organisasi dokumen kontrak, arsip SP2D, laporan progres, dan foto kegiatan</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading} className="gap-1.5">
            <RotateCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari berkas, jenis dokumen, atau paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {selectedFolder && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
            Tampilkan Semua Kategori (Reset)
          </Button>
        )}
      </div>

      {/* Folders */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <FoldersSection folders={dynamicFolders} />
      )}

      {/* Files Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-lg">
            Semua Berkas ({loading ? "…" : filteredFiles.length})
          </h2>

          <ToggleGroup variant="outline" size="sm" spacing={0} value={[activeView]} aria-label="File view">
            <ToggleGroupItem
              value="grid"
              nativeButton={false}
              render={<Link from={Route.fullPath} search={(previous) => ({ ...previous, view: "grid" })} replace />}
            >
              <Grid2X2 />
              Grid View
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              nativeButton={false}
              render={<Link from={Route.fullPath} search={(previous) => ({ ...previous, view: "list" })} replace />}
            >
              <List />
              List View
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-muted-foreground text-sm">
            Tidak ada berkas yang cocok dengan kriteria pencarian.
          </div>
        ) : activeView === "list" ? (
          <FileListView files={filteredFiles} />
        ) : (
          <FileGridView files={filteredFiles} />
        )}
      </div>
    </div>
  );
}
