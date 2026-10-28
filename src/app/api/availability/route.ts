import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { getOpenDates, getOpenings } from "@/lib/data/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (date) {
    const { times, demo } = await getOpenings(date);
    return NextResponse.json({
      times,
      demo,
      durationMinutes: SITE.defaultSessionDurationMinutes,
    });
  }
  const { dates, demo } = await getOpenDates();
  return NextResponse.json({
    dates: Array.from(dates),
    demo,
    durationMinutes: SITE.defaultSessionDurationMinutes,
  });
}
