/**
 * Grant St. Rita's staff admin to an existing Supabase Auth user.
 * Usage:
 *   STAFF_EMAIL=you@example.com npm run db:staff
 *   STAFF_USER_ID=uuid-from-auth npm run db:staff
 */
import { createServiceScriptClient } from "./lib/supabase-script-client";

const email = process.env.STAFF_EMAIL?.trim().toLowerCase();
const userId = process.env.STAFF_USER_ID?.trim();

if (!email && !userId) {
  console.error("Set STAFF_EMAIL or STAFF_USER_ID.");
  process.exit(1);
}

const db = createServiceScriptClient();

async function resolveAuthUser() {
  if (userId) {
    const { data, error } = await db.auth.admin.getUserById(userId);
    if (error) throw error;
    if (!data.user) {
      console.error(`No auth user found for id ${userId}.`);
      process.exit(1);
    }
    return data.user;
  }

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
  return user;
}

async function main() {
  const user = await resolveAuthUser();
  const profileEmail = (user.email ?? email ?? "").trim().toLowerCase();
  if (!profileEmail) {
    console.error("Auth user has no email; set STAFF_EMAIL for the profile row.");
    process.exit(1);
  }
  const { error } = await db.from("srb_staff_profiles").upsert(
    {
      user_id: user.id,
      email: profileEmail,
      full_name: user.user_metadata?.full_name ?? null,
      role: "owner",
      active: true,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    if (error.code === "PGRST205" && String(error.message).includes("srb_staff_profiles")) {
      console.error(
        "Table srb_staff_profiles is missing. Apply migrations first:\n  DATABASE_URL=... npm run db:migrate\n(See docs/SETUP.md)",
      );
      process.exit(1);
    }
    throw error;
  }
  console.log(`Staff owner granted to ${profileEmail} (${user.id}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
