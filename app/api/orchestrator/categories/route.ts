import { ApiService } from "@/app/api/lib/api_service"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, parent_id } = body
    
    if (!name || name.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Category name is required' }), 
        { status: 400 }
      )
    }
    
    const apiService = new ApiService()
    const category = await apiService.createOrchestratorCategory(
      name.trim(),
      description || '',
      parent_id || null
    )
    
    return new Response(JSON.stringify(category), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to create category:', error)
    return new Response(
      JSON.stringify({ 
        error: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }), 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('id')
    
    if (!categoryId || categoryId.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Category ID is required' }), 
        { status: 400 }
      )
    }
    
    const apiService = new ApiService()
    await apiService.deleteOrchestratorCategory(categoryId)
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return new Response(
      JSON.stringify({ 
        error: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }), 
      { status: 500 }
    )
  }
} 