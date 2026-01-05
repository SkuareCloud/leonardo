import { NextRequest } from "next/server"
import { ApiService } from "../../lib/api_service"

// API route for fetching paginated chats with optional category filter
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : 0
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50
    let writable = searchParams.get("writable") ? searchParams.get("writable") == "true" : false
    const categoryName = searchParams.get("category_name")
    
    // Extract filter parameters (only include if they have values)
    const usernameParam = searchParams.get("username")
    const username = usernameParam && usernameParam.trim() ? usernameParam.trim() : undefined
    const titleParam = searchParams.get("title")
    const title = titleParam && titleParam.trim() ? titleParam.trim() : undefined
    const chatTypeParam = searchParams.get("chat_type")
    const chatType = chatTypeParam && chatTypeParam.trim() ? chatTypeParam.trim() : undefined
    const platformParam = searchParams.get("platform")
    const platform = platformParam && platformParam.trim() ? platformParam.trim() : undefined
    const minParticipantsParam = searchParams.get("min_participants")
    const minParticipants = minParticipantsParam && minParticipantsParam.trim() ? minParticipantsParam.trim() : undefined
    const maxParticipantsParam = searchParams.get("max_participants")
    const maxParticipants = maxParticipantsParam && maxParticipantsParam.trim() ? maxParticipantsParam.trim() : undefined
    const linkedChatUsernameParam = searchParams.get("linked_chat_username")
    const linkedChatUsername = linkedChatUsernameParam && linkedChatUsernameParam.trim() ? linkedChatUsernameParam.trim() : undefined
    
    // Parse sort_by parameter (JSON string)
    let sortBy: Array<{ field: string; order?: 'asc' | 'desc' }> | null = null
    const sortByParam = searchParams.get("sort_by")
    if (sortByParam) {
        try {
            const parsed = JSON.parse(sortByParam)
            // Handle both single object and array
            if (Array.isArray(parsed)) {
                sortBy = parsed
            } else if (typeof parsed === 'object' && parsed !== null) {
                sortBy = [parsed]
            }
        } catch (e) {
            console.warn(`Failed to parse sort_by parameter: ${sortByParam}`, e)
        }
    }

    const apiService = new ApiService()

    try {
        // Fetch one extra to determine if there are more pages
        const requestLimit = limit > 0 ? limit + 1 : 0
        console.log(`[Pagination] Request: skip=${skip}, limit=${limit}, requestLimit=${requestLimit}, category=${categoryName}, filters:`, {
            username, title, chatType, platform, minParticipants, maxParticipants, linkedChatUsername, sortBy
        })
        
        const chats = await apiService.getOrchestratorChats(
            skip, 
            requestLimit, 
            writable, 
            categoryName,
            {
                username,
                title,
                chatType,
                platform,
                minParticipants,
                maxParticipants,
                linkedChatUsername,
            },
            sortBy
        )
        
        // Check if there are more results
        const hasMore = limit > 0 && chats.length > limit
        const actualChats = hasMore ? chats.slice(0, limit) : chats
        
        console.log(`[Pagination] Response: returned=${actualChats.length}, hasMore=${hasMore}, fetched=${chats.length}, requestedLimit=${requestLimit}`)
        
        // Return pagination metadata
        const response = {
            chats: actualChats,
            pagination: {
                skip,
                limit,
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
