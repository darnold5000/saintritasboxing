import { AdminLoginForm } from "@/components/admin/login-form";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = createMetadata({
  title: "Staff login",
  description: "Staff login for St. Rita's Boxing.",
  path: "/login",
  index: false,
});

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="admin-app w-full max-w-md rounded-2xl border border-border p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{SITE.shortName}</p>
        <h1 className="mt-2 font-heading text-3xl text-foreground">Staff login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage bookings, availability, and customers.
        </p>
        {!configured ? (
          <p className="mt-4 rounded-md bg-gold/20 px-3 py-2 text-sm text-foreground">
            Demo: Supabase is not configured, so staff login cannot authenticate. You can
            still preview the admin screens with sample data at /admin.
          </p>
        ) : null}
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
