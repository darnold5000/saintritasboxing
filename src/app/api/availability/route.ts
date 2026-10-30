import { NextResponse } from "next/server";
import { TRAINING_TYPE_IDS, type TrainingTypeId } from "@/lib/catalog";
import { getOpenDates, getOpenings } from "@/lib/data/availability";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type");
  const trainingType = TRAINING_TYPE_IDS.includes(typeParam as TrainingTypeId)
    ? (typeParam as TrainingTypeId)
    : null;
  const date = url.searchParams.get("date");
  if (date) {
    const { times, demo } = await getOpenings(date, trainingType);
    return NextResponse.json({
      times,
      demo,
      durationMinutes: SITE.defaultSessionDurationMinutes,
    });
  }
  const { dates, demo } = await getOpenDates(60, trainingType);
  return NextResponse.json({
    dates: Array.from(dates),
    demo,
    durationMinutes: SITE.defaultSessionDurationMinutes,
  });
}
