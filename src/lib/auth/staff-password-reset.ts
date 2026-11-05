import {
  createAuthLinkService,
  deliverPasswordResetRequest,
  passwordResetRedirectUrl,
} from "@/lib/signalworks/auth-recovery";
import { buildPasswordResetEmail } from "@/lib/signalworks/email";
import { sendTransactionalEmail } from "@/lib/email/send";
import { SITE } from "@/lib/site";
import { TABLES } from "@/lib/tables";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";

export async function requestStaffPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!isServiceRoleConfigured()) {
    console.error("[staff-forgot-password] Supabase service role is not configured");
    return;
  }

  const db = createServiceClient();
  const { data: staff, error } = await db
    .from(TABLES.staff)
    .select("email, full_name, active")
    .ilike("email", normalized)
    .maybeSingle();
  if (error || !staff?.active) return;

  const links = createAuthLinkService(db);
  const redirectTo = passwordResetRedirectUrl({
    siteUrl: SITE.url,
    resetPath: "/auth/reset-password",
    callbackPath: "/auth/callback",
  });

  await deliverPasswordResetRequest({
    emailNorm: normalized,
    redirectTo,
    logTag: "staff-forgot-password",
    resolveFullName: async () => staff.full_name?.trim() || undefined,
    createRecoveryLink: (input) =>
      links.createRecoveryLink(input).then((result) => ({ actionLink: result.actionLink })),
    sendPasswordResetEmail: async ({ email: to, fullName, actionLink }) => {
      const message = buildPasswordResetEmail({
        brandShortName: SITE.shortName,
        brandName: SITE.name,
        recipientFullName: fullName,
        actionLink,
        intro: "Use the button below to choose a new password for your staff account.",
        footer: "If you did not ask for this, you can ignore this email.",
        staff: true,
      });
      const sent = await sendTransactionalEmail({ ...message, to, tag: "staff-password-reset" });
      if (!sent.ok) {
        throw new Error("skipped" in sent ? "Email is not configured." : "Email send failed.");
      }
    },
  });
}
