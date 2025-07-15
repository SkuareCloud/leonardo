"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { Attachment, Scenario } from "@lib/api/operator/types.gen"
import { logger } from "@lib/logger"
import { useOperatorStore } from "@lib/store-provider"
import { ChevronDown, PlusIcon, Search, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type ActionType =
  | "send_message"
  | "send_bulk_messages"
  | "join_group"
  | "leave_group"
  | "reply_to_message"
  | "forward_message"
  | "behavioural"
  | "read_messages"

interface ActionFormData {
  type: ActionType
  args: any
}

interface ElizaCharacter {
  name: string
  [key: string]: unknown
}

interface AvatarData {
  eliza_character?: ElizaCharacter
  [key: string]: unknown
}

interface AvatarModel {
  id: string
  data: AvatarData
  [key: string]: unknown
}

interface ScenarioFormProps {
  avatars: AvatarModelWithProxy[]
  initialScenario?: Scenario
}

export function ScenarioForm({ avatars: avatarsProp, initialScenario }: ScenarioFormProps) {
  const [avatars, setAvatars] = useState<AvatarModelWithProxy[]>(avatarsProp)
  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialScenario?.profile?.id || "")
  const [actions, setActions] = useState<ActionFormData[]>(
    initialScenario?.actions.map(action => ({
      type: action.type as ActionType,
      args: action.args,
    })) || [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarSearch, setAvatarSearch] = useState("")
  const router = useRouter()
  const [preferences, setPreferences] = useState(
    initialScenario?.prefrences || {
      actions_timeout: 0,
      action_interval: 0,
      close_browser_when_finished: false,
      should_login_telegram: false,
      verify_proxy_working: true,
      fail_fast: false,
    },
  )
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const operatorSlot = useOperatorStore(state => state.operatorSlot)
  useEffect(() => {
    if (initialScenario && avatars.length == 0) {
      setAvatars([
        {
          id: initialScenario.profile?.id || "",
          data: {
            eliza_character: {
              name: "<NAME MISSING NOW>",
            },
          },
          pir_id: "",
          home_continent_code: "",
          home_iso_3166_1_alpha_2_code: "",
          home_iso_3166_2_subdivision_code: "",
          home_city: "",
          proxy: null,
        },
      ])
    }
  }, [])

  // Filter avatars based on search term
  const filteredAvatars = useMemo(() => {
    if (!avatarSearch.trim()) return avatars

    const searchTerm = avatarSearch.toLowerCase()
    return avatars.filter(avatar => {
      const avatarName = (avatar.data.eliza_character as any)?.name || ""
      const avatarId = avatar.id

      return avatarName.toLowerCase().includes(searchTerm) || avatarId.toLowerCase().includes(searchTerm)
    })
  }, [avatars, avatarSearch])

  const addAction = () => {
    setActions([...actions, { type: "send_message", args: {} }])
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, updates: Partial<ActionFormData>) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], ...updates }
    setActions(newActions)
  }

  const validateChatId = (value: string): boolean => {
    // Allow empty string (since name might be provided instead)
    if (!value) return true
    // Check if it's a valid number (positive or negative)
    return /^-?\d+$/.test(value)
  }

  const handleChatIdChange = (index: number, value: string, field: "chat" | "from_chat" | "target_chat") => {
    if (!validateChatId(value)) return

    updateAction(index, {
      args: {
        ...actions[index].args,
        [field]: {
          ...actions[index].args[field],
          id: value,
        },
      },
    })
  }

  const handleSubmit = async () => {
    if (!selectedAvatar) {
      toast.error("Please select an avatar")
      return
    }

    if (actions.length === 0) {
      toast.error("Please add at least one action")
      return
    }

    // Validate chat inputs
    for (const action of actions) {
      if (
        action.type === "send_message" ||
        action.type === "send_bulk_messages" ||
        action.type === "join_group" ||
        action.type === "leave_group" ||
        action.type === "read_messages"
      ) {
        if (action.args.chat && !action.args.chat?.id && !action.args.chat?.name) {
          toast.error("Please provide either Chat ID or Chat Name")
          return
        }
      } else if (action.type === "reply_to_message") {
        if (action.args.message_link === undefined) {
          // Using chat info method
          if (!action.args.chat?.id && !action.args.chat?.name) {
            toast.error("Please provide either Chat ID or Chat Name")
            return
          }
        } else {
          // Using message link method
          if (!action.args.message_link) {
            toast.error("Please provide a message link")
            return
          }
        }
      } else if (action.type === "forward_message") {
        if (action.args.message_link === undefined) {
          // Using chat info method
          if (!action.args.from_chat?.id && !action.args.from_chat?.name) {
            toast.error("Please provide either From Chat ID or From Chat Name")
            return
          }
        } else {
          // Using message link method
          if (!action.args.message_link) {
            toast.error("Please provide a message link")
            return
          }
        }
        if (!action.args.target_chat?.id && !action.args.target_chat?.name) {
          toast.error("Please provide either Target Chat ID or Target Chat Name")
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      const scenario: Scenario = {
        profile: { id: selectedAvatar },
        prefrences: preferences,
        actions: actions.map(action => ({
          type: action.type,
          args: action.args,
        })),
      }
      const response = await fetch(`/api/operator/${operatorSlot}/scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scenario),
      })

      if (!response.ok) {
        toast.error("Failed to create scenario")
        logger.error(response)
        return
      }

      const newScenario: Scenario = await response.json()

      toast.success("Scenario created successfully")

      router.push(`/operator/scenarios/${newScenario.id}`)
    } catch (error) {
      toast.error("Failed to create scenario")
      logger.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Label htmlFor="avatar">Select Avatar</Label>
        <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
          <SelectTrigger>
            <SelectValue placeholder="Select an avatar" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={avatarSearch}
                  onChange={e => setAvatarSearch(e.target.value)}
                  onKeyDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredAvatars.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">No avatars found</div>
              ) : (
                filteredAvatars.map(avatar => (
                  <SelectItem key={avatar.id} value={avatar.id}>
                    <div className="flex flex-col">
                      <span>{(avatar.data.eliza_character as any)?.name || "Unknown Avatar"}</span>
                      <span className="text-xs text-muted-foreground">ID: {avatar.id}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </div>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Collapsible open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <Label>Preferences</Label>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isPreferencesOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mt-2">
              <div className="flex flex-col gap-2">
                <Label>Actions Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={preferences.actions_timeout || 0}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      actions_timeout: parseInt(e.target.value) || 300,
                    })
                  }
                  placeholder="Enter actions timeout"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Action Interval (seconds)</Label>
                <Input
                  type="number"
                  value={preferences.action_interval || 0}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      action_interval: parseInt(e.target.value) || 2,
                    })
                  }
                  placeholder="Enter action interval"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="close-browser"
                  checked={preferences.close_browser_when_finished || false}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      close_browser_when_finished: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="close-browser">Close browser when finished</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="login-telegram"
                  checked={preferences.should_login_telegram || false}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      should_login_telegram: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="login-telegram">Login to Telegram</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verify-proxy"
                  checked={preferences.verify_proxy_working || false}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      verify_proxy_working: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="verify-proxy">Verify proxy working</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fail-fast"
                  checked={preferences.fail_fast || false}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      fail_fast: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="fail-fast">Fail fast</Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Actions</Label>
          <Button variant="outline" size="sm" onClick={addAction}>
            <PlusIcon className="h-4 w-4" />
            Add Action
          </Button>
        </div>

        {actions.map((action, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <Label>Action {index + 1}</Label>
              <Button variant="ghost" size="sm" onClick={() => removeAction(index)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select
                  value={action.type}
                  onValueChange={(value: ActionType) => updateAction(index, { type: value, args: {} })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_message">Send Message</SelectItem>
                    <SelectItem value="send_bulk_messages">Send Bulk Messages</SelectItem>
                    <SelectItem value="join_group">Join Group</SelectItem>
                    <SelectItem value="leave_group">Leave Group</SelectItem>
                    <SelectItem value="reply_to_message">Reply to Message</SelectItem>
                    <SelectItem value="forward_message">Forward Message</SelectItem>
                    <SelectItem value="behavioural">Behavioural</SelectItem>
                    <SelectItem value="read_messages">Read Messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action.type === "send_message" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      Chat <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={action.args.chat?.id || ""}
                        onChange={e => handleChatIdChange(index, e.target.value, "chat")}
                        placeholder="Chat ID (number)"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                      <Input
                        value={action.args.chat?.name || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              chat: { ...action.args.chat, name: e.target.value },
                            },
                          })
                        }
                        placeholder="Chat Name"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                    </div>
                    {!action.args.chat?.id && !action.args.chat?.name && (
                      <p className="text-sm text-red-500">Please provide either Chat ID or Chat Name</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Message</Label>
                    <Input
                      value={action.args.input_message_content?.text || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            input_message_content: {
                              ...action.args.input_message_content,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter message content"
                    />
                    <div className="flex flex-col gap-2">
                      <Label>Attachments</Label>
                      <div className="space-y-2">
                        {(action.args.input_message_content?.attachments || []).map(
                          (attachment: Attachment, attIndex: number) => (
                            <div key={attIndex} className="flex gap-2 items-center">
                              <Input
                                value={attachment.url}
                                onChange={e => {
                                  const newAttachments = [...(action.args.input_message_content?.attachments || [])]
                                  newAttachments[attIndex] = {
                                    ...newAttachments[attIndex],
                                    url: e.target.value,
                                  }
                                  updateAction(index, {
                                    args: {
                                      ...action.args,
                                      input_message_content: {
                                        ...action.args.input_message_content,
                                        attachments: newAttachments,
                                      },
                                    },
                                  })
                                }}
                                placeholder="Attachment URL"
                              />
                              <Input
                                value={attachment.name || ""}
                                onChange={e => {
                                  const newAttachments = [...(action.args.input_message_content?.attachments || [])]
                                  newAttachments[attIndex] = {
                                    ...newAttachments[attIndex],
                                    name: e.target.value,
                                  }
                                  updateAction(index, {
                                    args: {
                                      ...action.args,
                                      input_message_content: {
                                        ...action.args.input_message_content,
                                        attachments: newAttachments,
                                      },
                                    },
                                  })
                                }}
                                placeholder="Attachment Name (optional)"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newAttachments = [...(action.args.input_message_content?.attachments || [])]
                                  newAttachments.splice(attIndex, 1)
                                  updateAction(index, {
                                    args: {
                                      ...action.args,
                                      input_message_content: {
                                        ...action.args.input_message_content,
                                        attachments: newAttachments,
                                      },
                                    },
                                  })
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ),
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateAction(index, {
                              args: {
                                ...action.args,
                                input_message_content: {
                                  ...action.args.input_message_content,
                                  attachments: [
                                    ...(action.args.input_message_content?.attachments || []),
                                    { url: "", name: null, mime_type: null },
                                  ],
                                },
                              },
                            })
                          }}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Attachment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {action.type === "send_bulk_messages" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      Chat <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={action.args.chat?.id || ""}
                        onChange={e => handleChatIdChange(index, e.target.value, "chat")}
                        placeholder="Chat ID (number)"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                      <Input
                        value={action.args.chat?.name || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              chat: { ...action.args.chat, name: e.target.value },
                            },
                          })
                        }
                        placeholder="Chat Name"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                    </div>
                    {!action.args.chat?.id && !action.args.chat?.name && (
                      <p className="text-sm text-red-500">Please provide either Chat ID or Chat Name</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Messages (one per line)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      value={action.args.messages?.join("\n") || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            messages: e.target.value.split("\n").filter(Boolean),
                          },
                        })
                      }
                      placeholder="Enter messages, one per line"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={action.args.interval || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            interval: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="Enter interval between messages"
                    />
                  </div>
                </div>
              )}

              {action.type === "join_group" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Join Method</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`join-method-chat-${index}`}
                          name={`join-method-${index}`}
                          checked={action.args.invite_link === undefined}
                          onChange={() =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                invite_link: undefined,
                                chat: action.args.chat || {},
                              },
                            })
                          }
                        />
                        <Label htmlFor={`join-method-chat-${index}`}>Chat Info</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`join-method-invite-${index}`}
                          name={`join-method-${index}`}
                          checked={action.args.invite_link !== undefined}
                          onChange={() =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                chat: undefined,
                                invite_link: action.args.invite_link || "",
                              },
                            })
                          }
                        />
                        <Label htmlFor={`join-method-invite-${index}`}>Invite Link</Label>
                      </div>
                    </div>
                  </div>

                  {action.args.invite_link === undefined ? (
                    <div className="flex flex-col gap-2">
                      <Label>
                        Chat <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="-?[0-9]*"
                          value={action.args.chat?.id || ""}
                          onChange={e => handleChatIdChange(index, e.target.value, "chat")}
                          placeholder="Chat ID (number)"
                          className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                        />
                        <Input
                          value={action.args.chat?.name || ""}
                          onChange={e =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                chat: { ...action.args.chat, name: e.target.value },
                              },
                            })
                          }
                          placeholder="Chat Name"
                          className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                        />
                      </div>
                      {!action.args.chat?.id && !action.args.chat?.name && (
                        <p className="text-sm text-red-500">Please provide either Chat ID or Chat Name</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label>
                        Invite Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={action.args.invite_link || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              invite_link: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter invite link"
                        className={!action.args.invite_link ? "border-red-500" : ""}
                      />
                      {!action.args.invite_link && (
                        <p className="text-sm text-red-500">Please provide an invite link</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`join-discussion-${index}`}
                      checked={action.args.join_discussion_group_if_availble || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            join_discussion_group_if_availble: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`join-discussion-${index}`}>Join discussion group if available</Label>
                  </div>
                </div>
              )}

              {action.type === "leave_group" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      Chat <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={action.args.chat?.id || ""}
                        onChange={e => handleChatIdChange(index, e.target.value, "chat")}
                        placeholder="Chat ID (number)"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                      <Input
                        value={action.args.chat?.name || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              chat: { ...action.args.chat, name: e.target.value },
                            },
                          })
                        }
                        placeholder="Chat Name"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                    </div>
                    {!action.args.chat?.id && !action.args.chat?.name && (
                      <p className="text-sm text-red-500">Please provide either Chat ID or Chat Name</p>
                    )}
                  </div>
                </div>
              )}

              {action.type === "reply_to_message" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Reply Method</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`reply-method-chat-${index}`}
                          name={`reply-method-${index}`}
                          checked={action.args.message_link === undefined}
                          onChange={() =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                message_link: undefined,
                                chat: action.args.chat || {},
                              },
                            })
                          }
                        />
                        <Label htmlFor={`reply-method-chat-${index}`}>Chat Info</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`reply-method-link-${index}`}
                          name={`reply-method-${index}`}
                          checked={action.args.message_link !== undefined}
                          onChange={() =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                chat: undefined,
                                message_info: undefined,
                                message_link: action.args.message_link || "",
                              },
                            })
                          }
                        />
                        <Label htmlFor={`reply-method-link-${index}`}>Message Link</Label>
                      </div>
                    </div>
                  </div>

                  {action.args.message_link === undefined ? (
                    <div className="flex flex-col gap-2">
                      <Label>
                        Chat <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="-?[0-9]*"
                          value={action.args.chat?.id || ""}
                          onChange={e => handleChatIdChange(index, e.target.value, "chat")}
                          placeholder="Chat ID (number)"
                          className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                        />
                        <Input
                          value={action.args.chat?.name || ""}
                          onChange={e =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                chat: { ...action.args.chat, name: e.target.value },
                              },
                            })
                          }
                          placeholder="Chat Name"
                          className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                        />
                      </div>
                      {!action.args.chat?.id && !action.args.chat?.name && (
                        <p className="text-sm text-red-500">Please provide either Chat ID or Chat Name</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label>
                        Message Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={action.args.message_link || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              message_link: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter message link"
                        className={!action.args.message_link ? "border-red-500" : ""}
                      />
                      {!action.args.message_link && (
                        <p className="text-sm text-red-500">Please provide a message link</p>
                      )}
                    </div>
                  )}

                  {action.args.message_link === undefined && (
                    <div className="flex flex-col gap-2">
                      <Label>Message Info</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <Label>Message ID</Label>
                          <Input
                            value={action.args.message_info?.message_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    message_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter message ID"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Timestamp</Label>
                          <Input
                            type="text"
                            value={action.args.message_info?.timestamp || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    timestamp: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter timestamp"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Peer ID</Label>
                          <Input
                            value={action.args.message_info?.peer_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    peer_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter peer ID"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>From ID</Label>
                          <Input
                            value={action.args.message_info?.from_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    from_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter from ID"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Text Hash</Label>
                          <Input
                            value={action.args.message_info?.text_hash || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    text_hash: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter text hash"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Viewer ID</Label>
                          <Input
                            value={action.args.message_info?.viewer_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    viewer_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter viewer ID"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label>Reply Message</Label>
                    <Input
                      value={action.args.input_message_content?.text || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            input_message_content: {
                              ...action.args.input_message_content,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter reply message"
                    />
                    <div className="flex flex-col gap-2">
                      <Label>Attachments</Label>
                      <div className="space-y-2">
                        {(action.args.input_message_content?.attachments || []).map(
                          (attachment: Attachment, attIndex: number) => (
                            <div key={attIndex} className="flex gap-2 items-center">
                              <Input
                                value={attachment.url}
                                onChange={e => {
                                  const newAttachments = [...(action.args.input_message_content?.attachments || [])]
                                  newAttachments[attIndex] = {
                                    ...newAttachments[attIndex],
                                    url: e.target.value,
                                  }
                                  updateAction(index, {
                                    args: {
                                      ...action.args,
                                      input_message_content: {
                                        ...action.args.input_message_content,
                                        attachments: newAttachments,
                                      },
                                    },
                                  })
                                }}
                                placeholder="Attachment URL"
                              />
                              <Input
                                value={attachment.name || ""}
                                onChange={e => {
                                  const newAttachments = [...(action.args.input_message_content?.attachments || [])]
                                  newAttachments[attIndex] = {
                                    ...newAttachments[attIndex],
                                    name: e.target.value,
                                  }
                                  updateAction(index, {
                                    args: {
                                      ...action.args,
                                      input_message_content: {
                                        ...action.args.input_message_content,
                                        attachments: newAttachments,
                                      },
                                    },
                                  })
                                }}
                                placeholder="Attachment Name (optional)"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newAttachments = [...(action.args.input_message_content?.attachments || [])]
                                  newAttachments.splice(attIndex, 1)
                                  updateAction(index, {
                                    args: {
                                      ...action.args,
                                      input_message_content: {
                                        ...action.args.input_message_content,
                                        attachments: newAttachments,
                                      },
                                    },
                                  })
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ),
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateAction(index, {
                              args: {
                                ...action.args,
                                input_message_content: {
                                  ...action.args.input_message_content,
                                  attachments: [
                                    ...(action.args.input_message_content?.attachments || []),
                                    { url: "", name: null, mime_type: null },
                                  ],
                                },
                              },
                            })
                          }}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Attachment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {action.type === "forward_message" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Forward Method</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`forward-method-chat-${index}`}
                          name={`forward-method-${index}`}
                          checked={action.args.message_link === undefined}
                          onChange={() =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                message_link: undefined,
                                from_chat: action.args.from_chat || {},
                              },
                            })
                          }
                        />
                        <Label htmlFor={`forward-method-chat-${index}`}>Chat Info</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`forward-method-link-${index}`}
                          name={`forward-method-${index}`}
                          checked={action.args.message_link !== undefined}
                          onChange={() =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                from_chat: undefined,
                                message_info: undefined,
                                message_link: action.args.message_link || "",
                              },
                            })
                          }
                        />
                        <Label htmlFor={`forward-method-link-${index}`}>Message Link</Label>
                      </div>
                    </div>
                  </div>

                  {action.args.message_link === undefined ? (
                    <div className="flex flex-col gap-2">
                      <Label>
                        From Chat <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="-?[0-9]*"
                          value={action.args.from_chat?.id || ""}
                          onChange={e => handleChatIdChange(index, e.target.value, "from_chat")}
                          placeholder="Chat ID (number)"
                          className={!action.args.from_chat?.id && !action.args.from_chat?.name ? "border-red-500" : ""}
                        />
                        <Input
                          value={action.args.from_chat?.name || ""}
                          onChange={e =>
                            updateAction(index, {
                              args: {
                                ...action.args,
                                from_chat: {
                                  ...action.args.from_chat,
                                  name: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Chat Name"
                          className={!action.args.from_chat?.id && !action.args.from_chat?.name ? "border-red-500" : ""}
                        />
                      </div>
                      {!action.args.from_chat?.id && !action.args.from_chat?.name && (
                        <p className="text-sm text-red-500">Please provide either From Chat ID or From Chat Name</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label>
                        Message Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={action.args.message_link || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              message_link: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter message link"
                        className={!action.args.message_link ? "border-red-500" : ""}
                      />
                      {!action.args.message_link && (
                        <p className="text-sm text-red-500">Please provide a message link</p>
                      )}
                    </div>
                  )}

                  {action.args.message_link === undefined && (
                    <div className="flex flex-col gap-2">
                      <Label>Message Info</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <Label>Message ID</Label>
                          <Input
                            value={action.args.message_info?.message_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    message_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter message ID"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Timestamp</Label>
                          <Input
                            type="text"
                            value={action.args.message_info?.timestamp || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    timestamp: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter timestamp"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Peer ID</Label>
                          <Input
                            value={action.args.message_info?.peer_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    peer_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter peer ID"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>From ID</Label>
                          <Input
                            value={action.args.message_info?.from_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    from_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter from ID"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Text Hash</Label>
                          <Input
                            value={action.args.message_info?.text_hash || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    text_hash: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter text hash"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Viewer ID</Label>
                          <Input
                            value={action.args.message_info?.viewer_id || ""}
                            onChange={e =>
                              updateAction(index, {
                                args: {
                                  ...action.args,
                                  message_info: {
                                    ...action.args.message_info,
                                    viewer_id: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Enter viewer ID"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label>
                      Target Chat <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={action.args.target_chat?.id || ""}
                        onChange={e => handleChatIdChange(index, e.target.value, "target_chat")}
                        placeholder="Chat ID (number)"
                        className={
                          !action.args.target_chat?.id && !action.args.target_chat?.name ? "border-red-500" : ""
                        }
                      />
                      <Input
                        value={action.args.target_chat?.name || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              target_chat: {
                                ...action.args.target_chat,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Chat Name"
                        className={
                          !action.args.target_chat?.id && !action.args.target_chat?.name ? "border-red-500" : ""
                        }
                      />
                    </div>
                    {!action.args.target_chat?.id && !action.args.target_chat?.name && (
                      <p className="text-sm text-red-500">Please provide either Target Chat ID or Target Chat Name</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Additional Message (optional)</Label>
                    <Input
                      value={action.args.message?.text || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            message: {
                              ...action.args.message,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter additional message"
                    />
                    <div className="mt-2">
                      <Label>Attachments</Label>
                      <div className="space-y-2">
                        {(action.args.message?.attachments || []).map((attachment: Attachment, attIndex: number) => (
                          <div key={attIndex} className="flex gap-2 items-center">
                            <Input
                              value={attachment.url}
                              onChange={e => {
                                const newAttachments = [...(action.args.message?.attachments || [])]
                                newAttachments[attIndex] = {
                                  ...newAttachments[attIndex],
                                  url: e.target.value,
                                }
                                updateAction(index, {
                                  args: {
                                    ...action.args,
                                    message: {
                                      ...action.args.message,
                                      attachments: newAttachments,
                                    },
                                  },
                                })
                              }}
                              placeholder="Attachment URL"
                            />
                            <Input
                              value={attachment.name || ""}
                              onChange={e => {
                                const newAttachments = [...(action.args.message?.attachments || [])]
                                newAttachments[attIndex] = {
                                  ...newAttachments[attIndex],
                                  name: e.target.value,
                                }
                                updateAction(index, {
                                  args: {
                                    ...action.args,
                                    message: {
                                      ...action.args.message,
                                      attachments: newAttachments,
                                    },
                                  },
                                })
                              }}
                              placeholder="Attachment Name (optional)"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newAttachments = [...(action.args.message?.attachments || [])]
                                newAttachments.splice(attIndex, 1)
                                updateAction(index, {
                                  args: {
                                    ...action.args,
                                    message: {
                                      ...action.args.message,
                                      attachments: newAttachments,
                                    },
                                  },
                                })
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateAction(index, {
                              args: {
                                ...action.args,
                                message: {
                                  ...action.args.message,
                                  attachments: [
                                    ...(action.args.message?.attachments || []),
                                    { url: "", name: null, mime_type: null },
                                  ],
                                },
                              },
                            })
                          }}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Attachment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {action.type === "behavioural" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>Wait Time (seconds)</Label>
                    <Input
                      type="number"
                      value={action.args.wait_time || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            wait_time: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="Enter wait time in seconds"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`sync-context-${index}`}
                      checked={action.args.sync_context || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            sync_context: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`sync-context-${index}`}>Sync Context</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`get-chats-${index}`}
                      checked={action.args.get_chats || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            get_chats: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`get-chats-${index}`}>Get Chats</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`sync-personal-details-${index}`}
                      checked={action.args.sync_personal_details || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            sync_personal_details: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`sync-personal-details-${index}`}>Sync Personal Details</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`disable-auto-download-media-${index}`}
                      checked={action.args.disable_auto_download_media || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            disable_auto_download_media: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`disable-auto-download-media-${index}`}>Disable Auto Download Media</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`delete-all-active-sessions-${index}`}
                      checked={action.args.delete_all_active_sessions || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            delete_all_active_sessions: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`delete-all-active-sessions-${index}`}>Delete All Active Sessions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`get-unread-messages-${index}`}
                      checked={action.args.get_unread_messages || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            get_unread_messages: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`get-unread-messages-${index}`}>Get Unread Messages</Label>
                  </div>
                </div>
              )}

              {action.type === "read_messages" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      Chat <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={action.args.chat?.id || ""}
                        onChange={e => handleChatIdChange(index, e.target.value, "chat")}
                        placeholder="Chat ID (number)"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                      <Input
                        value={action.args.chat?.name || ""}
                        onChange={e =>
                          updateAction(index, {
                            args: {
                              ...action.args,
                              chat: { ...action.args.chat, name: e.target.value },
                            },
                          })
                        }
                        placeholder="Chat Name"
                        className={!action.args.chat?.id && !action.args.chat?.name ? "border-red-500" : ""}
                      />
                    </div>
                    {!action.args.chat?.id && !action.args.chat?.name && (
                      <p className="text-sm text-red-500">Please provide either Chat ID or Chat Name</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Amount of Messages</Label>
                    <Input
                      type="number"
                      value={action.args.amount_messages || ""}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            amount_messages: parseInt(e.target.value) || null,
                          },
                        })
                      }
                      placeholder="Enter number of messages to read (optional)"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`read-all-in-end-${index}`}
                      checked={action.args.read_all_in_end || false}
                      onChange={e =>
                        updateAction(index, {
                          args: {
                            ...action.args,
                            read_all_in_end: e.target.checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor={`read-all-in-end-${index}`}>Read all messages in the end</Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Scenario"}
        </Button>
      </div>
    </div>
  )
}
