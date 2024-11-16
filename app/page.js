'use client';
import ColumnToggle from '@/components/ColumnToggle';
import CourseCard from '@/components/CourseCard';
import DepartmentSelector from '@/components/DepartmentSelector';
import OfferingsTable from '@/components/OfferingsTable';
import {
  Autocomplete,
  Box,
  Chip,
  createTheme,
  CssBaseline,
  Pagination,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFavoriteCourses } from '@/lib/context';

const initialTableVisibility = {
  catNo: true,
  section: false,
  courseTitle: true,
  units: false,
  time: true,
  room: false,
  instructor: true,
  remarks: true,
};

const initialCardVisibility = {
  catNo: true,
  section: true,
  courseTitle: true,
  units: true,
  time: true,
  room: true,
  instructor: true,
  remarks: true,
};

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

const ITEMS_PER_PAGE = 10;

const currentSemesterString = 'Second Semester';
const lastUpdated = 'November 16, 2024';

function HomeContent() {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const initialDepartment = searchParams.get('dept') || '';
  const initialInstructors = searchParams.getAll('instructor');
  const initialCatNos = searchParams.getAll('catNo');
  const initialCourseTitle = searchParams.getAll('courseTitle');

  const [selectedDepartment, setSelectedDepartment] =
    useState(initialDepartment);
  const [selectedInstructors, setSelectedInstructors] =
    useState(initialInstructors);
  const [selectedCatNos, setSelectedCatNos] = useState(initialCatNos);
  const [selectedCourseTitles, setSelectedCourseTitles] =
    useState(initialCourseTitle);
  const [subjectOffering, setSubjectOffering] = useState([]);
  const { favoriteCourses, toggleFavorite } = useFavoriteCourses();
  const [columnVisibility, setColumnVisibility] = useState(
    isMobile ? initialCardVisibility : initialTableVisibility
  );
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateURL = () => {
      const params = new URLSearchParams();
      if (selectedDepartment) params.set('dept', selectedDepartment);
      if (selectedInstructors.length > 0)
        selectedInstructors.forEach((instructor) =>
          params.append('instructor', instructor)
        );
      if (selectedCatNos.length > 0)
        selectedCatNos.forEach((catNo) => params.append('catNo', catNo));
      if (selectedCourseTitles.length > 0)
        selectedCourseTitles.forEach((courseTitle) =>
          params.append('courseTitle', courseTitle)
        );

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    };

    updateURL();
  }, [
    selectedDepartment,
    selectedInstructors,
    selectedCatNos,
    selectedCourseTitles,
  ]);

  const filteredCourses = useMemo(() => {
    return subjectOffering.filter(
      (course) =>
        (selectedInstructors.length === 0 ||
          selectedInstructors.includes(course.instructor)) &&
        (selectedCatNos.length === 0 ||
          selectedCatNos.includes(course.catNo)) &&
        (selectedCourseTitles.length === 0 ||
          selectedCourseTitles.includes(course.courseTitle))
    );
  }, [
    selectedInstructors,
    selectedCatNos,
    subjectOffering,
    selectedCourseTitles,
  ]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, page]);

  const pageCount = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const instructors = useMemo(
    () =>
      Array.from(new Set(subjectOffering.map((course) => course.instructor))),
    [subjectOffering]
  );
  const catNos = useMemo(
    () => Array.from(new Set(subjectOffering.map((course) => course.catNo))),
    [subjectOffering]
  );
  const courseTitles = useMemo(
    () =>
      Array.from(new Set(subjectOffering.map((course) => course.courseTitle))),
    [subjectOffering]
  );

  useEffect(() => {
    if (isMobile) {
      setColumnVisibility(initialCardVisibility);
    }
  }, [isMobile]);

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    const fetchOffering = async () => {
      setIsLoading(true);
      if (selectedDepartment?.length > 0) {
        const data = await fetch(
          `/api/offerings?deptCode=${selectedDepartment}`
        );
        const offering = await data.json();
        setSubjectOffering(offering);
        setPage(1);
      }
      setIsLoading(false);
    };

    fetchOffering();
  }, [selectedDepartment]);

  useEffect(() => {
    setPage(1);
  }, [selectedInstructors, selectedCatNos]);

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '95vh',
          p: 1,
          gap: 3,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          paddingX: '2em',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            width: '100%',
          }}
          className="rounded-lg border-[1px] border-neutral-700"
        >
          <DepartmentSelector
            value={selectedDepartment}
            setDepartment={setSelectedDepartment}
          />
        </Paper>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
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
                Filters
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  multiple
                  value={selectedInstructors}
                  options={instructors}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Instructor"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={`instructor-${index}`}
                          variant="outlined"
                          label={option}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  onChange={(_, newValue) => setSelectedInstructors(newValue)}
                />
                <Autocomplete
                  multiple
                  options={catNos}
                  value={selectedCatNos}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Course Number"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={`cat-${index}`}
                          variant="outlined"
                          label={option}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  onChange={(_, newValue) => setSelectedCatNos(newValue)}
                />
                <Autocomplete
                  multiple
                  options={courseTitles}
                  value={selectedCourseTitles}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Course Title"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={`courseTitle-${index}`}
                          variant="outlined"
                          label={option}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  onChange={(_, newValue) => setSelectedCourseTitles(newValue)}
                />
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
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: 1,
            }}
            className="rounded-lg border-[1px] border-neutral-700"
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <div>
                <Typography variant="h6">
                  Course Offering for {currentSemesterString}
                </Typography>
                <span className="text-secondary text-xs">
                  Last updated: {lastUpdated}
                </span>
              </div>
              {!isMobile && (
                <ColumnToggle
                  columns={Object.keys(initialCardVisibility)}
                  columnVisibility={columnVisibility}
                  onToggle={toggleColumnVisibility}
                />
              )}
            </Box>
            {filteredCourses.length > 0 ? (
              <>
                {isMobile ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    className="w-full"
                  >
                    <Pagination
                      count={pageCount}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      variant="outlined"
                      shape="rounded"
                      className="pb-5 w-full"
                      size={isMobile ? 'small' : 'medium'}
                    />
                    {paginatedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onToggleFavorite={() => toggleFavorite(course)}
                        isFavorite={favoriteCourses.some(
                          (c) => c.id === course.id
                        )}
                        columnVisibility={columnVisibility}
                      />
                    ))}
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
                    >
                      <Pagination
                        count={pageCount}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        className="pb-5"
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Box>
                    <OfferingsTable
                      onToggleFavorite={(courseId) => {
                        const course = subjectOffering.find(
                          (c) => c.id === courseId
                        );
                        if (course) toggleFavorite(course);
                      }}
                      favoriteCourses={favoriteCourses.map((c) => c.id)}
                      offerings={paginatedCourses}
                      columnVisibility={columnVisibility}
                    />
                  </>
                )}
                {isLoading && <div>Loading..</div>}
              </>
            ) : (
              !isLoading && (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                  There are no offerings available with your filter settings.
                  Try adjusting your filters.
                </Typography>
              )
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    </ThemeProvider>
  );
}
