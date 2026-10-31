import { TrainingSchedule } from "@/components/admin/training-schedule";
import { loadAvailabilityConfig } from "@/lib/data/availability";

export default async function AdminTrainingPage() {
  const { slotsByType, demo, scheduleReady } = await loadAvailabilityConfig();

  return (
    <section>
      <h1 className="font-heading text-3xl">Training</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Pick a training type. Each day lists its classes. Add a start time and length, then save.
        New classes are public. Hide a class to keep it off the booking page.
      </p>
      <TrainingSchedule initial={slotsByType} demo={demo} scheduleReady={scheduleReady} />
    </section>
  );
}
