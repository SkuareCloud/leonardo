import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") || "attachments/"
  
  try {
    const apiService = new ApiService()
    const images = await apiService.getS3Images(path)
    return new Response(JSON.stringify(images), { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
      }
    })
  } catch (error) {
    logger.error(`Failed to list S3 images from path ${path}:`, error)
    return new Response(JSON.stringify({ error: "Failed to list images" }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
      }
    })
  }
} 