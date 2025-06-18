import { logger } from "@lib/logger"
import { Web1Client } from "@lib/web1/web1-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accounts = await new Web1Client().listAccounts()
    return NextResponse.json(accounts)
  } catch (error) {
    logger.error("Error fetching WEB1 accounts:", error)
    return NextResponse.json({ error: "Failed to fetch WEB1 accounts" }, { status: 500 })
  }
}
