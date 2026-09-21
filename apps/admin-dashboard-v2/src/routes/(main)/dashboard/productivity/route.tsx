import { useCallback, useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { getTopIncompletePekerjaan, type IncompletePekerjaanItem } from "@/lib/api/dashboard-api";

import { CalendarPanel } from "./-components/calendar-panel";
import { FocusCard } from "./-components/focus-card";
import { ProjectsSection } from "./-components/projects-section";
import { QuickActions } from "./-components/quick-actions";
import { QuoteCard } from "./-components/quote-card";
import { RecentNotesCard } from "./-components/recent-notes-card";
import { SummaryCards } from "./-components/summary-cards";
import { TasksSection } from "./-components/tasks-section";
import { WeeklySummaryCard } from "./-components/weekly-summary-card";

export const Route = createFileRoute("/(main)/dashboard/productivity")({
  component: Page,
});

function Page() {
  const [incompleteProjects, setIncompleteProjects] = useState<IncompletePekerjaanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTopIncompletePekerjaan();
      setIncompleteProjects(data);
    } catch {
      setIncompleteProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="lg:col-span-9">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl text-foreground leading-none tracking-tight">Selamat bekerja, Tim Monev.</h1>
            <p className="text-lg text-muted-foreground leading-none">
              Mari pastikan pengawasan fisik, verifikasi laporan, dan serapan anggaran tepat waktu.
            </p>
          </div>
          <SummaryCards />
          <TasksSection />
          <ProjectsSection items={incompleteProjects} loading={loading} />
          <QuickActions />
          <QuoteCard />
        </div>
      </section>

      <section className="flex flex-col gap-6 lg:col-span-3">
        <CalendarPanel />
        <FocusCard />
        <RecentNotesCard />
        <WeeklySummaryCard />
      </section>
    </div>
  );
}
