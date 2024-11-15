import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function ColumnToggle({ columns, columnVisibility, onToggle }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          {columns.map((column) => (
            <div key={column} className="flex items-center space-x-2">
              <Checkbox
                id={`column-${column}`}
                checked={columnVisibility[column]}
                onCheckedChange={() => onToggle(column)}
              />
              <Label htmlFor={`column-${column}`} className="text-sm font-normal">
                {column === 'catNo' ? 'Catalog No' : 
                 column === 'courseTitle' ? 'Course Title' : 
                 column.charAt(0).toUpperCase() + column.slice(1)}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}