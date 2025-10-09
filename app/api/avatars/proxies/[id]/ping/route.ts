import { ApiService } from "@/app/api/lib/api_service"
import { read_server_env } from "@lib/server-env"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const proxyId = params.id

    const apiService = new ApiService()
    const response = await apiService.pingProxy(proxyId)
    return NextResponse.json({ response: response })
}
