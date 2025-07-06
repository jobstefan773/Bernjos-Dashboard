"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Employee type based on CreateUserDto
export type Employee = {
  id: string // Assume backend returns an id
  firstName: string
  lastName: string
  email?: string
  contactNumber: string
  role?: string
  position?: string // Added position
  username: string
}

// Use the React Query hook for fetching employees
import { useEmployeesQuery } from "@/app/api/queries/useEmployeesQuery";

// Columns for employee table
const columns: ColumnDef<Employee>[] = [
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {(() => {
          // Deterministically generate a color from the employee's id or name
          function stringToColor(str: string) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const color = `hsl(${Math.abs(hash) % 360}, 70%, 80%)`;
            return color;
          }
          const bgColor = stringToColor(row.original.id || (row.original.firstName + row.original.lastName));
          return (
            <Avatar className="w-9 h-9" style={{ backgroundColor: bgColor }}>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  row.original.firstName + ' ' + row.original.lastName
                )}`}
                alt={row.original.firstName + ' ' + row.original.lastName}
              />
              <AvatarFallback>
                {row.original.firstName?.[0]}
                {row.original.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          );
        })()}
        <div>
          <div className="font-medium text-foreground">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.original.position}
          </div>
        </div>
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`.toLowerCase();
      const email = (row.original.email ?? '').toLowerCase();
      return (
        fullName.includes(filterValue.toLowerCase()) ||
        email.includes(filterValue.toLowerCase())
      );
    },
  },
  {
    id: "contactDetails",
    header: "Contact Details",
    cell: ({ row }) => (
      <div>
        <div className="text-foreground">{row.original.contactNumber}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {row.original.email}
        </div>
      </div>
    ),
    meta: {
      columnLabel: "Contact Details"
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {row.original.role}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(employee.id)}
            >
              Copy employee ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-foreground">View details</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30" variant="destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Backwards compatibility export for DataTableDemo (used in employees/page.tsx)
export function DataTableDemo(props: any) {
  return <EmployeeTable {...props} />;
}

export function EmployeeTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const router = useRouter();

  // Use React Query to fetch employees
  const { data: employees = [], isLoading } = useEmployeesQuery();

  const table = useReactTable({
    data: employees,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Redirect to new-employee page
  function handleAddEmployee() {
    router.push("/employees/new-employee");
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter by name..."
          value={
            (table.getColumn("name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant="default"
          className="ml-auto"
          onClick={handleAddEmployee}
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (isLoading) {
                return (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                );
              } else if (table.getRowModel().rows?.length) {
                return table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ));
              } else {
                return (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                );
              }
            })()}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
    </div>
  )
}
