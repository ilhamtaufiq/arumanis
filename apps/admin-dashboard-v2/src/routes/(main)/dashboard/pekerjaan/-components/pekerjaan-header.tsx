import { Filter, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { KecamatanItem } from "@/lib/api/dashboard-api";

interface PekerjaanHeaderProps {
  tahun: string;
  onTahunChange: (year: string) => void;
  availableYears: number[];
  selectedKecamatan: string[];
  onKecamatanChange: (selected: string[]) => void;
  kecamatanList: KecamatanItem[];
  onRefresh: () => void;
  loading: boolean;
}

export function PekerjaanHeader({
  tahun,
  onTahunChange,
  availableYears,
  selectedKecamatan,
  onKecamatanChange,
  kecamatanList,
  onRefresh,
  loading,
}: PekerjaanHeaderProps) {
  const toggleKecamatan = (idStr: string) => {
    if (selectedKecamatan.includes(idStr)) {
      onKecamatanChange(selectedKecamatan.filter((k) => k !== idStr));
    } else {
      onKecamatanChange([...selectedKecamatan, idStr]);
    }
  };

  // Belum ada data → tampilkan hanya tahun yang sedang dipilih, jangan daftar mock.
  const years = availableYears.length > 0 ? availableYears : [Number(tahun)];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold leading-none tracking-tight">Pekerjaan & Program Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Monitoring capaian fisik, realisasi keuangan, dan sebaran program pekerjaan TA {tahun}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Year Filter */}
        <Select value={tahun} onValueChange={(v) => v && onTahunChange(v)}>
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                TA {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Kecamatan Multi-select Filter */}
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="size-4" />
                Kecamatan {selectedKecamatan.length > 0 && `(${selectedKecamatan.length})`}
              </Button>
            }
          />
          <PopoverContent className="w-[240px] p-3" align="end">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">Filter Kecamatan</span>
                {selectedKecamatan.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-destructive text-xs hover:bg-transparent"
                    onClick={() => onKecamatanChange([])}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <div className="max-h-[220px] space-y-1 overflow-y-auto pt-1">
                {kecamatanList.map((kec) => {
                  const idStr = String(kec.id);
                  const isChecked = selectedKecamatan.includes(idStr);
                  return (
                    <div
                      key={kec.id}
                      className="flex cursor-pointer items-center space-x-2 rounded-md p-1.5 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleKecamatan(idStr);
                      }}
                    >
                      <Checkbox id={`kec-${kec.id}`} checked={isChecked} onCheckedChange={() => {}} />
                      <label htmlFor={`kec-${kec.id}`} className="cursor-pointer text-xs font-medium leading-none">
                        {kec.n_kec}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Refresh Button */}
        <Button variant="outline" size="sm" className="h-9" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
