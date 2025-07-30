"use client"

import { CopyableTrimmedId } from "@/components/copyable-trimmed-id"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ActionResponse,
  BehaviouralArgs,
  BehaviouralResponseContent,
  ForwardMessageArgs,
  ForwardMessageResponseContent,
  JoinGroupArgs,
  JoinGroupResponseContent,
  LeaveGroupArgs,
  LeaveGroupResponseContent,
  ReadMessagesArgs,
  ReadMessagesResponseContent,
  ReplyToMessageArgs,
  ReplyToMessageResponseContent,
  ResolvePhoneArgs,
  ResolvePhoneResponseContent,
  SendMessageArgs,
  SendMessageResponseContent,
  UserInfo,
} from "@lib/api/operator/types.gen"
import { ColumnDef } from "@tanstack/react-table"
import { ClockIcon, FlagIcon } from "lucide-react"
import Image from "next/image"

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

const formatDate = (date: Date, withoutDate: boolean = false) => {
  return date.toLocaleString("en-GB", {
    day: withoutDate ? undefined : "2-digit",
    month: withoutDate ? undefined : "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

interface ActionDataRow {
  index: number
  actionId: string
  actionType: string
  actionArgs: any
  status: string
  error?: string | null
  startTime?: Date | null
  endTime?: Date | null
  duration?: number | null
  responseContent: any
  actionResponse?: ActionResponse
}

interface ActionsListProps {
  scenario: any
}

export function ActionsList({ scenario }: ActionsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_process":
        return "bg-purple-100 text-purple-800"
      case "running":
        return "bg-indigo-100 text-indigo-800"
      case "planned":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-orange-100 text-orange-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      case "read_messages":
        return {
          label: "Read Messages",
          className: "bg-cyan-100 text-cyan-800",
        }
      case "resolve_phone":
        return {
          label: "Resolve Phone",
          className: "bg-pink-50 text-pink-800",
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
    args:
      | BehaviouralArgs
      | SendMessageArgs
      | JoinGroupArgs
      | LeaveGroupArgs
      | ReplyToMessageArgs
      | ForwardMessageArgs
      | ReadMessagesArgs,
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
        if (behaviouralArgs.sync_personal_details) {
          parts.push("Sync Personal Details")
        }
        if (behaviouralArgs.disable_auto_download_media) {
          parts.push("Disable Auto Download Media")
        }
        if (behaviouralArgs.delete_all_active_sessions) {
          parts.push("Delete All Active Sessions")
        }
        if (behaviouralArgs.get_unread_messages) {
          parts.push("Get Unread Messages")
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
            {replyArgs.message_link ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  📎 Message Link
                </Badge>
                <div className="text-sm text-gray-600 truncate max-w-xs" title={replyArgs.message_link}>
                  {replyArgs.message_link}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  💬 Chat Info
                </Badge>
                <ChatInfoDisplay chat={replyArgs.chat} />
              </div>
            )}
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
            {replyArgs.message_info?.message_id && (
              <div className="text-xs text-gray-500">Reply to message: {replyArgs.message_info.message_id}</div>
            )}
          </div>
        )
      }
      case "forward_message": {
        const forwardArgs = args as ForwardMessageArgs
        return (
          <div className="space-y-2">
            {forwardArgs.message_link ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  📎 Message Link
                </Badge>
                <div className="text-sm text-gray-600 truncate max-w-xs" title={forwardArgs.message_link}>
                  {forwardArgs.message_link}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium mb-1">From:</div>
                <ChatInfoDisplay chat={forwardArgs.from_chat} />
              </div>
            )}
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
            {forwardArgs.message_info?.message_id && (
              <div className="text-xs text-gray-500">Message ID: {forwardArgs.message_info.message_id}</div>
            )}
          </div>
        )
      }
      case "read_messages": {
        const readArgs = args as ReadMessagesArgs
        return (
          <div className="space-y-2">
            <ChatInfoDisplay chat={readArgs.chat} />
            <div className="flex flex-col gap-1">
              {readArgs.amount_messages !== undefined && readArgs.amount_messages !== null && (
                <div className="text-sm text-gray-600">Amount: {readArgs.amount_messages} messages</div>
              )}
              {readArgs.read_all_in_end && <div className="text-sm text-gray-600">Read all messages in the end</div>}
            </div>
          </div>
        )
      }
      case "resolve_phone": {
        const resolveArgs = args as ResolvePhoneArgs
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Phone Number:</span> {resolveArgs.phone_number}
            </div>
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
      | ReadMessagesResponseContent
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
                Sent at: {formatDate(new Date(sendContent.message_info.timestamp))}
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
                Replied at: {formatDate(new Date(replyContent.message_info.timestamp))}
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
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              {Object.keys(leaveContent).length > 0
                ? JSON.stringify(leaveContent, null, 2)
                : "No additional information available"}
            </div>
          </div>
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
                Forwarded at: {formatDate(new Date(forwardContent.message_info.timestamp))}
              </div>
            )}
          </div>
        )
      }
      case "behavioural": {
        const behaviouralContent = content as BehaviouralResponseContent
        return (
          <div className="space-y-4">
            {/* Personal Details Sync Status */}
            {behaviouralContent.personal_details_synced !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant={Boolean(behaviouralContent.personal_details_synced) ? "default" : "secondary"}>
                  {Boolean(behaviouralContent.personal_details_synced) ? "✓" : "✗"} Personal Details
                </Badge>
                <span className="text-sm text-gray-600">
                  {Boolean(behaviouralContent.personal_details_synced) ? "Synced" : "Not synced"}
                </span>
              </div>
            )}

            {/* Auto Download Media Status */}
            {behaviouralContent.auto_download_media_disabled !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant={Boolean(behaviouralContent.auto_download_media_disabled) ? "default" : "secondary"}>
                  {Boolean(behaviouralContent.auto_download_media_disabled) ? "✓" : "✗"} Auto Download Media
                </Badge>
                <span className="text-sm text-gray-600">
                  {Boolean(behaviouralContent.auto_download_media_disabled) ? "Disabled" : "Enabled"}
                </span>
              </div>
            )}

            {/* Active Sessions Deletion Status */}
            {behaviouralContent.all_active_sessions_deleted !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant={Boolean(behaviouralContent.all_active_sessions_deleted) ? "default" : "secondary"}>
                  {Boolean(behaviouralContent.all_active_sessions_deleted) ? "✓" : "✗"} Active Sessions
                </Badge>
                <span className="text-sm text-gray-600">
                  {Boolean(behaviouralContent.all_active_sessions_deleted) ? "Deleted" : "Not deleted"}
                </span>
              </div>
            )}

            {/* Available Chats */}
            {behaviouralContent.chats && behaviouralContent.chats.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Available Chats ({behaviouralContent.chats.length}):</div>
                <div className="border rounded-md">
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead className="text-xs font-medium">Name/Title</TableHead>
                          <TableHead className="text-xs font-medium">Type</TableHead>
                          <TableHead className="text-xs font-medium">ID</TableHead>
                          <TableHead className="text-xs font-medium">Members/Subscribers</TableHead>
                          <TableHead className="text-xs font-medium">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {behaviouralContent.chats.map((chat, idx) => (
                          <TableRow key={idx} className="hover:bg-gray-50">
                            <TableCell className="py-2">
                              <div className="font-medium text-sm">{chat.title || chat.name || "Unnamed"}</div>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="outline" className="text-xs">
                                {chat.type || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-xs text-gray-600">{chat.id || "N/A"}</TableCell>
                            <TableCell className="py-2 text-xs text-gray-600">
                              {(() => {
                                if (
                                  chat.type === "Channel" &&
                                  "subscribers" in chat &&
                                  chat.subscribers !== undefined &&
                                  chat.subscribers !== null
                                ) {
                                  return `${chat.subscribers} subscribers`
                                } else if (
                                  chat.type === "Group" &&
                                  "members" in chat &&
                                  chat.members !== undefined &&
                                  chat.members !== null
                                ) {
                                  return `${chat.members} members`
                                }
                                return "N/A"
                              })()}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-gray-600 max-w-xs">
                              <div className="truncate" title={chat.description || "No description"}>
                                {chat.description || "No description"}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Unread Messages */}
            {behaviouralContent.unread_messages && behaviouralContent.unread_messages.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">
                  Unread Messages ({behaviouralContent.unread_messages.length}):
                </div>
                <div className="border rounded-md">
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead className="text-xs font-medium">Chat</TableHead>
                          <TableHead className="text-xs font-medium">Type</TableHead>
                          <TableHead className="text-xs font-medium">Unread Count</TableHead>
                          <TableHead className="text-xs font-medium">Mentions</TableHead>
                          <TableHead className="text-xs font-medium">Reactions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {behaviouralContent.unread_messages.map((chat, idx) => (
                          <TableRow key={idx} className="hover:bg-gray-50">
                            <TableCell className="py-2">
                              <div className="font-medium text-sm">{chat.title || chat.name || "Unnamed"}</div>
                              <div className="text-xs text-gray-500">ID: {chat.id || "N/A"}</div>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="outline" className="text-xs">
                                {chat.type || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-xs text-gray-600">{chat.unread_count || 0}</TableCell>
                            <TableCell className="py-2 text-xs text-gray-600">
                              {chat.unread_mentions_count || 0}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-gray-600">
                              {chat.unread_reactions_count || 0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Current Context */}
            {behaviouralContent.current_context && (
              <div>
                <div className="text-sm font-medium mb-2">Current Context:</div>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <pre className="whitespace-pre-wrap text-xs">
                    {(() => {
                      try {
                        const context = behaviouralContent.current_context
                        return typeof context === "string" ? context : JSON.stringify(context, null, 2)
                      } catch {
                        return String(behaviouralContent.current_context)
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )
      }
      case "read_messages": {
        const readContent = content as ReadMessagesResponseContent
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                ✓ Messages Read
              </Badge>
              <span className="text-sm text-gray-600 font-semibold">{readContent.messages_read} messages read</span>
            </div>
          </div>
        )
      }
      case "resolve_phone": {
        const resolveContent = content as ResolvePhoneResponseContent
        if (resolveContent.error) {
          return <div className="text-sm text-red-600 font-semibold">Error: {resolveContent.error}</div>
        }
        if (resolveContent.user_info) {
          const user: UserInfo = resolveContent.user_info
          return (
            <div className="space-y-1 bg-gray-50 rounded-md p-3 border">
              <div className="font-medium text-gray-800">User Info</div>
              {user.id !== undefined && <div className="text-xs text-gray-600">ID: {user.id}</div>}
              {user.name ? (
                <div className="text-xs text-gray-600">Name: {user.name}</div>
              ) : (
                <div className="text-xs text-gray-600">Name: N/A</div>
              )}
              {user.title && <div className="text-xs text-gray-600">Title: {user.title}</div>}
              {user.subtitle && <div className="text-xs text-gray-600">Subtitle: {user.subtitle}</div>}
            </div>
          )
        }
        return <div className="text-sm text-gray-600">No user info found.</div>
      }
      default:
        return <div className="text-sm text-gray-600">{JSON.stringify(content)}</div>
    }
  }

  // Create data for the DataTable
  const actionsData: ActionDataRow[] = scenario.scenario.actions.map((action: any, index: number) => {
    const actionResponse = scenario.result?.actions_responses?.[index]
    const startTime = actionResponse?.start_time ? new Date(actionResponse.start_time) : null
    const endTime = actionResponse?.end_time ? new Date(actionResponse.end_time) : null

    // Calculate duration with Date objects
    const calculateDuration = (start: Date, end: Date) => {
      try {
        const durationMs = end.getTime() - start.getTime()
        if (durationMs < 0) {
          return null // Invalid duration
        }
        return Math.round(durationMs / 1000)
      } catch (error) {
        return null
      }
    }

    const duration = startTime && endTime ? calculateDuration(startTime, endTime) : null

    return {
      index,
      actionId: actionResponse?.id || action.id || `Action ${index + 1}`,
      actionType: action.type || "",
      actionArgs: action.args,
      status: actionResponse?.status?.status_code || "pending",
      error: actionResponse?.status?.error || null,
      startTime,
      endTime,
      duration,
      responseContent: actionResponse?.content || null,
      actionResponse,
    }
  })

  // Define columns for the DataTable
  const actionColumns: ColumnDef<ActionDataRow>[] = [
    {
      accessorKey: "actionId",
      header: "Action ID",
      size: 150,
      cell: ({ row }) => {
        const action = row.original
        return (
          <div className="text-sm text-gray-600">
            <CopyableTrimmedId id={action.actionId} />
          </div>
        )
      },
    },
    {
      accessorKey: "actionType",
      header: "Type",
      size: 120,
      cell: ({ row }) => {
        const action = row.original
        const actionType = formatActionType(action.actionType)
        return <Badge className={actionType.className}>{actionType.label}</Badge>
      },
    },
    {
      accessorKey: "actionArgs",
      header: "Arguments",
      size: 300,
      cell: ({ row }) => {
        const action = row.original
        return <div className="max-w-xs">{formatActionArgs(action.actionType, action.actionArgs)}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => {
        const action = row.original
        return (
          <div>
            <Badge className={getStatusColor(action.status)}>{action.status}</Badge>
            {action.error && <div className="mt-1 text-xs text-red-600">{action.error}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "timing",
      header: "Timing",
      size: 200,
      cell: ({ row }) => {
        const action = row.original
        return (
          <div className="space-y-2 text-xs">
            {action.startTime && (
              <div className="flex items-center gap-1 text-gray-700">
                <ClockIcon className="h-3 w-3 text-gray-500" />
                <span className="font-medium">Start:</span>
                <span className="text-gray-600">{formatDate(action.startTime, true)}</span>
              </div>
            )}
            {action.endTime && (
              <div className="flex items-center gap-1 text-gray-700">
                <FlagIcon className="h-3 w-3 text-gray-500" />
                <span className="font-medium">End:</span>
                <span className="text-gray-600">{formatDate(action.endTime, true)}</span>
              </div>
            )}
            {action.duration !== null && (
              <div className="flex items-center gap-1 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                <span className="font-medium">Duration:</span>
                <span className="text-blue-600 font-semibold">{action.duration}s</span>
              </div>
            )}
            {!action.startTime && !action.endTime && <div className="text-gray-400 italic">No timing data</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "responseContent",
      header: "Response",
      size: 300,
      cell: ({ row }) => {
        const action = row.original
        return (
          <div className="max-w-xs">
            {action.responseContent && formatResponseContent(action.actionType, action.responseContent)}
          </div>
        )
      },
    },
  ]

  return <DataTable columns={actionColumns} data={actionsData} pageSize={10} />
}

export default ActionsList
