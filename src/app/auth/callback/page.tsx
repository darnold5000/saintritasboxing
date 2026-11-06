import { AuthCallback } from "@/components/auth/auth-callback";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({
  title: "Reset password",
  description: "Finish opening your St. Rita's Boxing password reset link.",
  path: "/auth/callback",
  index: false,
});

export default function AuthCallbackPage() {
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="admin-app w-full max-w-md rounded-2xl border border-border p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{SITE.shortName}</p>
        <h1 className="mt-2 font-heading text-3xl text-foreground">Reset password</h1>
        <AuthCallback />
      </div>
    </div>
  );
}
