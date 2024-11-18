'use client';

import Calendar from '@/components/Calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFavoriteCourses, useSelectedCourses } from '@/lib/context';
import { parseTimeRange } from '@/lib/helper';
import {
  Box,
  Button,
  createTheme,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMediaQuery, useTheme } from '@mui/material';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

export default function Page() {
  const { favoriteCourses } = useFavoriteCourses();
  const { selectedCourses, toggleSelected } = useSelectedCourses();
  const tableRef = useRef();

  const exportTableAsImage = () => {
    if (tableRef.current) {
      toPng(tableRef.current, { pixelRatio: 3 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'schedule.png';
          link.click();
        })
        .catch((err) => {
          console.error('Failed to export table:', err);
        });
    }
  };

  const CourseTable = ({ courses, type }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (isMobile) {
      return (
        <div className="flex flex-col gap-2">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Paper
                key={course.id}
                elevation={1}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'neutral.700',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {course.catNo} - {course.section}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {course.time}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {course.courseTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {course.instructor}
                  </Typography>
                </Box>
                <Tooltip
                  title={
                    parseTimeRange(course.time) === null ? 'no timestamp' : ''
                  }
                >
                  <span>
                    <Button
                      variant={type === 'favorite' ? 'outlined' : 'contained'}
                      color="secondary"
                      onClick={() => toggleSelected(course)}
                      disabled={
                        type === 'favorite' &&
                        parseTimeRange(course.time) === null
                      }
                      size="small"
                    >
                      {type === 'favorite' ? 'Add' : 'Remove'}
                    </Button>
                  </span>
                </Tooltip>
              </Paper>
            ))
          ) : (
            <Typography
              color="text.secondary"
              sx={{ textAlign: 'center', py: 2 }}
            >
              {type === 'favorite'
                ? 'No favorite courses available. Add more to your favorites!'
                : 'No courses selected yet!'}
            </Typography>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Course</TableHead>
            <TableHead className="text-center">Section</TableHead>
            <TableHead className="text-center">Title</TableHead>
            <TableHead className="text-center">Instructor</TableHead>
            <TableHead className="text-center">Time</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="text-center">{course.catNo}</TableCell>
                <TableCell className="text-center">{course.section}</TableCell>
                <TableCell className="text-center">
                  {course.courseTitle}
                </TableCell>
                <TableCell className="text-center">
                  {course.instructor}
                </TableCell>
                <TableCell className="text-center">{course.time}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant={type === 'favorite' ? 'outline' : 'default'}
                    onClick={() => toggleSelected(course)}
                    disabled={
                      type === 'favorite' &&
                      parseTimeRange(course.time) === null
                    }
                  >
                    {type === 'favorite' ? 'Add' : 'Remove'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                {type === 'favorite'
                  ? 'No favorite courses available. Add more to your favorites!'
                  : 'No courses selected yet!'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '95vh',
          p: 1,
          gap: 3,
          display: 'flex',
          bgcolor: 'background.default',
          paddingX: '2em',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <div className="">
          <div className="flex flex-col md:flex-row gap-5 ">
            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: '1',
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Typography variant="h6" gutterBottom>
                Favorite Courses
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <ScrollArea className="h-[300px]">
                  <CourseTable
                    courses={favoriteCourses.filter(
                      (course) =>
                        !selectedCourses.some((sc) => sc.id === course.id)
                    )}
                    type="favorite"
                  />
                </ScrollArea>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: '1',
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Typography variant="h6" gutterBottom>
                Selected Courses
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ScrollArea className="h-[300px]">
                  <CourseTable courses={selectedCourses} type="selected" />
                </ScrollArea>
              </Box>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: { xs: '1', md: '0.5' },
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
                className="text-center"
              >
                <p>Made with ❤️ by Alexi!</p>
                <a className="text-center" href="https://alexi.life">
                  Click here for his other projects
                </a>
                <Button onClick={exportTableAsImage}>
                  Export Schedule as PNG
                </Button>
              </Box>
            </Paper>
          </div>
        </div>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            flex: 1,
          }}
          className="rounded-lg border-[1px] border-neutral-700"
          ref={tableRef}
        >
          <Calendar selectedCourses={selectedCourses} use24Hour={true} />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
