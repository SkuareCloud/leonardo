import { ApiService } from "@/app/api/lib/api_service"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const apiService = new ApiService()
        const characters = await apiService.getOperatorCharacters()
        return NextResponse.json(characters)
    } catch (error) {
        console.error("Failed to get operator characters:", error)
        return NextResponse.json({ error: "Failed to get operator characters" }, { status: 500 })
    }
}
