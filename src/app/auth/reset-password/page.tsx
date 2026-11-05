import Link from "next/link";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "Reset password",
  description: "Choose a new password for your St. Rita's Boxing staff account.",
  path: "/auth/reset-password",
  index: false,
});

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="admin-app w-full max-w-md rounded-2xl border border-border p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{SITE.shortName}</p>
        <h1 className="mt-2 font-heading text-3xl text-foreground">New password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a new password for your staff account.</p>
        <div className="mt-6">
          <ResetPasswordForm />
        </div>
        <p className="mt-4 text-sm">
          <Link href="/login" className="font-semibold text-brand">
            Back to staff login
          </Link>
        </p>
      </div>
    </div>
  );
}
