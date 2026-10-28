import { TABLES } from "@/lib/tables";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export type StaffProfile = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  active: boolean;
};

export async function getStaffSession(): Promise<StaffProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data } = await supabase
    .from(TABLES.staff)
    .select("user_id, email, full_name, role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data || data.active === false) return null;
  return data as StaffProfile;
}

export function isStaffRole(role: string | null | undefined) {
  return role === "owner" || role === "admin" || role === "staff";
}
