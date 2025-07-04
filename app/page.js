"use client";
import ColumnToggle from "@/components/ColumnToggle";
import OfferingsTable from "@/components/OfferingsTable";
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
  List,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useFavoriteCourses } from "@/lib/context";
import { sortTimeslots } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DepartmentSelector from "@/components/DepartmentSelector";

// --- ProgramSelector implementation ---
function ProgramSelector({
  setCurriculum,
  className,
  selectedSemester,
  setSelectedSemester,
}) {
  const [programLabels, setProgramLabels] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    const fetchProgramList = async () => {
      const data = await fetch("/api/programs");
      const list = await data.json();
      const options = list.map((program) => ({
        label: program.program_info,
        id: program.id,
      }));
      setProgramLabels(options);
    };
    fetchProgramList();
  }, []);

  useEffect(() => {
    setCurriculum({ courses: [] });
    setProgramData(null);
    const fetchProgramData = async (program) => {
      const data = await fetch(`/api/programs/?id=${program}`);
      setProgramData(await data.json());
    };
    if (selectedProgram) {
      fetchProgramData(selectedProgram);
      setSelectedYear(null);
      setSelectedSemester(null);
    }
  }, [selectedProgram, setCurriculum, setSelectedSemester]);

  useEffect(() => {
    setCurriculum({ courses: selectedSemester?.courses || [] });
  }, [selectedSemester, setCurriculum]);

  return (
    <div className={className}>
      <Autocomplete
        getOptionLabel={(option) => option.label}
        options={programLabels}
        onChange={(e, value) => {
          setSelectedProgram(value ? value.id : null);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Program of Study" />
        )}
      />
      {programData && programData.length > 0 && (
        <Autocomplete
          options={programData[0].years.map((yearObj, index) => ({
            year: yearObj.year,
            label: `${yearObj.year} Year`,
            index,
          }))}
          getOptionLabel={(option) => option.label}
          onChange={(e, value) => {
            if (value) {
              setSelectedYear(null);
              setTimeout(() => {
                setSelectedYear(programData[0].years[value.index]);
              }, 0);
            }
          }}
          renderInput={(params) => <TextField {...params} label="Year" />}
        />
      )}
      {programData && selectedYear && (
        <Autocomplete
          options={selectedYear.semesters.map((semesterObj, index) => ({
            label: `${semesterObj.name}`,
            index,
          }))}
          getOptionLabel={(option) => option.label}
          onChange={(e, value) => {
            if (value) {
              setSelectedSemester(selectedYear.semesters[value.index]);
            }
          }}
          renderInput={(params) => <TextField {...params} label="Semester" />}
        />
      )}
    </div>
  );
}
// --- End ProgramSelector ---

const initialTableVisibility = {
  catNo: true,
  section: true,
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
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
});

const ITEMS_PER_PAGE = 10;
const currentSemesterString = "First Semester 2025-2026";
const lastUpdated = 1751206467372;

function CourseListSidebar({
  selectedSemester,
  selectedCourse,
  setSelectedCourse,
  customScrollbar,
}) {
  const [search, setSearch] = useState("");

  if (!selectedSemester) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        No program selected
      </Box>
    );
  }

  const filteredCourses = selectedSemester.courses.filter(
    (course) =>
      course.catNo.toLowerCase().includes(search.toLowerCase()) ||
      course.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          background: "inherit",
          boxShadow: "none",
          mt: 0,
        }}
      >
        <List dense>
          {filteredCourses.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No courses found.
            </Typography>
          ) : (
            filteredCourses.map((course) => (
              <ListItemButton
                key={course.catNo}
                selected={selectedCourse === course.catNo}
                onClick={() =>
                  setSelectedCourse(
                    selectedCourse === course.catNo ? null : course.catNo
                  )
                }
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor:
                    selectedCourse === course.catNo
                      ? "primary.main"
                      : undefined,
                  color:
                    selectedCourse === course.catNo
                      ? "primary.contrastText"
                      : undefined,
                }}
              >
                <ListItemText
                  primary={course.catNo}
                  secondary={course.courseTitle}
                  primaryTypographyProps={{
                    fontWeight: selectedCourse === course.catNo ? 700 : 500,
                  }}
                />
              </ListItemButton>
            ))
          )}
        </List>
        {selectedCourse && filteredCourses.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <IconButton
              size="small"
              onClick={() => setSelectedCourse(null)}
              color="secondary"
              title="Clear Course Filter"
            >
              <ClearIcon />
            </IconButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function ProgramIPSFilterCard({
  programLabels,
  selectedProgram,
  setSelectedProgram,
  yearOptions,
  selectedYear,
  setSelectedYear,
  semesterOptions,
  selectedSemester,
  setSelectedSemester,
}) {
  return (
    <Box
      sx={{ p: 0, borderRadius: 2, background: "inherit", boxShadow: "none" }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Autocomplete
          options={programLabels}
          value={programLabels.find((p) => p.id === selectedProgram) || null}
          getOptionLabel={(option) => option.label}
          onChange={(e, value) => setSelectedProgram(value ? value.id : null)}
          renderInput={(params) => (
            <TextField {...params} label="Program of Study" />
          )}
        />
        <Autocomplete
          options={yearOptions}
          value={selectedYear}
          getOptionLabel={(option) => option.label}
          onChange={(e, value) => setSelectedYear(value)}
          renderInput={(params) => <TextField {...params} label="Year" />}
          disabled={!selectedProgram}
        />
        <Autocomplete
          options={semesterOptions}
          value={selectedSemester}
          getOptionLabel={(option) => option.label}
          onChange={(e, value) => setSelectedSemester(value)}
          renderInput={(params) => <TextField {...params} label="Semester" />}
          disabled={!selectedYear}
        />
      </Box>
    </Box>
  );
}

function ProgramOfferingsContent() {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down("sm"));
  const [curriculum, setCurriculum] = useState({ courses: [] });
  const [subjectOffering, setSubjectOffering] = useState([]);
  const { favoriteCourses, toggleFavorite } = useFavoriteCourses();
  const [columnVisibility, setColumnVisibility] = useState(
    isMobile ? initialCardVisibility : initialTableVisibility
  );
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for sidebar (optional, can be extended)
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedCatNos, setSelectedCatNos] = useState([]);
  const [selectedCourseTitles, setSelectedCourseTitles] = useState([]);
  const [selectedTime, setSelectedTime] = useState([]);
  const [selectedCourse, _setSelectedCourse] = useState(null);

  // Stepper state
  const [programLabels, setProgramLabels] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Department override state
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // Track which filter was last changed
  const [activeFilter, setActiveFilter] = useState("program"); // 'department' or 'program'

  // Custom setter for selectedCourse to handle filter switching
  const setSelectedCourse = (course) => {
    setPage(1);
    _setSelectedCourse(course);
    if (course && selectedSemester) {
      setActiveFilter("program");
    }
  };

  // Fetch program list on mount
  useEffect(() => {
    const fetchProgramList = async () => {
      const data = await fetch("/api/programs");
      const list = await data.json();
      const options = list.map((program) => ({
        label: program.program_info,
        id: program.id,
      }));
      setProgramLabels(options);
    };
    fetchProgramList();
  }, []);

  // Fetch program data when program changes
  useEffect(() => {
    setCurriculum({ courses: [] });
    setProgramData(null);
    setSelectedYear(null);
    setSelectedSemester(null);
    const fetchProgramData = async (program) => {
      const data = await fetch(`/api/programs/?id=${program}`);
      setProgramData(await data.json());
    };
    if (selectedProgram) {
      fetchProgramData(selectedProgram);
    }
  }, [selectedProgram]);

  // Set year options when programData changes
  const yearOptions =
    programData && programData.length > 0
      ? programData[0].years.map((yearObj, index) => ({
          ...yearObj,
          label: `${yearObj.year} Year`,
          index,
        }))
      : [];

  // Set semester options when selectedYear changes
  const semesterOptions =
    selectedYear && selectedYear.semesters
      ? selectedYear.semesters.map((semesterObj, index) => ({
          ...semesterObj,
          label: `${semesterObj.name}`,
          index,
        }))
      : [];

  // When selectedSemester changes, update curriculum
  useEffect(() => {
    setCurriculum({ courses: selectedSemester?.courses || [] });
  }, [selectedSemester]);

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

  // Fetch all offerings on mount
  useEffect(() => {
    const fetchOffering = async () => {
      setIsLoading(true);
      const data = await fetch(`/api/offerings`);
      const offering = await data.json();
      setSubjectOffering(offering);
      setPage(1);
      setIsLoading(false);
    };
    fetchOffering();
  }, []);

  // Filter offerings by the last active filter
  const filteredCourses = useMemo(() => {
    if (activeFilter === "department" && selectedDepartment) {
      // Show all courses (sections) in the selected department
      return subjectOffering.filter(
        (course) => course.deptCode === selectedDepartment
      );
    }
    if (activeFilter === "program" && selectedSemester) {
      if (!curriculum.courses || curriculum.courses.length === 0) return [];
      let curriculumCatNos = curriculum.courses.map((c) => c.catNo);
      if (selectedCourse && /^natsc\s*/i.test(selectedCourse)) {
        curriculumCatNos = [selectedCourse];
      }
      if (selectedCourse && /^flc\s*/i.test(selectedCourse)) {
        curriculumCatNos = [selectedCourse];
      }
      console.log(
        "[DEBUG] curriculumCatNos after FLC logic:",
        curriculumCatNos
      );
      const norm = (s) => s.toLowerCase().replace(/\s+/g, "");
      // DEBUG: Log all curriculum catNos
      console.log("[DEBUG] curriculumCatNos:", curriculumCatNos);
      // DEBUG: Log all possible NatSc matches in subjectOffering
      subjectOffering.forEach((course) => {
        const courseParts = course.catNo.split(/\s+/);
        const dept = courseParts[0]?.toUpperCase();
        const num = courseParts[1];
        if (["CHEM", "ENVI", "BIO", "PHYS"].includes(dept)) {
          console.log(
            `[DEBUG] Offering: ${course.catNo} (${dept}) num: ${num}`
          );
        }
      });
      let filtered = subjectOffering.filter((course) => {
        return curriculumCatNos.some((cat) => {
          // NatSc umbrella logic (case-insensitive, robust)
          if (/^natsc\s*/i.test(cat)) {
            // Extract the number part after 'NatSc'
            const natsciNum = (cat.match(/^natsc\s*(.*)$/i) || [])[1]?.trim();
            const courseParts = course.catNo.split(/\s+/);
            const dept = courseParts[0]?.toUpperCase();
            const num = courseParts[1];
            // Only match if dept and num are both defined and dept is in the umbrella list
            return (
              dept &&
              num &&
              ["CHEM", "ENVI", "BIO", "PHYS"].includes(dept) &&
              natsciNum &&
              num.replace(/\s+/g, "") === natsciNum.replace(/\s+/g, "")
            );
          }
          // FLC umbrella logic (case-insensitive, robust)
          if (/^flc\s*/i.test(cat)) {
            const flcNum = (cat.match(/^flc\s*(.*)$/i) || [])[1]?.trim();
            const courseParts = course.catNo.split(/\s+/);
            const dept = courseParts[0]?.toUpperCase();
            const num = courseParts[1];
            const isFLCDept = [
              "JPN",
              "KRN",
              "CSP",
              "FRE",
              "GER",
              "ITA",
              "RUSS",
              "SPA",
            ].includes(dept);
            const match =
              dept &&
              num &&
              isFLCDept &&
              flcNum &&
              num.replace(/\s+/g, "") === flcNum.replace(/\s+/g, "");
            if (isFLCDept) {
              console.log(
                `[DEBUG] FLC check: cat='${cat}' flcNum='${flcNum}' offering='${course.catNo}' dept='${dept}' num='${num}' match=${match}`
              );
            }
            return match;
          }
          // Default: match by normalized startsWith (not includes)
          return norm(course.catNo) === norm(cat);
        });
      });
      // Only further filter by selectedCourse if it is not a NatSc umbrella course
      if (
        selectedCourse &&
        !/^natsc\s*/i.test(selectedCourse) &&
        !/^flc\s*/i.test(selectedCourse)
      ) {
        filtered = filtered.filter(
          (c) => norm(c.catNo) === norm(selectedCourse)
        );
      }
      // If selectedCourse is an FLC umbrella course, only use that for filtering
      if (selectedCourse && /^flc\s*/i.test(selectedCourse)) {
        curriculumCatNos = [selectedCourse];
      }
      // DEBUG: Log the actual filtered array after umbrella logic
      console.log("[DEBUG] Filtered umbrella courses array:", filtered);
      return filtered;
    }
    return [];
  }, [
    activeFilter,
    selectedSemester,
    selectedDepartment,
    curriculum,
    subjectOffering,
    selectedCourse,
  ]);

  // Further filter by sidebar filters (optional)
  const furtherFilteredCourses = useMemo(() => {
    return filteredCourses.filter(
      (course) =>
        (selectedInstructors.length === 0 ||
          selectedInstructors.includes(course.instructor)) &&
        (selectedCatNos.length === 0 ||
          selectedCatNos.includes(course.catNo)) &&
        (selectedCourseTitles.length === 0 ||
          selectedCourseTitles.includes(course.courseTitle)) &&
        (selectedTime.length === 0 || selectedTime.includes(course.time))
    );
  }, [
    filteredCourses,
    selectedInstructors,
    selectedCatNos,
    selectedCourseTitles,
    selectedTime,
  ]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return furtherFilteredCourses.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [furtherFilteredCourses, page]);

  const pageCount = Math.ceil(furtherFilteredCourses.length / ITEMS_PER_PAGE);

  const instructors = useMemo(
    () =>
      Array.from(new Set(filteredCourses.map((course) => course.instructor))),
    [filteredCourses]
  );
  const catNos = useMemo(
    () => Array.from(new Set(filteredCourses.map((course) => course.catNo))),
    [filteredCourses]
  );
  const courseTitles = useMemo(
    () =>
      Array.from(new Set(filteredCourses.map((course) => course.courseTitle))),
    [filteredCourses]
  );
  const times = useMemo(() => {
    const uniqueTimes = Array.from(
      new Set(filteredCourses.map((course) => course.time))
    );
    return sortTimeslots(uniqueTimes);
  }, [filteredCourses]);

  useEffect(() => {
    setPage(1);
  }, [
    selectedInstructors,
    selectedCatNos,
    selectedTime,
    selectedCourseTitles,
    curriculum,
    selectedDepartment,
    activeFilter,
  ]);

  // Handlers to set activeFilter
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    setActiveFilter("department");
  };
  const handleProgramChange = (setter) => (value) => {
    setter(value);
    setActiveFilter("program");
  };

  return (
    <>
      <CssBaseline />
      {/* DepartmentSelector at the very top, styled in a Paper with matching padding, no label */}

      <Box
        sx={{
          minHeight: "95vh",
          p: 1,
          gap: 3,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          paddingX: "2em",
        }}
      >
        <div>
          <DepartmentSelector
            value={selectedDepartment}
            setDepartment={handleDepartmentChange}
          />
        </div>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <div className="flex flex-col gap-5 ">
            {/* Program/IPS Filter Accordion */}
            <Accordion
              defaultExpanded
              sx={{
                width: { xs: "100%", md: "400px" },
                borderRadius: "6px",
                background: "#1e1e1e",
                border: "1px solid #374151",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Program/IPS Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ProgramIPSFilterCard
                  programLabels={programLabels}
                  selectedProgram={selectedProgram}
                  setSelectedProgram={handleProgramChange(setSelectedProgram)}
                  yearOptions={yearOptions}
                  selectedYear={selectedYear}
                  setSelectedYear={handleProgramChange(setSelectedYear)}
                  semesterOptions={semesterOptions}
                  selectedSemester={selectedSemester}
                  setSelectedSemester={handleProgramChange(setSelectedSemester)}
                />
              </AccordionDetails>
            </Accordion>
            {/* Courses in this Semester Accordion (immediately after Program/IPS Filter) */}
            <Accordion
              defaultExpanded
              sx={{
                width: { xs: "100%", md: "400px" },
                borderRadius: "6px",
                background: "#1e1e1e",
                border: "1px solid #374151",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Courses in this Semester</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CourseListSidebar
                  selectedSemester={selectedSemester}
                  selectedCourse={selectedCourse}
                  setSelectedCourse={setSelectedCourse}
                  customScrollbar
                />
              </AccordionDetails>
            </Accordion>
            {/* Filters Accordion */}
            <Accordion
              defaultExpanded={false}
              sx={{
                width: { xs: "100%", md: "400px" },
                borderRadius: "6px",
                background: "#1e1e1e",
                border: "1px solid #374151",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Autocomplete
                    multiple
                    options={instructors}
                    value={selectedInstructors}
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
                    onChange={(_, newValue) =>
                      setSelectedCourseTitles(newValue)
                    }
                  />
                  <Autocomplete
                    multiple
                    options={times}
                    value={selectedTime}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filter by Time"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={`courseTime-${index}`}
                            variant="outlined"
                            label={option}
                            {...tagProps}
                          />
                        );
                      })
                    }
                    onChange={(_, newValue) => setSelectedTime(newValue)}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                width: { xs: "100%", md: "400px" },
                flexShrink: 0,
                background: "#1e1e1e",
                borderRadius: "6px",
                border: "1px solid #374151",
              }}
              className="rounded-md border border-gray-700"
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
              background: "#1e1e1e",
              borderRadius: "6px",
              border: "1px solid #374151",
            }}
            className="rounded-md border border-gray-700"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <div>
                <Typography variant="h6">
                  Program Offerings for {currentSemesterString}
                </Typography>
                <span className="text-secondary text-xs">
                  Last updated: {new Date(lastUpdated).toLocaleString()}. If the
                  data is not up to date please contact me! @alexi_canamo on IG
                  or @heyitsalexi on discord.
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
            {furtherFilteredCourses.length > 0 ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    className="pb-5"
                    size={isMobile ? "small" : "medium"}
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
                {isLoading && <div>Loading..</div>}
              </>
            ) : (
              !isLoading && (
                <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
                  No courses found. Please select a program, year, and semester,
                  or select a department.
                </Typography>
              )
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default function ProgramOfferingsPage() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProgramOfferingsContent />
      </Suspense>
    </ThemeProvider>
  );
}
