import { NextRequest, NextResponse } from "next/server";
import { searchGlobal } from "@/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");
  const country = searchParams.get("country") ?? undefined;

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchGlobal(query, country);
  return NextResponse.json(results);
}
