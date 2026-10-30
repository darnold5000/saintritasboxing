import { redirect } from "next/navigation";

/** @deprecated Use /admin/clients */
export default function AdminCustomersRedirect() {
  redirect("/admin/clients");
}
