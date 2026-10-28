import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";
import { TABLES } from "@/lib/tables";

const SAMPLE = [
  {
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
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Remaining sessions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.email} className="border-t border-border">
                <td className="px-3 py-2">{row.full_name}</td>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">{row.phone}</td>
                <td className="px-3 py-2">{row.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
