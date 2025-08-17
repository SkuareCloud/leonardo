import { ApiService } from "@/app/api/lib/api_service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const body = await req.json()
  const categoryId = body.categoryId
  const apiService = new ApiService()
  await apiService.addChatToCategory(id, categoryId)
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const body = await req.json()
  const categoryId = body.categoryId
  const apiService = new ApiService()
  await apiService.removeChatFromCategory(id, [categoryId])
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const apiService = new ApiService()
  const { id } = await params
  const categories = await apiService.getOrchestratorChatCategories(id)
  return NextResponse.json(categories)
}