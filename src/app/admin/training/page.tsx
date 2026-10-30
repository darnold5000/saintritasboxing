import { TrainingSchedule } from "@/components/admin/training-schedule";
import { loadAvailabilityConfig } from "@/lib/data/availability";

export default async function AdminTrainingPage() {
  const { slotsByType, demo, scheduleReady } = await loadAvailabilityConfig();

  return (
    <section>
      <h1 className="font-heading text-3xl">Training</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Pick a training type, then set the days and times it is offered. 1:1 and 2:1 keep the
        default daily hours until you save a schedule here. Youth and adult classes only appear
        on the days you add.
      </p>
      <TrainingSchedule initial={slotsByType} demo={demo} scheduleReady={scheduleReady} />
    </section>
  );
}
