import { formatTime } from "@/lib/dates";

export function TimeGrid({
  times,
  selected,
  onSelect,
}: {
  times: string[];
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  if (times.length === 0) {
    return (
      <p className="rounded-xl bg-white/5 px-4 py-5 text-sm text-white/70">
        No openings on this date. Try another day.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {times.map((time) => {
        const active = selected === time;
        return (
          <button
            key={time}
            type="button"
            onClick={() => onSelect(time)}
            className={`min-h-12 rounded-lg border text-sm font-semibold transition ${
              active
                ? "border-brand bg-brand text-white"
                : "border-white/10 bg-surface text-white hover:border-gold"
            }`}
          >
            {formatTime(time)}
          </button>
        );
      })}
    </div>
  );
}
