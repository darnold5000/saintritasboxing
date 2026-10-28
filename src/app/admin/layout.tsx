import Link from "next/link";
import { getStaffSession } from "@/lib/auth/staff";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const staff = configured ? await getStaffSession() : null;
  if (configured && !staff) {
    redirect("/login");
  }

  return (
    <div className="admin-app min-h-screen">
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-heading text-lg text-foreground">Staff admin</p>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/bookings">Bookings</Link>
            <Link href="/admin/availability">Availability</Link>
            <Link href="/admin/customers">Customers</Link>
            <Link href="/">View site</Link>
          </nav>
        </div>
      </div>
      {!configured ? (
        <p className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
          Demo admin with sample data. Connect Supabase and grant staff with{" "}
          <code>npm run db:staff</code> for live bookings.
        </p>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
