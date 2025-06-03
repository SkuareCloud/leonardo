import { ApiService } from "@/app/api/lib/api_service"

/**
 * Fetch all profiles from DB.
*/
export async function GET() {
    console.log("Retrieving avatars...")
    const avatars = await new ApiService().listProfiles();
    console.log(`Successfully retrieved ${avatars.length} avatars.`)

    return new Response(
        JSON.stringify(avatars),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        }
    )
}