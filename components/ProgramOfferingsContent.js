'use client';
import ColumnToggle from '@/components/ColumnToggle';
import OfferingsTable from '@/components/OfferingsTable';
import {
    Box,
    Chip,
    CssBaseline,
    Pagination,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
    Autocomplete,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useFavoriteCourses } from '@/lib/context';
import { sortTimeslots } from '@/lib/helper';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DepartmentSelector from '@/components/DepartmentSelector';
import CourseListSidebar from '@/components/CourseListSidebar';
import ProgramIPSFilterCard from '@/components/ProgramIPSFilterCard';

export default function ProgramOfferingsContent({
    darkTheme,
    initialTableVisibility,
    initialCardVisibility,
    ITEMS_PER_PAGE,
    currentSemesterString,
    lastUpdated,
}) {
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));
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
    const [selectedDepartment, setSelectedDepartment] = useState('');
    // Track which filter was last changed
    const [activeFilter, setActiveFilter] = useState('program'); // 'department' or 'program'

    // Custom IPS state - initialize empty, load from localStorage in useEffect
    const [customCourses, setCustomCourses] = useState([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Restore data from localStorage after hydration
    useEffect(() => {
        setIsHydrated(true);

        const savedCourses = localStorage.getItem(
            'ateneo-enlistment-custom-courses'
        );
        const savedProgram = localStorage.getItem(
            'ateneo-enlistment-selected-program'
        );

        let courses = [];
        if (savedCourses) {
            try {
                courses = JSON.parse(savedCourses);
            } catch (error) {
                console.error('Error restoring saved courses:', error);
            }
        }

        if (savedProgram) {
            try {
                const program = JSON.parse(savedProgram);
                setCustomCourses(courses);
                setSelectedSemester(program);
            } catch (error) {
                console.error('Error restoring saved program:', error);
                if (courses.length > 0) {
                    createPhantomProgram(courses);
                }
            }
        } else if (courses.length > 0) {
            createPhantomProgram(courses);
        } else {
            setCustomCourses([]);
        }

        function createPhantomProgram(coursesArray) {
            setCustomCourses(coursesArray);
            setSelectedSemester({
                id: 'phantom',
                name: 'Custom Program',
                label: 'Custom Program',
                program_info: 'Custom Program',
                courses: coursesArray,
            });
        }
    }, []);

    // Save customCourses to localStorage whenever it changes (only after hydration)
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(
                'ateneo-enlistment-custom-courses',
                JSON.stringify(customCourses)
            );
        }
    }, [customCourses, isHydrated]);

    // Save selectedSemester to localStorage whenever it changes (only after hydration)
    useEffect(() => {
        if (isHydrated && selectedSemester) {
            localStorage.setItem(
                'ateneo-enlistment-selected-program',
                JSON.stringify(selectedSemester)
            );
        }
    }, [selectedSemester, isHydrated]);

    // Custom setter for selectedCourse to handle filter switching
    const setSelectedCourse = (course) => {
        setPage(1);
        _setSelectedCourse(course);
        if (course && selectedSemester) {
            setActiveFilter('program');
        }
    };

    // Fetch program list on mount
    useEffect(() => {
        const fetchProgramList = async () => {
            const data = await fetch('/api/programs');
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
        if (activeFilter === 'department' && selectedDepartment) {
            return subjectOffering.filter(
                (course) => course.deptCode === selectedDepartment
            );
        }
        if (activeFilter === 'program' && customCourses.length > 0) {
            let curriculumCatNos = customCourses.map((c) => c.catNo);
            if (selectedCourse && /^natsc\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (selectedCourse && /^flc\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (selectedCourse && /^nstp\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (selectedCourse && /^philo\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (
                selectedCourse &&
                /^(pathfit|pepc|phyed|pe)\s*/i.test(selectedCourse)
            ) {
                curriculumCatNos = [selectedCourse];
            }
            const norm = (s) => s.toLowerCase().replace(/\s+/g, '');
            let filtered = subjectOffering.filter((course) => {
                return curriculumCatNos.some((cat) => {
                    if (/^natsc\s*/i.test(cat)) {
                        const natsciNum = (cat.match(/^natsc\s*(.*)$/i) ||
                            [])[1]?.trim();
                        const courseParts = course.catNo.split(/\s+/);
                        const dept = courseParts[0]?.toUpperCase();
                        const num = courseParts[1];
                        return (
                            dept &&
                            num &&
                            ['CHEM', 'ENVI', 'BIO', 'PHYS'].includes(dept) &&
                            natsciNum &&
                            num.replace(/\s+/g, '') ===
                                natsciNum.replace(/\s+/g, '')
                        );
                    }
                    if (/^flc\s*/i.test(cat)) {
                        const flcNum = (cat.match(/^flc\s*(.*)$/i) ||
                            [])[1]?.trim();
                        const courseParts = course.catNo.split(/\s+/);
                        const dept = courseParts[0]?.toUpperCase();
                        const num = courseParts[1];
                        const isFLCDept = [
                            'JPN',
                            'KRN',
                            'CSP',
                            'FRE',
                            'GER',
                            'ITA',
                            'RUSS',
                            'SPA',
                        ].includes(dept);
                        return (
                            dept &&
                            num &&
                            isFLCDept &&
                            flcNum &&
                            num.replace(/\s+/g, '') ===
                                flcNum.replace(/\s+/g, '')
                        );
                    }
                    if (/^nstp\s*/i.test(cat)) {
                        const nstpNum = (cat.match(/^nstp\s*(\d+)/i) ||
                            [])[1]?.trim();
                        const match = course.catNo
                            .toUpperCase()
                            .startsWith(`NSTP ${nstpNum}`);
                        return nstpNum && match;
                    }
                    if (/^philo\s*/i.test(cat)) {
                        const philoNum = (cat.match(/^philo\s*(\d+)/i) ||
                            [])[1]?.trim();
                        const match = course.catNo
                            .toUpperCase()
                            .startsWith(`PHILO ${philoNum}`);
                        return philoNum && match;
                    }
                    if (/^(pathfit|pepc|phyed|pe)\s*/i.test(cat)) {
                        return course.deptCode === 'PE';
                    }
                    return norm(course.catNo) === norm(cat);
                });
            });
            if (
                selectedCourse &&
                !/^natsc\s*/i.test(selectedCourse) &&
                !/^flc\s*/i.test(selectedCourse) &&
                !/^nstp\s*/i.test(selectedCourse) &&
                !/^philo\s*/i.test(selectedCourse) &&
                !/^(pathfit|pepc|phyed|pe)\s*/i.test(selectedCourse)
            ) {
                filtered = filtered.filter(
                    (c) => norm(c.catNo) === norm(selectedCourse)
                );
            }
            if (selectedCourse && /^flc\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (selectedCourse && /^nstp\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (selectedCourse && /^philo\s*/i.test(selectedCourse)) {
                curriculumCatNos = [selectedCourse];
            }
            if (
                selectedCourse &&
                /^(pathfit|pepc|phyed|pe)\s*/i.test(selectedCourse)
            ) {
                curriculumCatNos = [selectedCourse];
            }
            return filtered;
        }
        return [];
    }, [
        activeFilter,
        selectedSemester,
        selectedDepartment,
        subjectOffering,
        selectedCourse,
        customCourses,
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
                (selectedTime.length === 0 ||
                    selectedTime.includes(course.time))
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
            Array.from(
                new Set(filteredCourses.map((course) => course.instructor))
            ),
        [filteredCourses]
    );
    const catNos = useMemo(
        () =>
            Array.from(new Set(filteredCourses.map((course) => course.catNo))),
        [filteredCourses]
    );
    const courseTitles = useMemo(
        () =>
            Array.from(
                new Set(filteredCourses.map((course) => course.courseTitle))
            ),
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
        setActiveFilter('department');
    };
    const handleProgramChange = (setter) => (value) => {
        setter(value);
        setActiveFilter('program');
    };

    // Export/Import IPS functions
    const exportIPS = () => {
        const data = {
            courses: customCourses,
            program: selectedSemester
                ? {
                      id: selectedSemester.id,
                      name: selectedSemester.name,
                      label: selectedSemester.label,
                      program_info: selectedSemester.program_info,
                  }
                : null,
            exportDate: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ateneo-ips-${
            new Date().toISOString().split('T')[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importIPS = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.courses && Array.isArray(data.courses)) {
                    setCustomCourses(data.courses);
                    if (data.program) {
                        setSelectedSemester(data.program);
                    }
                    alert('IPS imported successfully!');
                } else {
                    alert('Invalid IPS file format.');
                }
            } catch (error) {
                alert('Error reading IPS file: ' + error.message);
            }
        };
        reader.readAsText(file);
        // Reset the input
        event.target.value = '';
    };

    return (
        <>
            <CssBaseline />
            {/* DepartmentSelector at the very top, styled in a Paper with matching padding, no label */}

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
                <div>
                    <DepartmentSelector
                        value={selectedDepartment}
                        setDepartment={handleDepartmentChange}
                    />
                </div>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        flexDirection: { xs: 'column', md: 'row' },
                    }}
                >
                    <div className="flex flex-col gap-2 ">
                        {/* Program/IPS Filter Accordion */}
                        <Accordion
                            defaultExpanded
                            sx={{
                                width: { xs: '100%', md: '400px' },
                                borderRadius: '6px',
                                background: '#1e1e1e',
                                border: '1px solid #374151',
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    IPS Selector
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ProgramIPSFilterCard
                                    programLabels={programLabels}
                                    selectedProgram={selectedProgram}
                                    setSelectedProgram={handleProgramChange(
                                        setSelectedProgram
                                    )}
                                    yearOptions={yearOptions}
                                    selectedYear={selectedYear}
                                    setSelectedYear={handleProgramChange(
                                        setSelectedYear
                                    )}
                                    semesterOptions={semesterOptions}
                                    selectedSemester={selectedSemester}
                                    setSelectedSemester={handleProgramChange(
                                        setSelectedSemester
                                    )}
                                />
                            </AccordionDetails>
                        </Accordion>
                        {/* Courses in this Semester Accordion (immediately after Program/IPS Filter) */}
                        <Accordion
                            defaultExpanded
                            sx={{
                                width: { xs: '100%', md: '400px' },
                                borderRadius: '6px',
                                background: '#1e1e1e',
                                border: '1px solid #374151',
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    Your IPS ({customCourses.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                sx={{
                                    padding: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '350px',
                                }}
                            >
                                <Box
                                    sx={{
                                        flex: 1,
                                        overflow: 'auto',
                                        padding: 2,
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#2d2d2d',
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#555',
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: '#666',
                                            },
                                        },
                                        // Firefox scrollbar
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#555 #2d2d2d',
                                    }}
                                >
                                    <CourseListSidebar
                                        selectedSemester={selectedSemester}
                                        setSelectedSemester={
                                            setSelectedSemester
                                        }
                                        selectedCourse={selectedCourse}
                                        setSelectedCourse={setSelectedCourse}
                                        customScrollbar
                                        customCourses={customCourses}
                                        onCustomCoursesChange={setCustomCourses}
                                        onExportIPS={exportIPS}
                                        onImportIPS={importIPS}
                                        listOnly={true}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        padding: 2,
                                        borderTop:
                                            '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: '#1a1a1a',
                                    }}
                                >
                                    <CourseListSidebar
                                        selectedSemester={selectedSemester}
                                        setSelectedSemester={
                                            setSelectedSemester
                                        }
                                        selectedCourse={selectedCourse}
                                        setSelectedCourse={setSelectedCourse}
                                        customScrollbar
                                        customCourses={customCourses}
                                        onCustomCoursesChange={setCustomCourses}
                                        onExportIPS={exportIPS}
                                        onImportIPS={importIPS}
                                        buttonsOnly={true}
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                        {/* Filters Accordion */}
                        <Accordion
                            defaultExpanded={true}
                            sx={{
                                width: { xs: '100%', md: '400px' },
                                borderRadius: '6px',
                                background: '#1e1e1e',
                                border: '1px solid #374151',
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">Filters</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    <Autocomplete
                                        multiple
                                        options={instructors}
                                        value={selectedInstructors}
                                        disableCloseOnSelect
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
                                                const { key, ...tagProps } =
                                                    getTagProps({ index });
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
                                        onChange={(_, newValue) =>
                                            setSelectedInstructors(newValue)
                                        }
                                    />
                                    <Autocomplete
                                        multiple
                                        options={catNos}
                                        value={selectedCatNos}
                                        disableCloseOnSelect
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
                                                const { key, ...tagProps } =
                                                    getTagProps({ index });
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
                                        onChange={(_, newValue) =>
                                            setSelectedCatNos(newValue)
                                        }
                                    />
                                    <Autocomplete
                                        multiple
                                        options={courseTitles}
                                        value={selectedCourseTitles}
                                        disableCloseOnSelect
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
                                                const { key, ...tagProps } =
                                                    getTagProps({ index });
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
                                        disableCloseOnSelect
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
                                                const { key, ...tagProps } =
                                                    getTagProps({ index });
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
                                        onChange={(_, newValue) =>
                                            setSelectedTime(newValue)
                                        }
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                width: { xs: '100%', md: '400px' },
                                flexShrink: 0,
                                background: '#1e1e1e',
                                borderRadius: '6px',
                                border: '1px solid #374151',
                            }}
                            className="rounded-md border border-gray-700"
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
                                <a
                                    className="text-center"
                                    href="https://alexi.life"
                                >
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
                            background: '#1e1e1e',
                            borderRadius: '6px',
                            border: '1px solid #374151',
                        }}
                        className="rounded-md border border-gray-700"
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
                                    Program Offerings for{' '}
                                    {currentSemesterString}
                                </Typography>
                                <span className="text-secondary text-xs">
                                    Last updated:{' '}
                                    {new Date(lastUpdated).toLocaleString()}. If
                                    the data is not up to date please contact
                                    me! @alexi_canamo on IG or @heyitsalexi on
                                    discord.
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
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mt: 2,
                                    }}
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
                                    favoriteCourses={favoriteCourses.map(
                                        (c) => c.id
                                    )}
                                    offerings={paginatedCourses}
                                    columnVisibility={columnVisibility}
                                />
                                {isLoading && <div>Loading..</div>}
                            </>
                        ) : (
                            !isLoading && (
                                <Typography
                                    variant="body1"
                                    sx={{ textAlign: 'center', py: 4 }}
                                >
                                    No courses found. Please select a program,
                                    year, and semester, or select a department.
                                </Typography>
                            )
                        )}
                    </Paper>
                </Box>
            </Box>
        </>
    );
}
