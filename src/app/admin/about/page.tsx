import { CoachAdmin } from "@/components/admin/coach-admin";
import { EMPTY_COACH, coachErrorHint, getCoachProfile } from "@/lib/data/coach";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export default async function AdminAboutPage() {
  const live = isServiceRoleConfigured();
  let coach = EMPTY_COACH;
  let loadError = "";
  if (live) {
    try {
      coach = await getCoachProfile();
    } catch (error) {
      loadError = coachErrorHint(error, "Could not load the coach profile.");
    }
  }

  return (
    <section>
      <h1 className="font-heading text-3xl">About</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        This is the owner and coach block on the public About page. The photo sits on the
        right. Leave the bio blank until you have the wording.
      </p>
      {!live ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Connect Supabase and apply migration 007 before editing the About page.
        </p>
      ) : loadError ? (
        <p className="mt-4 text-sm text-red-700">{loadError}</p>
      ) : (
        <CoachAdmin coach={coach} />
      )}
    </section>
  );
}
