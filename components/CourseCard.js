import { Badge } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function CourseCard({ course, columnVisibility }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{course.catNo}</span>
          <Badge variant="outline">{course.section}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">{course.courseTitle}</h3>
        {columnVisibility.instructor && (
          <p className="text-sm text-muted-foreground mb-1">Instructor: {course.instructor}</p>
        )}
        {columnVisibility.time && (
          <p className="text-sm text-muted-foreground mb-1">Time: {course.time}</p>
        )}
        {columnVisibility.room && (
          <p className="text-sm text-muted-foreground mb-1">Room: {course.room}</p>
        )}
        {columnVisibility.units && (
          <p className="text-sm text-muted-foreground mb-1">Units: {course.units}</p>
        )}
        {columnVisibility.lang && (
          <p className="text-sm text-muted-foreground mb-1">Language: {course.lang}</p>
        )}
        {columnVisibility.level && (
          <p className="text-sm text-muted-foreground mb-1">Level: {course.level}</p>
        )}
        {columnVisibility.remarks && course.remarks !== '~' && (
          <p className="text-sm text-muted-foreground italic mt-2">{course.remarks}</p>
        )}
      </CardContent>
    </Card>
  )
}