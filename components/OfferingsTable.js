import { ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useState } from 'react';

export default function OfferingsTable({
  offerings,
  columnVisibility,
  favoriteCourses,
  onToggleFavorite,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: 'code',
    direction: 'asc',
  });

  const sortedCourses =
    offerings?.length > 0 &&
    [...offerings].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const visibleColumns = Object.entries(columnVisibility)
    .filter(([_, isVisible]) => isVisible)
    .map(([key]) => key);

  const SortableHeader = ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="font-bold text-gray-300 hover:text-gray-100 hover:bg-gray-700"
    >
      {column === 'catNo'
        ? 'Course No'
        : column === 'courseTitle'
        ? 'Course Title'
        : column.charAt(0).toUpperCase() + column.slice(1)}
      {sortConfig.key === column &&
        (sortConfig.direction === 'asc' ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        ))}
    </Button>
  );

  return offerings?.length > 0 ? (
    <div className="rounded-md border border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-700 bg-gray-800">
            {visibleColumns.map((column, index) => (
              <TableHead key={'column-01-' + index} className="text-center">
                <SortableHeader column={column} />
              </TableHead>
            ))}
            <TableHead className="text-center">
              <span className="sr-only">Favorite</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCourses.map((course) => (
            <TableRow
              key={course.id}
              className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
            >
              {visibleColumns.map((column, index) => (
                <TableCell
                  key={'column-02-' + index}
                  className="text-center text-gray-300"
                >
                  {course[column]}
                </TableCell>
              ))}
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    favoriteCourses.includes(course.id)
                      ? 'text-red-500 hover:text-red-400 hover:bg-red-900/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  }
                  onClick={() => onToggleFavorite(course.id)}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={
                      favoriteCourses.includes(course.id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                  <span className="sr-only">
                    {favoriteCourses.includes(course.id)
                      ? 'Remove from Favorites'
                      : 'Add to Favorites'}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <div className="text-gray-300 p-4 bg-gray-800 rounded-md border border-gray-700">
      There are no offerings available with your filter settings, try other
      filters.
    </div>
  );
}
