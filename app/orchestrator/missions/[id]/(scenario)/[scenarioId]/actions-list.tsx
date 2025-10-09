"use client"

import { CopyableTrimmedId } from "@/components/copyable-trimmed-id"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { ActionRead, ModelsActionsActionStatus } from "@lib/api/orchestrator/types.gen"
import { ColumnDef } from "@tanstack/react-table"

interface ActionDataRow {
    actionId: string
    actionType: string
    payload?: Record<string, unknown> | null
    content?: Record<string, unknown> | null
    status?: ModelsActionsActionStatus
    error?: string | null
    createdAt?: string
    updatedAt?: string
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

function getStatusColor(status?: string) {
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

function formatJson(value: unknown, fallback: string = "-") {
    if (value === null || value === undefined) return fallback
    try {
        if (typeof value === "string") return value
        return JSON.stringify(value)
    } catch {
        return fallback
    }
}

export default function ActionsList({ actions }: { actions: ActionRead[] | undefined }) {
    const data: ActionDataRow[] = (actions || []).map((action) => ({
        actionId: action.id,
        actionType: action.action_type,
        payload: (action as ActionRead).payload as Record<string, unknown> | null,
        content: (action as ActionRead).content as Record<string, unknown> | null,
        status: action.status_code,
        error: action.error || null,
        createdAt: action.created_at,
        updatedAt: action.updated_at,
    }))

    const columns: ColumnDef<ActionDataRow>[] = [
        {
            accessorKey: "actionId",
            header: "Action ID",
            size: 180,
            cell: ({ row }) => {
                const action = row.original
                return <CopyableTrimmedId id={action.actionId} />
            },
        },
        {
            accessorKey: "actionType",
            header: "Type",
            size: 140,
            cell: ({ row }) => {
                const action = row.original
                return <Badge className="bg-gray-100 text-gray-800">{action.actionType}</Badge>
            },
        },
        {
            accessorKey: "payload",
            header: "Payload",
            size: 320,
            cell: ({ row }) => {
                const action = row.original
                return (
                    <div className="max-w-xs truncate text-sm text-gray-600">
                        {formatJson(action.payload)}
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 140,
            cell: ({ row }) => {
                const action = row.original
                return (
                    <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(action.status)}>
                            {action.status || "-"}
                        </Badge>
                        {action.error && (
                            <div className="text-xs font-medium text-red-600">{action.error}</div>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "updatedAt",
            header: "Updated",
            size: 180,
            cell: ({ row }) => {
                const action = row.original
                if (!action.updatedAt) return "-"
                return (
                    <div className="text-xs text-gray-600">
                        {formatDate(new Date(action.updatedAt))}
                    </div>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} pageSize={10} />
}
