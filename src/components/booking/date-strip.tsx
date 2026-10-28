import {
  addDays,
  dayNumber,
  isPastDate,
  todayISO,
  weekdayLabel,
} from "@/lib/dates";

export function DateStrip({
  weekStart,
  selected,
  available,
  onSelect,
  onWeekChange,
}: {
  weekStart: string;
  selected: string | null;
  available: Set<string>;
  onSelect: (iso: string) => void;
  onWeekChange: (iso: string) => void;
}) {
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-2 text-sm font-semibold text-gold"
          onClick={() => onWeekChange(addDays(weekStart, -7))}
        >
          Prev
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-2 text-sm font-semibold text-white"
          onClick={() => onWeekChange(today)}
        >
          This week
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-2 text-sm font-semibold text-gold"
          onClick={() => onWeekChange(addDays(weekStart, 7))}
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((iso) => {
          const past = isPastDate(iso);
          const open = available.has(iso);
          const active = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={past || !open}
              onClick={() => onSelect(iso)}
              className={`flex min-w-0 flex-col items-center rounded-xl border px-1 py-3 ${
                active
                  ? "border-brand bg-brand text-white"
                  : past || !open
                    ? "border-transparent bg-white/5 text-white/30"
                    : "border-white/10 bg-surface text-white"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {weekdayLabel(iso)}
              </span>
              <span className="text-lg font-bold">{dayNumber(iso)}</span>
              {open && !past ? (
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${active ? "bg-gold" : "bg-brand"}`} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
