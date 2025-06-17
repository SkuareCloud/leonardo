import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BehaviouralArgs,
  BehaviouralResponseContent,
  ForwardMessageArgs,
  ForwardMessageResponseContent,
  JoinGroupArgs,
  JoinGroupResponseContent,
  LeaveGroupArgs,
  LeaveGroupResponseContent,
  ReplyToMessageArgs,
  ReplyToMessageResponseContent,
  ScenarioWithResult,
  SendMessageArgs,
  SendMessageResponseContent,
} from "@lib/api/operator/types.gen"
import { ServiceClient } from "@lib/service-client"
import { ClockIcon, FlagIcon, SquareArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ReplayScenarioButton } from "./replay-scenario-button"

interface ChatInfoDisplayProps {
  chat: any
  avatarUrl?: string
  subtitle?: string
  subtitleImageUrl?: string
}

const ChatInfoDisplay = ({ chat, avatarUrl, subtitle, subtitleImageUrl }: ChatInfoDisplayProps) => {
  // Fallbacks for avatar and subtitle
  const avatar = undefined
  const name = chat?.name || chat.title || "Unnamed Chat"
  const sub = subtitle || chat.subtitle || undefined
  const subImg = subtitleImageUrl || chat.subtitleImageUrl || undefined
  const membersCount = chat.members_count || chat.subscribers_count || 0

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1 w-48 h-12" style={{ minWidth: 0 }}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden bg-gray-800">
        {avatar ? (
          <Image src={avatar} alt={name} width={24} height={24} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm bg-gray-700">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {/* Name and members count */}
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm text-white truncate leading-tight">{name}</span>
        {chat.members && (
          <span className="text-gray-200/50 text-xs truncate leading-tight">
            {chat.members} {membersCount === 1 ? "member" : "members"}
          </span>
        )}
        {chat.subscribers && (
          <span className="text-gray-200/50 text-xs truncate leading-tight">
            {chat.subscribers} {membersCount === 1 ? "subscriber" : "subscribers"}
          </span>
        )}
      </div>
    </div>
  )
}

const timestampToDate = (timestamp: string) => {
  return formatDate(new Date(parseInt(timestamp) * 1000))
}

const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export default async function ScenarioPage({ params }: { params: { id: string } }) {
  const { id } = params
  if (!id) {
    throw new Error("Scenario ID is required")
  }

  const serviceClient = new ServiceClient()
  const scenario: ScenarioWithResult | null = await serviceClient.getOperatorScenarioById(id)

  if (!scenario) {
    throw new Error("Scenario not found")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const formatActionType = (type: string | undefined) => {
    const actionType = (type || "").toLowerCase()
    switch (actionType) {
      case "behavioral":
        return {
          label: "Behavioral",
          className: "bg-purple-100 text-purple-800",
        }
      case "send":
        return {
          label: "Send Message",
          className: "bg-blue-100 text-blue-800",
        }
      case "receive":
        return {
          label: "Receive Message",
          className: "bg-green-100 text-green-800",
        }
      case "wait":
        return {
          label: "Wait",
          className: "bg-yellow-100 text-yellow-800",
        }
      default:
        return {
          label: type || "Unknown",
          className: "bg-gray-100 text-gray-800",
        }
    }
  }

  const formatActionArgs = (
    type: string,
    args: BehaviouralArgs | SendMessageArgs | JoinGroupArgs | LeaveGroupArgs | ReplyToMessageArgs | ForwardMessageArgs,
  ) => {
    const actionType = type.toLowerCase()
    if (!args) return "No arguments"
    switch (actionType) {
      case "behavioural": {
        const behaviouralArgs = args as BehaviouralArgs
        const parts = []
        if (behaviouralArgs.wait_time !== undefined) {
          parts.push(`Wait: ${behaviouralArgs.wait_time}s`)
        }
        if (behaviouralArgs.sync_context) {
          parts.push("Sync Context")
        }
        if (behaviouralArgs.get_chats) {
          parts.push("Get Chats")
        }
        return parts.length > 0 ? parts.join(", ") : "No specific behavior"
      }
      case "send_message": {
        const sendArgs = args as SendMessageArgs
        return (
          <div className="space-y-2">
            <ChatInfoDisplay chat={sendArgs.chat} />
            <div className="flex items-end gap-2">
              <div
                className="relative bg-purple-400 text-white px-4 py-2 rounded-2xl max-w-xs shadow"
                style={{
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 18,
                  borderBottomLeftRadius: 18,
                  borderBottomRightRadius: 8,
                }}
              >
                <span className="block text-lg font-medium">{sendArgs.input_message_content.text}</span>
              </div>
            </div>
            {sendArgs.input_message_content.attachments && sendArgs.input_message_content.attachments.length > 0 && (
              <div className="mt-2">
                <div className="font-medium">Attachments:</div>
                <ul className="list-disc list-inside">
                  {sendArgs.input_message_content.attachments.map((attachment, idx) => (
                    <li key={idx}>
                      {attachment.name || "Unnamed"} ({attachment.mime_type || "Unknown type"})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      }
      case "join_group": {
        const joinArgs = args as JoinGroupArgs
        return (
          <div className="space-y-2">
            {joinArgs.chat && <ChatInfoDisplay chat={joinArgs.chat} />}
            {joinArgs.join_discussion_group_if_availble && (
              <div className="text-sm text-gray-600">Join discussion group if available</div>
            )}
            {joinArgs.invite_link && <div className="text-sm text-gray-600">Invite Link: {joinArgs.invite_link}</div>}
          </div>
        )
      }
      case "leave_group": {
        const leaveArgs = args as LeaveGroupArgs
        return <ChatInfoDisplay chat={leaveArgs.chat} />
      }
      case "reply_to_message": {
        const replyArgs = args as ReplyToMessageArgs
        return (
          <div className="space-y-2">
            <ChatInfoDisplay chat={replyArgs.chat} />
            <div className="text-sm text-gray-600">
              {replyArgs.input_message_content.text}
              {replyArgs.input_message_content.attachments &&
                replyArgs.input_message_content.attachments.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium">Attachments:</div>
                    <ul className="list-disc list-inside">
                      {replyArgs.input_message_content.attachments.map((attachment, idx) => (
                        <li key={idx}>
                          {attachment.name || "Unnamed"} ({attachment.mime_type || "Unknown type"})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
            {replyArgs.message_info.message_id && (
              <div className="text-xs text-gray-500">Reply to message: {replyArgs.message_info.message_id}</div>
            )}
          </div>
        )
      }
      case "forward_message": {
        const forwardArgs = args as ForwardMessageArgs
        return (
          <div className="space-y-2">
            <div>
              <div className="text-sm font-medium mb-1">From:</div>
              <ChatInfoDisplay chat={forwardArgs.from_chat} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">To:</div>
              <ChatInfoDisplay chat={forwardArgs.target_chat} />
            </div>
            {forwardArgs.message && (
              <div className="text-sm text-gray-600">
                {forwardArgs.message.text}
                {forwardArgs.message.attachments && forwardArgs.message.attachments.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium">Attachments:</div>
                    <ul className="list-disc list-inside">
                      {forwardArgs.message.attachments.map((attachment, idx) => (
                        <li key={idx}>
                          {attachment.name || "Unnamed"} ({attachment.mime_type || "Unknown type"})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {forwardArgs.message_info.message_id && (
              <div className="text-xs text-gray-500">Message ID: {forwardArgs.message_info.message_id}</div>
            )}
          </div>
        )
      }
      default:
        return JSON.stringify(args)
    }
  }

  const formatResponseContent = (
    type: string,
    content:
      | SendMessageResponseContent
      | ReplyToMessageResponseContent
      | LeaveGroupResponseContent
      | JoinGroupResponseContent
      | ForwardMessageResponseContent
      | BehaviouralResponseContent
      | null,
  ) => {
    if (!content) return null

    const actionType = type.toLowerCase()
    switch (actionType) {
      case "send_message": {
        const sendContent = content as SendMessageResponseContent
        return (
          <div className="space-y-2">
            {sendContent.message_info.timestamp && (
              <div className="text-sm text-gray-600 font-bold">
                Sent at: {timestampToDate(sendContent.message_info.timestamp)}
              </div>
            )}
            {sendContent.message_info.message_id && (
              <div className="text-sm text-gray-600">Message ID: {sendContent.message_info.message_id}</div>
            )}
            {sendContent.message_info.peer_id && (
              <div className="text-sm text-gray-600">Peer ID: {sendContent.message_info.peer_id}</div>
            )}
            {sendContent.message_info.from_id && (
              <div className="text-sm text-gray-600">From ID: {sendContent.message_info.from_id}</div>
            )}
          </div>
        )
      }
      case "reply_to_message": {
        const replyContent = content as ReplyToMessageResponseContent
        return (
          <div className="space-y-2">
            {replyContent.message_info.message_id && (
              <div className="text-sm text-gray-600">Reply Message ID: {replyContent.message_info.message_id}</div>
            )}
            {replyContent.message_info.timestamp && (
              <div className="text-sm text-gray-600">
                Replied at: {new Date(replyContent.message_info.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        )
      }
      case "join_group": {
        const joinContent = content as JoinGroupResponseContent
        return (
          <div className="space-y-2">
            {joinContent.chat_info && <ChatInfoDisplay chat={joinContent.chat_info} />}
            {joinContent.discussion_group_chat_info && (
              <div>
                <div className="text-sm font-medium mb-1">Discussion Group:</div>
                <ChatInfoDisplay chat={joinContent.discussion_group_chat_info} />
              </div>
            )}
          </div>
        )
      }
      case "leave_group": {
        const leaveContent = content as LeaveGroupResponseContent
        return (
          <div className="space-y-2">{leaveContent.chat_info && <ChatInfoDisplay chat={leaveContent.chat_info} />}</div>
        )
      }
      case "forward_message": {
        const forwardContent = content as ForwardMessageResponseContent
        return (
          <div className="space-y-2">
            {forwardContent.message_info.message_id && (
              <div className="text-sm text-gray-600">
                Forwarded Message ID: {forwardContent.message_info.message_id}
              </div>
            )}
            {forwardContent.message_info.timestamp && (
              <div className="text-sm text-gray-600">
                Forwarded at: {new Date(forwardContent.message_info.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        )
      }
      case "behavioural": {
        const behaviouralContent = content as BehaviouralResponseContent
        return (
          <div className="space-y-2">
            {behaviouralContent.chats && behaviouralContent.chats.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Available Chats:</div>
                <div className="space-y-2">
                  {behaviouralContent.chats.map((chat, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      <div>Peer ID: {chat.peer_id}</div>
                      <div>Unread Messages: {chat.unread_count}</div>
                      <div>Unread Mentions: {chat.unread_mentions_count}</div>
                      <div>Unread Reactions: {chat.unread_reactions_count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Current Context:</div>
                <div className="text-sm text-gray-600">
                  {JSON.stringify(behaviouralContent.current_context, null, 2)}
                </div>
              </div>
            }
          </div>
        )
      }
      default:
        return <div className="text-sm text-gray-600">{JSON.stringify(content)}</div>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title={`Scenario ${scenario.scenario.id}`}
          subtitle={
            <Link href={`/avatars/avatars?id=${scenario.scenario.profile.id}`}>
              <div className="flex text-sm text-gray-600 flex-row gap-2 my-2">
                <b>Profile ID:</b> <span className="underline">{scenario.scenario.profile.id}</span>{" "}
                <SquareArrowUpRightIcon className="size-4" />
              </div>
            </Link>
          }
        ></PageHeader>
        <div className="flex gap-2">
          <ReplayScenarioButton scenario={scenario.scenario} />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Status</CardTitle>
              <CardDescription>Current status and progress of the scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={`text-lg ${getStatusColor(scenario.result?.status.status_code || "pending")}`}
                >
                  {(scenario.result?.status.status_code || "pending").charAt(0).toUpperCase() +
                    (scenario.result?.status.status_code || "pending").slice(1)}
                </Badge>
                <div className="flex flex-col gap-2">
                  {scenario.result?.scenario_info.start_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Started:</span>
                      </div>
                      <span className="text-gray-700">
                        {formatDate(new Date(scenario.result.scenario_info.start_time))}
                      </span>
                    </div>
                  )}
                  {scenario.result?.scenario_info.end_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <FlagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Ended:</span>
                      </div>
                      <span className="text-gray-700">
                        {formatDate(new Date(scenario.result.scenario_info.end_time))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {scenario.result?.status.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm font-medium text-red-800">Error:</div>
                  <div className="text-sm text-red-600 mt-1">{scenario.result.status.error}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(scenario.scenario.prefrences).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">
                      {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="font-medium">{value?.toString() ?? "N/A"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scenario Actions</CardTitle>
            <CardDescription>List of actions in this scenario</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Arguments</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenario.scenario.actions.map((action, index) => {
                  const actionType = formatActionType(action.type)
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge className={actionType.className}>{actionType.label}</Badge>
                      </TableCell>
                      <TableCell>{formatActionArgs(action.type || "", action.args)}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(
                            scenario.result?.actions_responses[index]?.status.status_code || "pending",
                          )}
                        >
                          {scenario.result?.actions_responses[index]?.status.status_code || "pending"}
                        </Badge>
                        {scenario.result?.actions_responses[index]?.content && (
                          <div className="mt-2">
                            {formatResponseContent(
                              scenario.result.actions_responses[index].type,
                              scenario.result.actions_responses[index].content,
                            )}
                          </div>
                        )}
                        {scenario.result?.actions_responses[index]?.status.error && (
                          <div className="mt-2 text-sm text-red-600">
                            {scenario.result.actions_responses[index].status.error}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {scenario.scenario.actions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No actions in this scenario yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
