import { Briefcase } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IncompletePekerjaanItem } from "@/lib/api/dashboard-api";

const fallbackProjects = [
  {
    id: 1,
    nama_paket: "SPAM Jaringan Perpipaan",
    status: "On Track" as const,
    n_desa: "Desa Cikancana",
    progress: 75,
    dueText: "Progres Belum 100%",
  },
  {
    id: 2,
    nama_paket: "MCK Komunal & Sanitasi",
    status: "Watch" as const,
    n_desa: "Desa Cipanas",
    progress: 48,
    dueText: "Progres Belum 100%",
  },
  {
    id: 3,
    nama_paket: "Supervisi Infrastruktur Permukiman",
    status: "On Track" as const,
    n_desa: "Kab. Cianjur",
    progress: 82,
    dueText: "Progres Belum 100%",
  },
];

const projectFilterItems = [
  { value: "active", label: "Aktif (<100%)" },
  { value: "all", label: "Semua Paket" },
] as const;

interface ProjectsSectionProps {
  items?: IncompletePekerjaanItem[];
  loading?: boolean;
}

export function ProjectsSection({ items, loading }: ProjectsSectionProps) {
  const displayProjects = items && items.length > 0 ? items : fallbackProjects;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl tracking-tight font-semibold">Paket Prioritas Lapangan</h2>
          <p className="text-xs text-muted-foreground">Top 3 paket pekerjaan aktif yang belum 100% (dalam pengerjaan)</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="active" items={projectFilterItems}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Aktif (<100%)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {projectFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <Card key={i} className="shadow-xs animate-pulse">
                <CardHeader className="h-16 bg-muted/20" />
                <CardContent className="h-20 bg-muted/10" />
              </Card>
            ))
          : displayProjects.map((project) => {
              const badgeVariant = project.status === "On Track" ? "outline" : project.status === "Watch" ? "outline" : "destructive";
              const badgeClass = project.status === "On Track" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : project.status === "Watch" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "";

              return (
                <Card key={project.id} className="shadow-xs flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Briefcase className="size-4 text-muted-foreground shrink-0" />
                        <span className="truncate text-sm font-medium" title={project.nama_paket}>
                          {project.nama_paket}
                        </span>
                      </div>
                    </CardTitle>
                    <CardAction>
                      <Badge variant={badgeVariant} className={badgeClass}>
                        {project.status}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-muted-foreground leading-none">{project.n_desa}</div>
                      <div className="flex items-center gap-3">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className="shrink-0 text-xs font-semibold tabular-nums">{project.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="py-2.5">
                    <span className="text-xs text-muted-foreground font-medium">{project.dueText} · Belum 100%</span>
                  </CardFooter>
                </Card>
              );
            })}
      </div>
    </section>
  );
}
