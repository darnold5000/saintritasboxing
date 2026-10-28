"use client";

export function AdminBookingActions({ id }: { id: string }) {
  async function update(status: "completed" | "cancelled") {
    await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <button type="button" className="text-xs font-semibold underline" onClick={() => void update("completed")}>
        Complete
      </button>
      <button type="button" className="text-xs font-semibold underline" onClick={() => void update("cancelled")}>
        Cancel
      </button>
    </div>
  );
}
