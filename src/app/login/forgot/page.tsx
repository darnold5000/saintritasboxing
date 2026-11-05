import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "Reset password",
  description: "Request a password reset link for your St. Rita's Boxing staff account.",
  path: "/login/forgot",
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="admin-app w-full max-w-md rounded-2xl border border-border p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{SITE.shortName}</p>
        <h1 className="mt-2 font-heading text-3xl text-foreground">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email on your staff account. If it matches, we will send a reset link.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
