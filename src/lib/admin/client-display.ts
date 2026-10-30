export type ClientProfileFields = {
  full_name?: string;
  email?: string;
  phone?: string | null;
  is_minor?: boolean | null;
  guardian_name?: string | null;
  guardian_email?: string | null;
  guardian_phone?: string | null;
};

export function parseClientJoin(customers: unknown): ClientProfileFields | null {
  const joined = customers as ClientProfileFields | ClientProfileFields[] | null;
  if (!joined) return null;
  return Array.isArray(joined) ? (joined[0] ?? null) : joined;
}

export function clientDisplayName(client: ClientProfileFields | null) {
  return client?.full_name?.trim() || client?.email?.trim() || "—";
}

export function isYouthClient(client: ClientProfileFields | null) {
  return Boolean(client?.is_minor);
}

/** Guardian contact when the client is marked as a minor at booking. We do not store date of birth. */
export function guardianContactLine(client: ClientProfileFields | null) {
  if (!isYouthClient(client)) return null;
  const name = client?.guardian_name?.trim();
  const email = client?.guardian_email?.trim();
  const phone = client?.guardian_phone?.trim();
  const detail = [email, phone].filter(Boolean).join(" · ");
  if (name && detail) return `Guardian: ${name} (${detail})`;
  if (name) return `Guardian: ${name}`;
  if (detail) return `Guardian: ${detail}`;
  return "Youth — add guardian details on next booking if missing.";
}

/** Display name from booking join (`customers:customer_id`). */
export function clientNameFromBookingRow(row: { customers?: unknown }) {
  return clientDisplayName(parseClientJoin(row.customers));
}

export function youthClientFromBookingRow(row: { customers?: unknown }) {
  return isYouthClient(parseClientJoin(row.customers));
}

export function guardianFromBookingRow(row: { customers?: unknown }) {
  return guardianContactLine(parseClientJoin(row.customers));
}
