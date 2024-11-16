'use client';

import Calendar from '@/components/Calendar';
import { useFavoriteCourses } from '@/lib/context';
import {
  Box,
  Button,
  createTheme,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { useState } from 'react';

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

  const [selectedCourses, setSelectedCourses] = useState([]);

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
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
        }}
      >
        <div className="">
          <div className="flex flex-col gap-5 ">
            <Paper
              elevation={0}
              sx={{
                p: 2,
                width: { xs: '100%', md: '400px' },
                flexShrink: 0,
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Typography variant="h6" gutterBottom>
                Favorite Courses
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {favoriteCourses.filter(
                  (course) => !selectedCourses.includes(course)
                ).length > 0 ? (
                  favoriteCourses
                    .filter((course) => !selectedCourses.includes(course))
                    .map((course) => (
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
                          borderColor: selectedCourses.includes(course)
                            ? 'primary.main'
                            : 'neutral.700',
                          backgroundColor: selectedCourses.includes(course)
                            ? 'rgba(144, 202, 249, 0.2)'
                            : 'background.paper',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {course.catNo}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                          >
                            {course.time}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                          >
                            {course.courseTitle}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() =>
                            setSelectedCourses([...selectedCourses, course])
                          }
                          size="small"
                        >
                          Add
                        </Button>
                      </Paper>
                    ))
                ) : (
                  <Typography color="text.secondary">
                    There are no favorite courses available. Add more to your
                    favorites!
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Selected Courses Section */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                width: { xs: '100%', md: '400px' },
                flexShrink: 0,
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Typography variant="h6" gutterBottom>
                Selected Courses
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedCourses.length > 0 ? (
                  selectedCourses.map((course) => (
                    <Paper
                      key={course.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderRadius: '8px',
                        border: '1px solid primary.main',
                        backgroundColor: 'rgba(144, 202, 249, 0.2)',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {course.catNo}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {course.time}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {course.courseTitle}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          setSelectedCourses(
                            selectedCourses.filter((c) => c !== course)
                          )
                        }
                        size="small"
                      >
                        Remove
                      </Button>
                    </Paper>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No courses selected yet!
                  </Typography>
                )}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                width: { xs: '100%', md: '400px' },
                flexShrink: 0,
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
                className="text-center"
              >
                <p>Made with ❤️ by Alexi!</p>
                <a className="text-center" href="https://alexi.life">
                  Click here for his other projects
                </a>
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
        >
          <Calendar selectedCourses={selectedCourses} use24Hour={true} />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
