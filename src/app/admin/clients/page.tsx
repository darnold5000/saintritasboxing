import { ClientIdentity } from "@/components/admin/client-identity";
import { ClientCreditsAdmin } from "@/components/admin/client-credits-admin";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";
import { TABLES } from "@/lib/tables";

const SAMPLE = [
  {
    id: "demo",
    full_name: "Jordan Lee",
    email: "youth@example.com",
    phone: "(555) 010-0100",
    is_minor: true,
    guardian_name: "Taylor Lee",
    guardian_email: "parent@example.com",
    guardian_phone: "(555) 010-0199",
    remaining: 7,
  },
];

export default async function AdminClientsPage() {
  const live = isServiceRoleConfigured();
  let rows = SAMPLE;
  if (live) {
    const db = createServiceClient();
    const { data: customers } = await db
      .from(TABLES.customers)
      .select(
        "id, full_name, email, phone, is_minor, guardian_name, guardian_email, guardian_phone",
      );
    const { data: purchases } = await db
      .from(TABLES.purchases)
      .select("customer_id, sessions_remaining, status");
    rows = (customers ?? []).map((customer) => ({
      id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      is_minor: customer.is_minor,
      guardian_name: customer.guardian_name,
      guardian_email: customer.guardian_email,
      guardian_phone: customer.guardian_phone,
      remaining: (purchases ?? [])
        .filter((item) => item.customer_id === customer.id && item.status === "paid")
        .reduce((sum, item) => sum + Number(item.sessions_remaining ?? 0), 0),
    }));
  }

  return (
    <section>
      <h1 className="font-heading text-3xl">Clients</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everyone who has booked or purchased through the site. Add or remove session credits when
        a client cancels, receives a refund, or needs a manual correction. Each change is logged
        with a reason.
      </p>
      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        ) : null}
        {rows.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border border-border bg-white p-4 sm:flex sm:items-start sm:justify-between sm:gap-6"
          >
            <div>
              <ClientIdentity
                client={{
                  full_name: row.full_name,
                  email: row.email,
                  phone: row.phone,
                  is_minor: row.is_minor,
                  guardian_name: row.guardian_name,
                  guardian_email: row.guardian_email,
                  guardian_phone: row.guardian_phone,
                }}
              />
              <p className="mt-2 text-sm">
                <span className="font-medium">{row.remaining}</span> total sessions remaining
                (all packages)
              </p>
            </div>
            {live && row.id !== "demo" ? (
              <ClientCreditsAdmin clientId={row.id} clientName={row.full_name} />
            ) : (
              <p className="text-xs text-muted-foreground">Connect Supabase to adjust credits.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
