"use client"

import { Web1Account } from "@lib/web1/web1-models"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./table"

const web1AccountColumns: ColumnDef<Web1Account>[] = [
    {
        accessorKey: "userId",
        header: "User ID",
        size: 150,
        cell: ({ row }) => {
            const account = row.original
            return <span>{account.userId}</span>
        },
    },
    {
        accessorKey: "country",
        header: "Country",
        size: 100,
        cell: ({ row }) => {
            const account = row.original
            return <span>{account.country}</span>
        },
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        size: 120,
        cell: ({ row }) => {
            const account = row.original
            return <span>{account.phoneNumber}</span>
        },
    },
    {
        accessorKey: "password",
        header: "Password",
        size: 120,
        cell: ({ row }) => {
            const account = row.original
            return <span>{account.password}</span>
        },
    },
]

// const chartConfig = {
//     country: {
//         label: "Country",
//         color: "hsl(var(--chart-1))",
//     },
// } satisfies ChartConfig;

export function Web1AccountsList({ accounts }: { accounts: Web1Account[] }) {
    return (
        <div>
            <DataTable columns={web1AccountColumns} data={accounts} />
        </div>
    )
}
