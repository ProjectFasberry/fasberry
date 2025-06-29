import { useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArmorItem } from '@repo/shared/wiki/data/wiki/wiki-list';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';

interface TableProps {
  array_name: ArmorItem[],
  columns: ColumnDef<any, any>[],
  table_caption?: string
}

export const WikiTableComponent = ({ 
  array_name, 
  columns, 
  table_caption 
}: TableProps) => {
  const [data, setData] = useState(() => [...array_name])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table className="table-auto xl:table-fixed">
      <TableCaption className="text-neutral-200 text-base xl:text-lg p-0 mt-2">
        {table_caption}
      </TableCaption>
      <TableHeader className='table-auto'>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header, idx) => (
              <TableHead
                key={idx}
                colSpan={header.colSpan}
                className="text-neutral-200 border bg-neutral-600 border-neutral-400 dark:border-neutral-800 dark:bg-neutral-700 p-2 text-md lg:text-lg px-12 text-center"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell, idx) => (
              <TableCell 
              key={idx} 
              className="text-neutral-200 first:bg-neutral-600 first:dark:border-neutral-800 
              first:dark:bg-neutral-700 border border-neutral-400 dark:border-neutral-700 bg-neutral-700 dark:bg-neutral-800 p-2 text-sm lg:text-lg overflow-hidden">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell >
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table >
  )
}