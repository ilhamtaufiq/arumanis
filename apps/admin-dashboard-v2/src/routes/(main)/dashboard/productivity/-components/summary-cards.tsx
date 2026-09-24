import { ArrowRight, Clock3, Focus, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const summaryCards = [
  { title: "Laporan Hari Ini", value: "4 Laporan", description: "verifikasi masuk", icon: Clock3 },
  { title: "Rata-rata Fisik", value: "68.5%", description: "capaian estimasi", icon: TrendingUp },
  { title: "Fokus Prioritas", value: "3 Paket", description: "perlu tindak lanjut", icon: Focus },
] as const;

export function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryCards.map((item) => (
        <Card key={item.title} className="shadow-xs">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="grid size-7 place-items-center rounded-lg border bg-muted">
                  <item.icon className="size-4" />
                </div>
                {item.title}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="text-2xl leading-none tracking-tight">{item.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground tabular-nums leading-none text-xs">{item.description}</p>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
