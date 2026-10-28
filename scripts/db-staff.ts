/**
 * Grant St. Rita's staff admin to an existing Supabase Auth user.
 * Usage: STAFF_EMAIL=you@example.com npm run db:staff
 */
import { createServiceScriptClient } from "./lib/supabase-script-client";

const email = process.env.STAFF_EMAIL?.trim().toLowerCase();
if (!email) {
  console.error("Set STAFF_EMAIL.");
  process.exit(1);
}

const db = createServiceScriptClient();

async function main() {
  const { data: list, error: listError } = await db.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;
  const user = list.users.find((item) => item.email?.toLowerCase() === email);
  if (!user) {
    console.error(`No auth user found for ${email}. Create the user in Supabase Auth first.`);
    process.exit(1);
  }
  const { error } = await db.from("srb_staff_profiles").upsert(
    {
      user_id: user.id,
      email,
      full_name: user.user_metadata?.full_name ?? null,
      role: "owner",
      active: true,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  console.log(`Staff admin granted to ${email} (${user.id}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
