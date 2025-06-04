import { NextRequest, NextResponse } from "next/server";
import { ApiService } from "../../lib/api_service";

export async function POST(request: NextRequest) {
  const apiService = new ApiService();
  const response = await apiService.submitScenario({
    actions: [
      {
        args: {
          wait_time: 0,
        },
        type: "behavioural",
      },
    ],
    prefrences: {
      action_interval: 0,
      actions_timeout: 0,
      close_browser_when_finished: false,
      fail_fast: true,
      should_login_telegram: false,
      verify_proxy_working: true,
    },
    profile: {
      id: request.nextUrl.searchParams.get("profileId") || "",
    },
  });
  return NextResponse.json({ response: response });
}
