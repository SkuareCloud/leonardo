import { NextResponse } from "next/server"
import { client as operatorClient } from "@lib/api/operator/client.gen"
import { stopAllProfilesCharactersStopPost } from "@lib/api/operator/sdk.gen"

export async function POST() {
    const response = await stopAllProfilesCharactersStopPost({
        client: operatorClient,
    })

    if (response.error) {
        return NextResponse.json(
            { error: `Failed to stop all characters: ${JSON.stringify(response.error)}` },
            { status: 500 },
        )
    }

    return NextResponse.json({ success: true })
}
