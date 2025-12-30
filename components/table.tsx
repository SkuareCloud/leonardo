"use client"

import { cn } from "@/lib/utils"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    Table as TTable,
    Updater,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Loader2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Separator } from "@radix-ui/react-separator"

export interface DataTableProps<T> {
    columns: ColumnDef<T>[]
    initialSortingState?: SortingState
    isRefreshing?: boolean
    data: T[]
    pageSize?: number
    manualPagination?: boolean
    externalPagination?: PaginationState
    onExternalPaginationChange?: (pagination: PaginationState) => void
    pageCount?: number
    totalItems?: number
    header?: ({ table }: { table: TTable<T> }) => React.ReactElement
    rowClassName?: string
    onClickRow?: (rowData: T) => void
    enableRowSelection?: boolean
    tableContainerClassName?: string
    paginationPosition?: "top" | "bottom" | "both"
    getRowId?: (row: T) => string
    externalRowSelection?: Record<string, boolean>
    onRowSelectionChange?: (selection: Record<string, boolean>) => void
}

export function DataTable<T>({
    columns,
    data,
    isRefreshing = false,
    pageSize = 10,
    manualPagination = false,
    externalPagination,
    onExternalPaginationChange,
    pageCount,
    totalItems,
    initialSortingState = [],
    header,
    onClickRow,
    enableRowSelection = false,
    rowClassName,
    tableContainerClassName,
    paginationPosition = "bottom",
    getRowId,
    externalRowSelection,
    onRowSelectionChange,
}: DataTableProps<T>) {
    const [sorting, setSorting] = React.useState<SortingState>(initialSortingState)
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    })
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [internalRowSelection, setInternalRowSelection] = React.useState({})
    
    // Use external row selection if provided, otherwise use internal
    const rowSelection = externalRowSelection ?? internalRowSelection
    const setRowSelection = onRowSelectionChange ?? setInternalRowSelection

    React.useEffect(() => {
        if (!manualPagination) {
            setPagination({ pageIndex: 0, pageSize })
        }
    }, [data, pageSize, manualPagination])

    // Sync internal pagination state with external pagination when using manual pagination
    React.useEffect(() => {
        if (manualPagination && externalPagination) {
            setPagination(externalPagination)
        }
    }, [manualPagination, externalPagination])

    // Sync external row selection when it changes
    React.useEffect(() => {
        if (externalRowSelection !== undefined) {
            // External selection is provided, ensure internal state matches
            // This is handled by using externalRowSelection directly in the state
        }
    }, [externalRowSelection])

    const resolvedPagination = pagination

    const handlePaginationChange = (updater: Updater<PaginationState>) => {
        const nextState =
            typeof updater === "function" ? updater(resolvedPagination) : { ...updater }
        setPagination(nextState)
        onExternalPaginationChange?.(nextState)
    }

    // Add selection column if row selection is enabled
    const columnsWithSelection = React.useMemo(() => {
        if (!enableRowSelection) return columns

        const columnsWithDefaultSortingFunctions = columns.map((column) => {
            if (column.sortingFn) return column
            if (!column.enableSorting) return column
            return {
                ...column,
                sortingFn: (rowA: any, rowB: any) => {
                    const valueA = rowA.original[column.id as keyof T]
                    const valueB = rowB.original[column.id as keyof T]
                    if (typeof valueA === "number" && typeof valueB === "number") {
                        return valueA - valueB
                    }
                    return 0
                },
            }
        })

        const selectionColumn: ColumnDef<T> = {
            id: "select",
            size: 50,
            header: ({ table }) => (
                <div 
                    className="flex items-center justify-center p-2 cursor-pointer hover:bg-muted/50 rounded"
                    onClick={(e) => {
                        e.stopPropagation()
                        table.toggleAllPageRowsSelected()
                    }}
                >
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="h-5 w-5 cursor-pointer pointer-events-none"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div 
                    className="flex items-center justify-center p-2 cursor-pointer hover:bg-muted/50 rounded"
                    onClick={(e) => {
                        e.stopPropagation()
                        row.toggleSelected(!row.getIsSelected())
                    }}
                >
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select row"
                        className="h-5 w-5 cursor-pointer pointer-events-none"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        }

        return [selectionColumn, ...columns]
    }, [columns, enableRowSelection])

    const table = useReactTable({
        data,
        columns: columnsWithSelection,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        ...(manualPagination
            ? { manualPagination: true as const, pageCount }
            : { getPaginationRowModel: getPaginationRowModel() }),
        onPaginationChange: handlePaginationChange,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection,
        getRowId,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            pagination: resolvedPagination,
        },
        defaultColumn: {
            minSize: 100,
            maxSize: 400,
            size: 150,
        },
    })

    const totalFilteredRows = table.getFilteredRowModel().rows.length
    const { pageIndex, pageSize: currentPageSize } = table.getState().pagination

    const manualTotalRows = totalItems ?? pageIndex * currentPageSize + data.length

    const totalRowsForDisplay = manualPagination ? manualTotalRows : totalFilteredRows

    const pageStart =
        totalRowsForDisplay === 0 ? 0 : pageIndex * currentPageSize + 1
    const pageEnd =
        totalRowsForDisplay === 0
            ? 0
            : manualPagination
                ? Math.min(totalRowsForDisplay, pageIndex * currentPageSize + data.length)
                : Math.min(totalRowsForDisplay, pageStart + currentPageSize - 1)
    const selectedRowCount = table.getFilteredSelectedRowModel().rows.length

    const showTopPagination =
        paginationPosition === "top" || paginationPosition === "both"
    const showBottomPagination =
        paginationPosition === "bottom" || paginationPosition === "both"

    const renderPaginationControls = (position: "top" | "bottom") => (
        <div
            className={cn(
                "flex flex-wrap items-center justify-end space-x-2 py-4",
                position === "top" && "pt-0",
            )}
        >
            <div className="text-muted-foreground flex-1 text-sm">
                {totalRowsForDisplay === 0
                    ? "Showing 0 rows"
                    : `Showing ${pageStart}-${pageEnd} of ${totalRowsForDisplay} row${
                          totalRowsForDisplay === 1 ? "" : "s"
                      }`}
                {enableRowSelection && (
                    <span className="ml-3">
                        {selectedRowCount} selected
                    </span>
                )}
            </div>
            <div className="space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )

    return (
        <div className="relative flex min-h-[600px] w-full flex-col">
            {isRefreshing && (
                <div className="text-muted-foreground absolute -top-4 left-0 flex items-center space-x-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Refreshing...</span>
                </div>
            )}
            <div className="flex items-center py-4">
                {header && header({ table })}
                <div className="flex-1" />
                <div className="flex items-center space-x-4">
                    {enableRowSelection && table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.resetRowSelection()}
                        >
                            Reset selection
                        </Button>
                    )}
                    <Separator orientation="vertical" className="h-4 border-1" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto h-8">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.resetColumnVisibility()}
                    >
                        Reset columns
                    </Button>
                </div>
            </div>
            {showTopPagination && renderPaginationControls("top")}
            <div className="flex-1 pt-8">
                <div className={cn("rounded-md border bg-white", tableContainerClassName)}>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const sortable = header.column.getCanSort()
                                        let SortIcon = ArrowUpDown
                                        let SortElement = null
                                        let newSortDirection = true // up
                                        if (sortable) {
                                            const sortDirection = header.column.getIsSorted()
                                            if (!sortDirection) {
                                                // No sorting applied
                                                newSortDirection = true
                                            } else if (sortDirection === "asc") {
                                                SortIcon = ArrowUp
                                            } else if (sortDirection === "desc") {
                                                SortIcon = ArrowDown
                                                newSortDirection = false
                                            }

                                            SortElement = (
                                                <SortIcon
                                                    className="ml-2 size-4"
                                                    onClick={() =>
                                                        header.column.toggleSorting(
                                                            newSortDirection,
                                                        )
                                                    }
                                                />
                                            )
                                        }
                                        return (
                                            <TableHead key={header.id} className="text-center">
                                                <div
                                                    className={cn(
                                                        "flex w-full flex-row items-center justify-center gap-2",
                                                        header.id !== "select" && "min-w-[20ch]",
                                                    )}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext(),
                                                          )}
                                                    {sortable && SortElement}
                                                </div>
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        onClick={() => {
                                            if (onClickRow) {
                                                onClickRow(row.original)
                                            }
                                        }}
                                        className={rowClassName}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {showBottomPagination && renderPaginationControls("bottom")}
        </div>
    )
}
