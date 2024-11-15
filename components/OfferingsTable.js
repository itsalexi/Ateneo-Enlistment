import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useState } from "react";

export default function OfferingsTable({offerings, columnVisibility}) {
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' })
  console.log(offerings)
  const sortedCourses = offerings?.length > 0 && [...offerings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key) => {
    setSortConfig(prev => 
      prev.key === key
        ? { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }

  const visibleColumns = Object.entries(columnVisibility)
    .filter(([_, isVisible]) => isVisible)
    .map(([key]) => key)

    const SortableHeader = ({ column }) => (
      <Button variant="ghost" onClick={() => handleSort(column)} className="font-bold">
        {column === 'catNo' ? 'Course No' : 
         column === 'courseTitle' ? 'Course Title' : 
         column.charAt(0).toUpperCase() + column.slice(1)}
        {sortConfig.key === column && (
          sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    )
  

  return (offerings?.length > 0 ?     <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.map((column, index) => (
            <TableHead key={'column-01-'+ index} className="text-center">
              <SortableHeader column={column} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCourses.map((course) => (
          <TableRow key={course.id}>
            {visibleColumns.map((column, index) => (
              <TableCell key={'column-02-'+ index} className="text-center">
                {course[column]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div> : <div>There are no offerings available with your filter settings, try other filters.</div>)
}