import { AdminBookingActions } from "@/components/admin/booking-actions";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import { BookingClientCell } from "@/components/admin/client-identity";
import { listAdminBookings, SAMPLE_BOOKINGS } from "@/lib/data/bookings";
import { formatLongDate, formatTime } from "@/lib/dates";

export default async function AdminBookingsPage() {
  const live = isServiceRoleConfigured();
  const bookings = live ? await listAdminBookings() : SAMPLE_BOOKINGS;

  return (
    <section>
      <h1 className="font-heading text-3xl">Bookings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upcoming, completed, and cancelled. Completing a session does not automatically
        change package credits.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Training</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2">
                  {row.session_date ? formatLongDate(String(row.session_date)) : "Unscheduled"}{" "}
                  {row.start_time ? formatTime(String(row.start_time).slice(0, 5)) : ""}
                </td>
                <td className="px-3 py-2">
                  <BookingClientCell customers={row.customers} />
                </td>
                <td className="px-3 py-2">{String(row.offering_name)}</td>
                <td className="px-3 py-2">{String(row.payment_status)}</td>
                <td className="px-3 py-2">{String(row.status)}</td>
                <td className="px-3 py-2">
                  {live ? <AdminBookingActions id={String(row.id)} /> : "Demo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
