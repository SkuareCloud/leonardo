import { ApiService } from "@/app/api/lib/api_service"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const proxyId = params.id
    const searchParams = new URL(request.url).searchParams
    const enabledParam = searchParams.get("enabled")

    if (!proxyId || enabledParam === null) {
        return NextResponse.json(
            { error: "proxy id and enabled query parameter are required" },
            { status: 400 },
        )
    }

    const enabled = enabledParam === "true"

    try {
        const proxy = await new ApiService().updateProxyStatus(proxyId, enabled)
        return NextResponse.json(proxy ?? {})
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to update proxy status",
            },
            { status: 500 },
        )
    }
}

