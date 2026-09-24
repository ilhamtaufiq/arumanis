import * as React from "react";

import { Calendar1, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = {
  title: string;
  tag: string;
  time: string;
  checked: boolean;
};

const taskRangeItems = [
  { value: "today", label: "Hari Ini" },
  { value: "tomorrow", label: "Besok" },
  { value: "this-week", label: "Minggu Ini" },
] as const;

const tasks: Task[] = [
  { title: "Verifikasi Laporan Mingguan Progres Fisik Paket SPAM Air Minum", tag: "Monev", time: "09:00 WIB", checked: false },
  { title: "Review Pengajuan Pencairan SP2D Termin II Sub Kegiatan Sanitasi", tag: "Keuangan", time: "11:30 WIB", checked: true },
  { title: "Pemeriksaan Lapangan & Quality Control Pembangunan IPAL", tag: "Lapangan", time: "14:00 WIB", checked: false },
  { title: "Evaluasi Deviasi Keterlambatan Paket Pekerjaan Konsultan", tag: "Evaluasi", time: "16:00 WIB", checked: false },
  { title: "Upload Berita Acara Serah Terima (BAST) Paket Selesai", tag: "Admin", time: "17:00 WIB", checked: false },
];

export function TasksSection() {
  const [items, setItems] = React.useState(tasks);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl tracking-tight">Tindak Lanjut & Verifikasi</h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="today" items={taskRangeItems}>
            <SelectTrigger className="w-30">
              <SelectValue placeholder="Hari Ini" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {taskRangeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus data-icon="inline-start" />
            Tambah Tugas
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
        <div className="divide-y">
          {items.map((task) => (
            <div key={task.title} className="flex items-center gap-2 p-4">
              <Checkbox
                checked={task.checked}
                aria-label={task.title}
                onCheckedChange={(checked) => {
                  setItems((current) =>
                    current.map((item) => (item.title === task.title ? { ...item, checked: checked === true } : item)),
                  );
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                    <span className="truncate text-sm">{task.title}</span>
                    <Badge variant="outline" className="px-3 py-1 font-normal">
                      {task.tag}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
                    <span>{task.time}</span>
                    <Calendar1 className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
