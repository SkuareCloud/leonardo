import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterRead, ChatRead } from "@lib/api/orchestrator";
import { CharactersList } from "../../characters/characters-list";

export function ChatView({ chat, characters }: { chat: ChatRead; characters: CharacterRead[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-sm">{chat.title || "Untitled"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-sm">{chat.username || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Chat ID</label>
              <p className="text-sm font-mono">{chat.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Type & Platform Card */}
        <Card>
          <CardHeader>
            <CardTitle>Type & Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Chat Type</label>
              <div className="mt-1">
                <Badge variant="secondary">{chat.chat_type || "Unknown"}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Platform</label>
              <p className="text-sm">{chat.platform || "Unknown"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Participants</label>
              <p className="text-sm">{chat.participants_count || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <CharactersList characters={characters} />
    </div>
  )
}
