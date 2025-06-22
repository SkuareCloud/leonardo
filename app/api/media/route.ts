import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"

export async function GET(req: Request) {
  const apiService = new ApiService()
  const media = await apiService.getMedia()
  return new Response(JSON.stringify(media), { status: 200 })
}

export async function POST(req: Request) {
  const body = await req.json()
  const apiService = new ApiService()
  const media = await apiService.uploadMedia(body)
  return new Response(JSON.stringify(media), { status: 200 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")
  if (!key) {
    return new Response("Key is required", { status: 400 })
  }
  logger.info(`Deleting media with key: ${key}`)
  const apiService = new ApiService()
  const media = await apiService.deleteMedia(key)
  logger.info(`Deleted media with key: ${key}`)
  return new Response(JSON.stringify(media), { status: 200 })
}
