"use client"

import { cn } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table as TTable,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@radix-ui/react-separator"

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  initialSortingState?: SortingState
  isRefreshing?: boolean
  data: T[]
  pageSize?: number
  header?: ({ table }: { table: TTable<T> }) => React.ReactElement
  rowClassName?: string
  onClickRow?: (rowData: T) => void
  enableRowSelection?: boolean
  tableContainerClassName?: string
}

export function DataTable<T>({
  columns,
  data,
  isRefreshing = false,
  pageSize = 10,
  initialSortingState = [],
  header,
  onClickRow,
  enableRowSelection = false,
  rowClassName,
  tableContainerClassName,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSortingState)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    setPagination({ pageIndex: 0, pageSize })
  }, [data])

  // Add selection column if row selection is enabled
  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection) return columns

    const columnsWithDefaultSortingFunctions = columns.map(column => {
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
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          onClick={e => e.stopPropagation()}
          aria-label="Select row"
        />
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
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    defaultColumn: {
      minSize: 100,
      maxSize: 400,
      size: 150,
    },
  })

  return (
    <div className="w-full flex flex-col min-h-[600px] relative">
      {isRefreshing && (
        <div className="absolute -top-4 left-0 flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Refreshing...</span>
        </div>
      )}
      <div className="flex items-center py-4">
        {header && header({ table })}
        <div className="flex-1" />
        <div className="flex items-center space-x-4">
          {enableRowSelection && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => table.resetRowSelection()}>
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
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => table.resetColumnVisibility()}>
            Reset columns
          </Button>
        </div>
      </div>
      <div className="flex-1 pt-8">
        <div className={cn("rounded-md border bg-white", tableContainerClassName)}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
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
                          onClick={() => header.column.toggleSorting(newSortDirection)}
                        />
                      )
                    }
                    return (
                      <TableHead key={header.id}>
                        <div
                          className={cn(
                            "inline-flex flex-row items-center space-x-2",
                            header.id !== "select" && "min-w-[20ch]",
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                table.getRowModel().rows.map(row => (
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
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
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
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
