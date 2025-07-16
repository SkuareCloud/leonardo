import { NextRequest } from "next/server";
import { ApiService } from "../../lib/api_service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const characterId = searchParams.get("character_id")
  const operation = searchParams.get("operation")

  const apiService = new ApiService()

  // Get character categories
  if (characterId && operation === "categories") {
    const categories = await apiService.getCharacterCategories(characterId);
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
    });
  }

  // Default: get all characters
  const characters = await apiService.getOrchestratorCharacters();
  return new Response(JSON.stringify(characters), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const characterId = searchParams.get("character_id")
  const operation = searchParams.get("operation")

  if (!characterId || !operation) {
    return new Response(JSON.stringify({ error: "character_id and operation are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiService = new ApiService()
  const body = await request.json()

  try {
    if (operation === "add_category") {
      const { categoryId } = body
      if (!categoryId) {
        return new Response(JSON.stringify({ error: "categoryId is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await apiService.addCharacterToCategory(characterId, categoryId);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid operation" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Character category operation failed:", error);
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const characterId = searchParams.get("character_id")
  const operation = searchParams.get("operation")

  if (!characterId || !operation) {
    return new Response(JSON.stringify({ error: "character_id and operation are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiService = new ApiService()
  const body = await request.json()

  try {
    if (operation === "remove_category") {
      const { categoryId } = body
      if (!categoryId) {
        return new Response(JSON.stringify({ error: "categoryId is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await apiService.removeCharacterFromCategory(characterId, categoryId);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid operation" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Character category operation failed:", error);
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
