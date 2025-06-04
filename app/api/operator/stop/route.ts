import { NextRequest, NextResponse } from "next/server";
import { ApiService } from "../../lib/api_service";

export async function POST(request: NextRequest) {
  const apiService = new ApiService();
  const response = await apiService.stop(
    request.nextUrl.searchParams.get("profileId") ?? ""
  );
  return NextResponse.json({"response": response});
}
