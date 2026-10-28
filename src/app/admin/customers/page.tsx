import { CustomerCreditsAdmin } from "@/components/admin/customer-credits-admin";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";
import { TABLES } from "@/lib/tables";

const SAMPLE = [
  {
    id: "demo",
    full_name: "Sample Client",
    email: "demo@example.com",
    phone: "(555) 010-0100",
    remaining: 7,
  },
];

export default async function AdminCustomersPage() {
  const live = isServiceRoleConfigured();
  let rows = SAMPLE;
  if (live) {
    const db = createServiceClient();
    const { data: customers } = await db
      .from(TABLES.customers)
      .select("id, full_name, email, phone");
    const { data: purchases } = await db
      .from(TABLES.purchases)
      .select("customer_id, sessions_remaining, status");
    rows = (customers ?? []).map((customer) => ({
      id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      remaining: (purchases ?? [])
        .filter((item) => item.customer_id === customer.id && item.status === "paid")
        .reduce((sum, item) => sum + Number(item.sessions_remaining ?? 0), 0),
    }));
  }

  return (
    <section>
      <h1 className="font-heading text-3xl">Customers</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add or remove session credits when a client cancels, receives a refund, or needs a
        manual correction. Each change is logged with a reason.
      </p>
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <article
            key={row.email}
            className="rounded-xl border border-border bg-white p-4 sm:flex sm:items-start sm:justify-between sm:gap-6"
          >
            <div>
              <p className="font-semibold">{row.full_name}</p>
              <p className="text-sm text-muted-foreground">{row.email}</p>
              <p className="text-sm">{row.phone}</p>
              <p className="mt-1 text-sm">
                <span className="font-medium">{row.remaining}</span> total sessions remaining
              </p>
            </div>
            {live && row.id !== "demo" ? (
              <CustomerCreditsAdmin customerId={row.id} customerName={row.full_name} />
            ) : (
              <p className="text-xs text-muted-foreground">Connect Supabase to adjust credits.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
