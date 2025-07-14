import { ApiService } from "@/app/api/lib/api_service"

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
