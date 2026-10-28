import { getIntegrationStatus, publicConfigBanner } from "@/lib/config-status";

export function DemoBanner() {
  const message = publicConfigBanner(getIntegrationStatus());
  if (!message) return null;
  return (
    <div className="border-b border-gold/30 bg-gold/10 px-4 py-2 text-center text-xs font-medium text-gold sm:text-sm">
      {message}
    </div>
  );
}
