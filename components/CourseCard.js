import { Badge } from '@mui/material';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from './ui/card';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';

export default function CourseCard({
  course,
  columnVisibility,
  isFavorite,
  onToggleFavorite,
}) {
  return (
    <Card className="mb-4 bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-gray-100">
          <span>{course.catNo}</span>
          <Badge
            variant="outlined"
            sx={{
              borderColor: 'gray',
              color: 'lightgray',
            }}
          >
            {course.section}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2 text-gray-100">
          {course.courseTitle}
        </h3>
        {columnVisibility.instructor && (
          <p className="text-sm text-gray-400 mb-1">
            Instructor: {course.instructor}
          </p>
        )}
        {columnVisibility.time && (
          <p className="text-sm text-gray-400 mb-1">Time: {course.time}</p>
        )}
        {columnVisibility.room && (
          <p className="text-sm text-gray-400 mb-1">Room: {course.room}</p>
        )}
        {columnVisibility.units && (
          <p className="text-sm text-gray-400 mb-1">Units: {course.units}</p>
        )}
        {columnVisibility.lang && (
          <p className="text-sm text-gray-400 mb-1">Language: {course.lang}</p>
        )}
        {columnVisibility.level && (
          <p className="text-sm text-gray-400 mb-1">Level: {course.level}</p>
        )}
        {columnVisibility.remarks && course.remarks !== '~' && (
          <p className="text-sm text-gray-400 italic mt-2">{course.remarks}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className={
            isFavorite
              ? 'text-red-500 hover:text-red-400'
              : 'text-gray-400 hover:text-gray-300'
          }
          onClick={() => onToggleFavorite(course.id)}
        >
          <Heart
            className="mr-2 h-4 w-4"
            fill={isFavorite ? 'currentColor' : 'none'}
          />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>
      </CardFooter>
    </Card>
  );
}
