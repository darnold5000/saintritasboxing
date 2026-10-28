import { AvailabilityForm } from "@/components/admin/availability-form";
import { loadAvailabilityConfig } from "@/lib/data/availability";

export default async function AdminAvailabilityPage() {
  const { config, demo } = await loadAvailabilityConfig();
  return (
    <section>
      <h1 className="font-heading text-3xl">Availability</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Configure days, hours, blocked dates, and extra slots. Public booking reads this
        configuration — it does not invent production times.
      </p>
      <AvailabilityForm config={config} demo={demo} />
    </section>
  );
}
