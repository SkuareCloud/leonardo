import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { client as operatorClient } from "@lib/api/operator/client.gen";
import { getScenarioByIdScenarioScenarioScenarioIdGet } from "@lib/api/operator/sdk.gen";
import {
  SendMessageArgs,
  JoinGroupArgs,
  LeaveGroupArgs,
  ReplyToMessageArgs,
  ForwardMessageArgs,
  BehaviouralArgs,
  ChatInfo,
  SendMessageResponseContent,
  ReplyToMessageResponseContent,
  LeaveGroupResponseContent,
  JoinGroupResponseContent,
  ForwardMessageResponseContent,
  BehaviouralResponseContent,
} from "@lib/api/operator/types.gen";
import { FlagIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";

const ChatInfoDisplay = ({ chat }: { chat: ChatInfo }) => {
  return (
    <div className="space-y-1">
      <div className="font-medium">
        @{chat.name || chat.title || "Unnamed Chat"}
      </div>
      <div className="text-sm text-gray-600 space-y-0.5">
        {chat.id && <div>ID: {chat.id}</div>}
        {chat.type && <div>Type: {chat.type}</div>}
        {chat.description && <div>Description: {chat.description}</div>}
        {chat.members ||
          (chat.subscribers && (
            <div className="border-t border-gray-200 my-2" />
          ))}
        {chat.members && (
          <div className="font-italic text-green-700">
            Members: {chat.members}
          </div>
        )}
        {chat.subscribers && (
          <div className="font-italic text-green-700">
            Subscribers: {chat.subscribers}
          </div>
        )}
      </div>
    </div>
  );
};

export default async function ScenarioPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  if (!id) {
    throw new Error("Scenario ID is required");
  }

  const response = await getScenarioByIdScenarioScenarioScenarioIdGet({
    client: operatorClient,
    path: {
      scenario_id: id,
    },
  });

  if (response.error || !response.data) {
    throw new Error(
      `Failed to fetch scenario: ${JSON.stringify(response.error)}`
    );
  }

  const scenario = response.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const formatActionType = (type: string | undefined) => {
    const actionType = (type || "").toLowerCase();
    switch (actionType) {
      case "behavioral":
        return {
          label: "Behavioral",
          className: "bg-purple-100 text-purple-800",
        };
      case "send":
        return {
          label: "Send Message",
          className: "bg-blue-100 text-blue-800",
        };
      case "receive":
        return {
          label: "Receive Message",
          className: "bg-green-100 text-green-800",
        };
      case "wait":
        return {
          label: "Wait",
          className: "bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          label: type || "Unknown",
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const formatActionArgs = (
    type: string,
    args:
      | BehaviouralArgs
      | SendMessageArgs
      | JoinGroupArgs
      | LeaveGroupArgs
      | ReplyToMessageArgs
      | ForwardMessageArgs
  ) => {
    const actionType = type.toLowerCase();
    if (!args) return "No arguments";
    switch (actionType) {
      case "behavioural": {
        const behaviouralArgs = args as BehaviouralArgs;
        const parts = [];
        if (behaviouralArgs.wait_time !== undefined) {
          parts.push(`Wait: ${behaviouralArgs.wait_time}s`);
        }
        if (behaviouralArgs.sync_context) {
          parts.push("Sync Context");
        }
        if (behaviouralArgs.get_chats) {
          parts.push("Get Chats");
        }
        return parts.length > 0 ? parts.join(", ") : "No specific behavior";
      }
      case "send": {
        const sendArgs = args as SendMessageArgs;
        return (
          <div className="space-y-2">
            <ChatInfoDisplay chat={sendArgs.chat} />
            <div className="text-sm text-gray-600">
              {sendArgs.input_message_content}
            </div>
          </div>
        );
      }
      case "join_group": {
        const joinArgs = args as JoinGroupArgs;
        return (
          <div className="space-y-2">
            <ChatInfoDisplay chat={joinArgs.chat} />
            {joinArgs.join_discussion_group_if_availble && (
              <div className="text-sm text-gray-600">
                Join discussion group if available
              </div>
            )}
          </div>
        );
      }
      case "leave_group": {
        const leaveArgs = args as LeaveGroupArgs;
        return <ChatInfoDisplay chat={leaveArgs.chat} />;
      }
      case "reply_to_message": {
        const replyArgs = args as ReplyToMessageArgs;
        return (
          <div className="space-y-2">
            <ChatInfoDisplay chat={replyArgs.chat} />
            <div className="text-sm text-gray-600">
              {replyArgs.input_message_content}
            </div>
            {replyArgs.message_info.message_id && (
              <div className="text-xs text-gray-500">
                Reply to message: {replyArgs.message_info.message_id}
              </div>
            )}
          </div>
        );
      }
      case "forward_message": {
        const forwardArgs = args as ForwardMessageArgs;
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
              <div className="text-sm text-gray-600">{forwardArgs.message}</div>
            )}
            {forwardArgs.message_info.message_id && (
              <div className="text-xs text-gray-500">
                Message ID: {forwardArgs.message_info.message_id}
              </div>
            )}
          </div>
        );
      }
      default:
        return JSON.stringify(args);
    }
  };

  const formatResponseContent = (
    type: string,
    content:
      | SendMessageResponseContent
      | ReplyToMessageResponseContent
      | LeaveGroupResponseContent
      | JoinGroupResponseContent
      | ForwardMessageResponseContent
      | BehaviouralResponseContent
      | null
  ) => {
    if (!content) return null;

    const actionType = type.toLowerCase();
    switch (actionType) {
      case "send_message": {
        const sendContent = content as SendMessageResponseContent;
        return (
          <div className="space-y-2">
            {sendContent.message_info.message_id && (
              <div className="text-sm text-gray-600">
                Message ID: {sendContent.message_info.message_id}
              </div>
            )}
            {sendContent.message_info.timestamp && (
              <div className="text-sm text-gray-600">
                Sent at:{" "}
                {new Date(sendContent.message_info.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        );
      }
      case "reply_to_message": {
        const replyContent = content as ReplyToMessageResponseContent;
        return (
          <div className="space-y-2">
            {replyContent.message_info.message_id && (
              <div className="text-sm text-gray-600">
                Reply Message ID: {replyContent.message_info.message_id}
              </div>
            )}
            {replyContent.message_info.timestamp && (
              <div className="text-sm text-gray-600">
                Replied at:{" "}
                {new Date(replyContent.message_info.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        );
      }
      case "join_group": {
        const joinContent = content as JoinGroupResponseContent;
        return (
          <div className="space-y-2">
            {joinContent.chat_info && (
              <ChatInfoDisplay chat={joinContent.chat_info} />
            )}
            {joinContent.discussion_group_chat_info && (
              <div>
                <div className="text-sm font-medium mb-1">
                  Discussion Group:
                </div>
                <ChatInfoDisplay
                  chat={joinContent.discussion_group_chat_info}
                />
              </div>
            )}
          </div>
        );
      }
      case "leave_group": {
        const leaveContent = content as LeaveGroupResponseContent;
        return (
          <div className="space-y-2">
            {leaveContent.chat_info && (
              <ChatInfoDisplay chat={leaveContent.chat_info} />
            )}
          </div>
        );
      }
      case "forward_message": {
        const forwardContent = content as ForwardMessageResponseContent;
        return (
          <div className="space-y-2">
            {forwardContent.message_info.message_id && (
              <div className="text-sm text-gray-600">
                Forwarded Message ID: {forwardContent.message_info.message_id}
              </div>
            )}
            {forwardContent.message_info.timestamp && (
              <div className="text-sm text-gray-600">
                Forwarded at:{" "}
                {new Date(
                  forwardContent.message_info.timestamp
                ).toLocaleString()}
              </div>
            )}
          </div>
        );
      }
      case "behavioural": {
        const behaviouralContent = content as BehaviouralResponseContent;
        return (
          <div className="space-y-2">
            {behaviouralContent.chats &&
              behaviouralContent.chats.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">
                    Available Chats:
                  </div>
                  <div className="space-y-2">
                    {behaviouralContent.chats.map((chat, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <div>Peer ID: {chat.peerId}</div>
                        <div>Unread Messages: {chat.unread_count}</div>
                        <div>Unread Mentions: {chat.unread_mentions_count}</div>
                        <div>
                          Unread Reactions: {chat.unread_reactions_count}
                        </div>
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
        );
      }
      default:
        return (
          <div className="text-sm text-gray-600">{JSON.stringify(content)}</div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title={`Scenario ${scenario.scenario.id}`}
          subtitle={`Profile ID: ${scenario.scenario.profile.id}`}
        />
        <div className="flex gap-2">
          <Button variant="outline">Edit Scenario</Button>
          <Button>Run Scenario</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Status</CardTitle>
              <CardDescription>
                Current status and progress of the scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={`text-lg ${getStatusColor(
                    scenario.result?.status.status_code || "pending"
                  )}`}
                >
                  {(scenario.result?.status.status_code || "pending")
                    .charAt(0)
                    .toUpperCase() +
                    (scenario.result?.status.status_code || "pending").slice(1)}
                </Badge>
                <div className="flex flex-col gap-2">
                  {scenario.result?.scenario_info.start_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">
                          Started:
                        </span>
                      </div>
                      <span className="text-gray-700">
                        {new Date(
                          scenario.result.scenario_info.start_time
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {scenario.result?.scenario_info.end_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <FlagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">
                          Ended:
                        </span>
                      </div>
                      <span className="text-gray-700">
                        {new Date(
                          scenario.result.scenario_info.end_time
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {scenario.result?.status.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm font-medium text-red-800">Error:</div>
                  <div className="text-sm text-red-600 mt-1">
                    {scenario.result.status.error}
                  </div>
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
                {Object.entries(scenario.scenario.prefrences).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="font-medium">
                        {value?.toString() ?? "N/A"}
                      </span>
                    </div>
                  )
                )}
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
                  const actionType = formatActionType(action.type);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge className={actionType.className}>
                          {actionType.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatActionArgs(action.type || "", action.args)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(
                            scenario.result?.actions_responses[index]?.status
                              .status_code || "pending"
                          )}
                        >
                          {scenario.result?.actions_responses[index]?.status
                            .status_code || "pending"}
                        </Badge>
                        {scenario.result?.actions_responses[index]?.content && (
                          <div className="mt-2">
                            {formatResponseContent(
                              scenario.result.actions_responses[index].type,
                              scenario.result.actions_responses[index].content
                            )}
                          </div>
                        )}
                        {scenario.result?.actions_responses[index]?.status
                          .error && (
                          <div className="mt-2 text-sm text-red-600">
                            {
                              scenario.result.actions_responses[index].status
                                .error
                            }
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {scenario.scenario.actions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-gray-500"
                    >
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
  );
}
