export function canViewFinancials(role: string | null | undefined) {
  return role === "owner";
}
