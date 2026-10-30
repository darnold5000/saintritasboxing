import { redirect } from "next/navigation";

export default function AdminAvailabilityRedirect() {
  redirect("/admin/training");
}
