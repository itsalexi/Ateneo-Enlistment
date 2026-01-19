"use client";

import { useState, useRef, useMemo } from "react";
import Calendar from "@/components/Calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavoriteCourses, useSchedules } from "@/lib/context";
import { parseTimeRange, findConflictingCourses } from "@/lib/helper";

import {
  Box,
  createTheme,
  Paper,
  ThemeProvider,
  Typography,
  Tab,
  Tabs,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery, useTheme } from "@mui/material";
import { toPng } from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  X,
  Edit2,
  Check,
  X as XIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

export default function Page() {
  const { favoriteCourses, setFavoriteCourses } = useFavoriteCourses();
  const {
    schedules,
    activeScheduleId,
    setActiveScheduleId,
    createSchedule,
    deleteSchedule,
    renameSchedule,
    selectedCourses,
    toggleSelected,
    setSelectedCourses,
  } = useSchedules();

  const tableRef = useRef();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState("");
  const [importData, setImportData] = useState("");
  const [favoriteSearchTerm, setFavoriteSearchTerm] = useState("");
  const [selectedSearchTerm, setSelectedSearchTerm] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editingScheduleName, setEditingScheduleName] = useState("");
  const [newScheduleDialogOpen, setNewScheduleDialogOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [favoriteSortConfig, setFavoriteSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [selectedSortConfig, setSelectedSortConfig] = useState({
    key: null,
    direction: "asc",
  });

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
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "schedule.png";
          link.click();
        })
        .catch((err) => {
          console.error("Failed to export table:", err);
        });
    }
  };

  const exportCoursesAsJSON = (courses, type) => {
    const jsonString = JSON.stringify(courses, null, 2);
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        toast({
          title: "Exported Successfully",
          description: `${type} courses JSON copied to clipboard.`,
        });
      })
      .catch((err) => {
        console.error("Failed to copy JSON to clipboard:", err);
        toast({
          title: "Export Failed",
          description: "Failed to copy JSON to clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };

  const importCoursesFromJSON = () => {
    try {
      const data = JSON.parse(importData);
      if (importType === "Favorite") {
        setFavoriteCourses(data);
      } else if (importType === "Selected") {
        setSelectedCourses(data);
      }
      setImportModalOpen(false);
      setImportData("");
      toast({
        title: "Import Successful",
        description: `${importType} courses have been imported.`,
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      toast({
        title: "Import Failed",
        description:
          "Failed to parse JSON data. Please check the format and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSchedule = () => {
    if (newScheduleName.trim()) {
      createSchedule(newScheduleName.trim());
      setNewScheduleName("");
      setNewScheduleDialogOpen(false);
      toast({
        title: "Schedule Created",
        description: `"${newScheduleName}" has been created.`,
      });
    }
  };

  const handleDeleteSchedule = (scheduleId) => {
    const success = deleteSchedule(scheduleId);
    if (success) {
      toast({
        title: "Schedule Deleted",
        description: "The schedule has been deleted.",
      });
    } else {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one schedule.",
        variant: "destructive",
      });
    }
  };

  const handleRenameSchedule = (scheduleId, newName) => {
    if (newName.trim()) {
      renameSchedule(scheduleId, newName.trim());
      setEditingScheduleId(null);
      setEditingScheduleName("");
      toast({
        title: "Schedule Renamed",
        description: `Schedule renamed to "${newName}".`,
      });
    }
  };

  const handleCourseToggle = (course, type) => {
    if (type === "favorite") {
      const success = toggleSelected(course);
      if (success) {
        toast({
          title: "Course Added",
          description: `${course.catNo} - ${course.section} has been added to your schedule.`,
        });
      }
    } else {
      toggleSelected(course);
      toast({
        title: "Course Removed",
        description: `${course.catNo} - ${course.section} has been removed from your schedule.`,
      });
    }
  };

  const startEditing = (schedule) => {
    setEditingScheduleId(schedule.id);
    setEditingScheduleName(schedule.name);
  };

  const cancelEditing = () => {
    setEditingScheduleId(null);
    setEditingScheduleName("");
  };

  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";

      if (sortConfig.key === "catNo") {
        const aNum = aValue.match(/\d+/);
        const bNum = bValue.match(/\d+/);
        if (aNum && bNum) {
          const comparison = parseInt(aNum[0]) - parseInt(bNum[0]);
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }
      }

      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (key, type) => {
    const currentConfig =
      type === "favorite" ? favoriteSortConfig : selectedSortConfig;
    const setConfig =
      type === "favorite" ? setFavoriteSortConfig : setSelectedSortConfig;

    let direction = "asc";
    if (currentConfig.key === key && currentConfig.direction === "asc") {
      direction = "desc";
    }

    setConfig({ key, direction });
  };

  const getSortIcon = (columnKey, sortConfig) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-400" />
    );
  };

  const hasConflictWithSchedule = (course) => {
    return findConflictingCourses(course, selectedCourses).length > 0;
  };

  const CourseTable = ({ courses, type }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const sortConfig =
      type === "favorite" ? favoriteSortConfig : selectedSortConfig;
    const sortedCourses = sortData(courses, sortConfig);

    if (isMobile) {
      return (
        <div className="flex flex-col gap-2">
          {sortedCourses.length > 0 ? (
            sortedCourses.map((course) => (
              <Paper
                key={course.id}
                elevation={1}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor:
                    type === "favorite" && hasConflictWithSchedule(course)
                      ? "error.main"
                      : "neutral.700",
                  backgroundColor:
                    type === "favorite" && hasConflictWithSchedule(course)
                      ? "error.dark"
                      : "background.paper",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {course.catNo} - {course.section}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {course.time}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {course.courseTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {course.instructor}
                  </Typography>
                </Box>
                <Tooltip
                  title={
                    parseTimeRange(course.time) === null
                      ? "No valid time format"
                      : type === "favorite" && hasConflictWithSchedule(course)
                      ? "This course conflicts with your current schedule"
                      : ""
                  }
                >
                  <span>
                    <Button
                      variant={type === "favorite" ? "outlined" : "contained"}
                      color="secondary"
                      onClick={() => handleCourseToggle(course, type)}
                      disabled={
                        type === "favorite" &&
                        (parseTimeRange(course.time) === null ||
                          hasConflictWithSchedule(course))
                      }
                      size="small"
                    >
                      {type === "favorite" ? "Add" : "Remove"}
                    </Button>
                  </span>
                </Tooltip>
              </Paper>
            ))
          ) : (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 2 }}
            >
              {type === "favorite"
                ? "No favorite courses available. Add more to your favorites!"
                : "No courses selected yet!"}
            </Typography>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead
              className="text-center cursor-pointer hover:bg-gray-800 transition-colors text-gray-300"
              onClick={() => handleSort("catNo", type)}
            >
              <div className="flex items-center justify-center gap-2">
                Course
                {getSortIcon("catNo", sortConfig)}
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer hover:bg-gray-800 transition-colors text-gray-300"
              onClick={() => handleSort("section", type)}
            >
              <div className="flex items-center justify-center gap-2">
                Section
                {getSortIcon("section", sortConfig)}
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer hover:bg-gray-800 transition-colors text-gray-300"
              onClick={() => handleSort("courseTitle", type)}
            >
              <div className="flex items-center justify-center gap-2">
                Title
                {getSortIcon("courseTitle", sortConfig)}
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer hover:bg-gray-800 transition-colors text-gray-300"
              onClick={() => handleSort("instructor", type)}
            >
              <div className="flex items-center justify-center gap-2">
                Instructor
                {getSortIcon("instructor", sortConfig)}
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer hover:bg-gray-800 transition-colors text-gray-300"
              onClick={() => handleSort("time", type)}
            >
              <div className="flex items-center justify-center gap-2">
                Time
                {getSortIcon("time", sortConfig)}
              </div>
            </TableHead>
            <TableHead className="text-center text-gray-300">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCourses.length > 0 ? (
            sortedCourses.map((course) => (
              <TableRow
                key={course.id}
                className={`border-gray-700 hover:bg-gray-800/50 transition-colors ${
                  type === "favorite" && hasConflictWithSchedule(course)
                    ? "bg-red-900/20 border-red-500"
                    : ""
                }`}
              >
                <TableCell className="text-center text-gray-200">
                  {course.catNo}
                </TableCell>
                <TableCell className="text-center text-gray-200">
                  {course.section}
                </TableCell>
                <TableCell className="text-center text-gray-200">
                  {course.courseTitle}
                </TableCell>
                <TableCell className="text-center text-gray-200">
                  {course.instructor}
                </TableCell>
                <TableCell className="text-center text-gray-200">
                  {course.time}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant={type === "favorite" ? "secondary" : "destructive"}
                    onClick={() => handleCourseToggle(course, type)}
                    disabled={
                      type === "favorite" &&
                      (parseTimeRange(course.time) === null ||
                        hasConflictWithSchedule(course))
                    }
                  >
                    {type === "favorite" ? "Add" : "Remove"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-gray-700">
              <TableCell colSpan={6} className="text-center text-gray-400">
                {type === "favorite"
                  ? "No favorite courses available. Add more to your favorites!"
                  : "No courses selected yet!"}
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
          minHeight: "95vh",
          p: 1,
          gap: 3,
          display: "flex",
          bgcolor: "background.default",
          paddingX: "2em",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* Schedule Tabs */}
        <Paper
          elevation={0}
          sx={{ p: 2 }}
          className="rounded-lg border-[1px] border-neutral-700"
        >
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6">Schedules</Typography>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setNewScheduleDialogOpen(true)}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                New Schedule
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  schedule.id === activeScheduleId
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {editingScheduleId === schedule.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingScheduleName}
                      onChange={(e) => setEditingScheduleName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameSchedule(
                            schedule.id,
                            editingScheduleName
                          );
                        } else if (e.key === "Escape") {
                          cancelEditing();
                        }
                      }}
                      className="w-32 h-6 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleRenameSchedule(schedule.id, editingScheduleName)
                      }
                      className="p-1 h-6 w-6"
                    >
                      <Check size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditing}
                      className="p-1 h-6 w-6"
                    >
                      <XIcon size={12} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span
                      className="cursor-pointer"
                      onClick={() => setActiveScheduleId(schedule.id)}
                    >
                      {schedule.name}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(schedule)}
                        className="p-1 h-6 w-6 hover:bg-gray-600"
                      >
                        <Edit2 size={12} />
                      </Button>
                      {schedules.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1 h-6 w-6 hover:bg-red-600"
                        >
                          <X size={12} />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Paper>

        <div className="">
          <div className="flex flex-col md:flex-row gap-5 ">
            <Paper
              elevation={0}
              sx={{
                p: 2,
                flex: "1",
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Typography variant="h6" gutterBottom>
                Favorite Courses
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Search favorite courses..."
                    value={favoriteSearchTerm}
                    onChange={(e) => setFavoriteSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-gray-600 focus:ring-gray-600"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  <CourseTable
                    courses={filteredFavoriteCourses.filter(
                      (course) =>
                        !selectedCourses.some((sc) => sc.id === course.id)
                    )}
                    type="favorite"
                  />
                </ScrollArea>
                <div className="flex justify-between">
                  <Button
                    onClick={() =>
                      exportCoursesAsJSON(favoriteCourses, "Favorite")
                    }
                  >
                    Export Favorites
                  </Button>
                  <Button
                    onClick={() => {
                      setImportType("Favorite");
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
                flex: "1",
              }}
              className="rounded-lg border-[1px] border-neutral-700"
            >
              <Typography variant="h6" gutterBottom>
                Selected Courses
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Search selected courses..."
                    value={selectedSearchTerm}
                    onChange={(e) => setSelectedSearchTerm(e.target.value)}
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
                      exportCoursesAsJSON(selectedCourses, "Selected")
                    }
                  >
                    Export Selected
                  </Button>
                  <Button
                    onClick={() => {
                      setImportType("Selected");
                      setImportModalOpen(true);
                    }}
                  >
                    Import Selected
                  </Button>
                </div>
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

      <Paper
        elevation={0}
        sx={{
          p: 2,
          flex: { xs: "1", md: "0.5" },
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="rounded-lg border-[1px] border-neutral-700"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
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
      {/* Import Dialog */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">
              Import {importType} Courses
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Paste the JSON data for {importType.toLowerCase()} courses below.
              This will overwrite your current list of{" "}
              {importType.toLowerCase()} courses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="importData" className="text-right text-gray-300">
                JSON Data
              </Label>
              <Input
                id="importData"
                className="col-span-3 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-gray-600 focus:ring-gray-600"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON data here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={importCoursesFromJSON}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog
        open={newScheduleDialogOpen}
        onOpenChange={setNewScheduleDialogOpen}
      >
        <DialogContent className="bg-gray-900 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">
              Create New Schedule
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for your new schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="scheduleName"
                className="text-right text-gray-300"
              >
                Schedule Name
              </Label>
              <Input
                id="scheduleName"
                className="col-span-3 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-gray-600 focus:ring-gray-600"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateSchedule();
                  }
                }}
                placeholder="Enter schedule name..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreateSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
