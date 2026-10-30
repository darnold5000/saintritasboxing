import {
  clientDisplayName,
  guardianContactLine,
  isYouthClient,
  parseClientJoin,
  type ClientProfileFields,
} from "@/lib/admin/client-display";

export function YouthBadge() {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
      Youth
    </span>
  );
}

export function ClientIdentity({
  client,
  compact = false,
}: {
  client: ClientProfileFields | null;
  compact?: boolean;
}) {
  const youth = isYouthClient(client);
  const guardian = guardianContactLine(client);

  if (compact) {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{clientDisplayName(client)}</span>
        {youth ? <YouthBadge /> : null}
      </span>
    );
  }

  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        {clientDisplayName(client)}
        {youth ? <YouthBadge /> : null}
      </p>
      {client?.email ? <p className="text-sm text-muted-foreground">{client.email}</p> : null}
      {client?.phone ? <p className="text-sm">{client.phone}</p> : null}
      {youth && guardian ? (
        <p className="mt-1 text-xs text-muted-foreground">{guardian}</p>
      ) : null}
    </div>
  );
}

export function BookingClientCell({ customers }: { customers?: unknown }) {
  return <ClientIdentity client={parseClientJoin(customers)} compact />;
}
