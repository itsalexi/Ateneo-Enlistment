'use client';

import { useState, useRef, useMemo } from 'react';
import Calendar from '@/components/Calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFavoriteCourses, useSelectedCourses } from '@/lib/context';
import { parseTimeRange } from '@/lib/helper';

import {
    Box,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

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
    const { favoriteCourses, setFavoriteCourses } = useFavoriteCourses();
    const { selectedCourses, toggleSelected, setSelectedCourses } =
        useSelectedCourses();
    const tableRef = useRef();
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importType, setImportType] = useState('');
    const [importData, setImportData] = useState('');
    const [favoriteSearchTerm, setFavoriteSearchTerm] = useState('');
    const [selectedSearchTerm, setSelectedSearchTerm] = useState('');

    // Filter favorite courses based on search term
    const filteredFavoriteCourses = useMemo(() => {
        if (!favoriteSearchTerm) return favoriteCourses;

        const searchLower = favoriteSearchTerm.toLowerCase();
        return favoriteCourses.filter(
            (course) =>
                course.catNo?.toLowerCase().includes(searchLower) ||
                course.section?.toLowerCase().includes(searchLower) ||
                course.courseTitle?.toLowerCase().includes(searchLower) ||
                course.instructor?.toLowerCase().includes(searchLower) ||
                course.time?.toLowerCase().includes(searchLower) ||
                course.room?.toLowerCase().includes(searchLower)
        );
    }, [favoriteCourses, favoriteSearchTerm]);

    // Filter selected courses based on search term
    const filteredSelectedCourses = useMemo(() => {
        if (!selectedSearchTerm) return selectedCourses;

        const searchLower = selectedSearchTerm.toLowerCase();
        return selectedCourses.filter(
            (course) =>
                course.catNo?.toLowerCase().includes(searchLower) ||
                course.section?.toLowerCase().includes(searchLower) ||
                course.courseTitle?.toLowerCase().includes(searchLower) ||
                course.instructor?.toLowerCase().includes(searchLower) ||
                course.time?.toLowerCase().includes(searchLower) ||
                course.room?.toLowerCase().includes(searchLower)
        );
    }, [selectedCourses, selectedSearchTerm]);

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

    const exportCoursesAsJSON = (courses, type) => {
        const jsonString = JSON.stringify(courses, null, 2);
        navigator.clipboard
            .writeText(jsonString)
            .then(() => {
                toast({
                    title: 'Exported Successfully',
                    description: `${type} courses JSON copied to clipboard.`,
                });
            })
            .catch((err) => {
                console.error('Failed to copy JSON to clipboard:', err);
                toast({
                    title: 'Export Failed',
                    description:
                        'Failed to copy JSON to clipboard. Please try again.',
                    variant: 'destructive',
                });
            });
    };

    const importCoursesFromJSON = () => {
        try {
            const data = JSON.parse(importData);
            if (importType === 'Favorite') {
                setFavoriteCourses(data);
            } else if (importType === 'Selected') {
                setSelectedCourses(data);
            }
            setImportModalOpen(false);
            setImportData('');
            toast({
                title: 'Import Successful',
                description: `${importType} courses have been imported.`,
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            toast({
                title: 'Import Failed',
                description:
                    'Failed to parse JSON data. Please check the format and try again.',
                variant: 'destructive',
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
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {course.catNo} - {course.section}
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
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        {course.instructor}
                                    </Typography>
                                </Box>
                                <Tooltip
                                    title={
                                        parseTimeRange(course.time) === null
                                            ? 'no timestamp'
                                            : ''
                                    }
                                >
                                    <span>
                                        <Button
                                            variant={
                                                type === 'favorite'
                                                    ? 'outlined'
                                                    : 'contained'
                                            }
                                            color="secondary"
                                            onClick={() =>
                                                toggleSelected(course)
                                            }
                                            disabled={
                                                type === 'favorite' &&
                                                parseTimeRange(course.time) ===
                                                    null
                                            }
                                            size="small"
                                        >
                                            {type === 'favorite'
                                                ? 'Add'
                                                : 'Remove'}
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
                        <TableHead className="text-center">
                            Instructor
                        </TableHead>
                        <TableHead className="text-center">Time</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="text-center">
                                    {course.catNo}
                                </TableCell>
                                <TableCell className="text-center">
                                    {course.section}
                                </TableCell>
                                <TableCell className="text-center">
                                    {course.courseTitle}
                                </TableCell>
                                <TableCell className="text-center">
                                    {course.instructor}
                                </TableCell>
                                <TableCell className="text-center">
                                    {course.time}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant={
                                            type === 'favorite'
                                                ? 'secondary'
                                                : 'destructive'
                                        }
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
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Search favorite courses..."
                                        value={favoriteSearchTerm}
                                        onChange={(e) =>
                                            setFavoriteSearchTerm(
                                                e.target.value
                                            )
                                        }
                                        className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-gray-600 focus:ring-gray-600"
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <CourseTable
                                        courses={filteredFavoriteCourses.filter(
                                            (course) =>
                                                !selectedCourses.some(
                                                    (sc) => sc.id === course.id
                                                )
                                        )}
                                        type="favorite"
                                    />
                                </ScrollArea>
                                <div className="flex justify-between">
                                    <Button
                                        onClick={() =>
                                            exportCoursesAsJSON(
                                                favoriteCourses,
                                                'Favorite'
                                            )
                                        }
                                    >
                                        Export Favorites
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setImportType('Favorite');
                                            setImportModalOpen(true);
                                        }}
                                    >
                                        Import Favorites
                                    </Button>
                                </div>
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Search selected courses..."
                                        value={selectedSearchTerm}
                                        onChange={(e) =>
                                            setSelectedSearchTerm(
                                                e.target.value
                                            )
                                        }
                                        className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-gray-600 focus:ring-gray-600"
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <CourseTable
                                        courses={filteredSelectedCourses}
                                        type="selected"
                                    />
                                </ScrollArea>
                                <div className="flex justify-between">
                                    <Button
                                        onClick={() =>
                                            exportCoursesAsJSON(
                                                selectedCourses,
                                                'Selected'
                                            )
                                        }
                                    >
                                        Export Selected
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setImportType('Selected');
                                            setImportModalOpen(true);
                                        }}
                                    >
                                        Import Selected
                                    </Button>
                                </div>
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
                                <a
                                    className="text-center"
                                    href="https://alexi.life"
                                >
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
                    <Calendar
                        selectedCourses={selectedCourses}
                        use24Hour={true}
                    />
                </Paper>
            </Box>
            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import {importType} Courses</DialogTitle>
                        <DialogDescription>
                            Paste the JSON data for {importType.toLowerCase()}{' '}
                            courses below. This will overwrite your current list
                            of {importType.toLowerCase()} courses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="importData" className="text-right">
                                JSON Data
                            </Label>
                            <Input
                                id="importData"
                                className="col-span-3"
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={importCoursesFromJSON}>Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}
