import { read_server_env } from "@lib/server-env"
import { Web1Client } from "@lib/web1/web1-client"

/**
 * Fetch all WEB1 accounts.
*/
export async function GET() {
    console.log("Retrieving WEB1 accounts...")
    const accounts = await new Web1Client().listAccounts()
    console.log(`Successfully retrieved ${accounts.length} WEB1 accounts.`)

    return new Response(
        JSON.stringify(accounts),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        }
    )
}

export async function POST(request: Request) {
    const { profileId } = await request.json()
    console.log(`Activating account for profile ${profileId}...`)
    const env = read_server_env();
    const endpoint = env.operatorApiEndpoint;

    console.log(`Starting browser for profile ${profileId} via '${endpoint}/activation/activate'.`);
    const resp = await fetch(`${endpoint}/activation/activate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ profile_id: profileId }),
    });
    const json = await resp.json();
    console.log(`Successfully activated account for profile ${profileId}.`)
    return json;
}