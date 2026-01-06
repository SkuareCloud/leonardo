import { NextRequest } from "next/server"
import { ApiService } from "../../lib/api_service"

// Helper function to parse request body or query params
async function parseRequestParams(request: NextRequest) {
    const method = request.method
    
    if (method === "POST") {
        const body = await request.json().catch(() => ({}))
        return {
            skip: body.skip ? parseInt(String(body.skip)) : 0,
            limit: body.limit ? parseInt(String(body.limit)) : 50,
            writable: body.writable === true || body.writable === "true",
            categoryName: body.category_name || null,
            username: body.username?.trim() || undefined,
            title: body.title?.trim() || undefined,
            chatType: body.chat_type?.trim() || undefined,
            platform: body.platform?.trim() || undefined,
            minParticipants: body.min_participants?.trim() || undefined,
            maxParticipants: body.max_participants?.trim() || undefined,
            linkedChatUsername: body.linked_chat_username?.trim() || undefined,
            sortBy: parseSortBy(body.sort_by),
        }
    } else {
        // GET request - parse from query params (backward compatibility)
        const { searchParams } = new URL(request.url)
        return {
            skip: searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : 0,
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
            writable: searchParams.get("writable") ? searchParams.get("writable") == "true" : false,
            categoryName: searchParams.get("category_name"),
            username: searchParams.get("username")?.trim() || undefined,
            title: searchParams.get("title")?.trim() || undefined,
            chatType: searchParams.get("chat_type")?.trim() || undefined,
            platform: searchParams.get("platform")?.trim() || undefined,
            minParticipants: searchParams.get("min_participants")?.trim() || undefined,
            maxParticipants: searchParams.get("max_participants")?.trim() || undefined,
            linkedChatUsername: searchParams.get("linked_chat_username")?.trim() || undefined,
            sortBy: parseSortBy(searchParams.get("sort_by")),
        }
    }
}

function parseSortBy(sortByParam: string | null | undefined): Array<{ field: string; order?: 'asc' | 'desc' }> | null {
    if (!sortByParam) return null
    try {
        // Handle both JSON string and already parsed object
        const parsed = typeof sortByParam === 'string' ? JSON.parse(sortByParam) : sortByParam
        if (Array.isArray(parsed)) {
            return parsed
        } else if (typeof parsed === 'object' && parsed !== null) {
            return [parsed]
        }
    } catch (e) {
        console.warn(`Failed to parse sort_by parameter: ${sortByParam}`, e)
    }
    return null
}

// API route for fetching paginated chats with optional category filter
// Supports both GET (backward compatibility) and POST (new method)
export async function GET(request: NextRequest) {
    return handleRequest(request)
}

export async function POST(request: NextRequest) {
    return handleRequest(request)
}

async function handleRequest(request: NextRequest) {
    const params = await parseRequestParams(request)
    const apiService = new ApiService()

    try {
        // Fetch one extra to determine if there are more pages
        const requestLimit = params.limit > 0 ? params.limit + 1 : 0
        console.log(`[Pagination] Request: skip=${params.skip}, limit=${params.limit}, requestLimit=${requestLimit}, category=${params.categoryName}, filters:`, {
            username: params.username,
            title: params.title,
            chatType: params.chatType,
            platform: params.platform,
            minParticipants: params.minParticipants,
            maxParticipants: params.maxParticipants,
            linkedChatUsername: params.linkedChatUsername,
            sortBy: params.sortBy
        })
        
        const chats = await apiService.getOrchestratorChats(
            params.skip, 
            requestLimit, 
            params.writable, 
            params.categoryName,
            {
                username: params.username,
                title: params.title,
                chatType: params.chatType,
                platform: params.platform,
                minParticipants: params.minParticipants,
                maxParticipants: params.maxParticipants,
                linkedChatUsername: params.linkedChatUsername,
            },
            params.sortBy
        )
        
        // Check if there are more results
        const hasMore = params.limit > 0 && chats.length > params.limit
        const actualChats = hasMore ? chats.slice(0, params.limit) : chats
        
        console.log(`[Pagination] Response: returned=${actualChats.length}, hasMore=${hasMore}, fetched=${chats.length}, requestedLimit=${requestLimit}`)
        
        // Return pagination metadata
        const response = {
            chats: actualChats,
            pagination: {
                skip: params.skip,
                limit: params.limit,
                count: actualChats.length,
                hasMore,
            }
        }
        
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        })
    } catch (error) {
        console.error("Failed to get chats:", error)
        return new Response(
            JSON.stringify({
                error: "Failed to get chats",
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        )
    }
}
