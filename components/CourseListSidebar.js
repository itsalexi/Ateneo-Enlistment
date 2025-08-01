"use client";
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import PostAddIcon from "@mui/icons-material/PostAdd";

export default function CourseListSidebar({
  selectedSemester,
  setSelectedSemester,
  selectedCourse,
  setSelectedCourse,
  customScrollbar,
  onCustomCoursesChange,
  customCourses = [],
  onExportIPS,
  onImportIPS,
  buttonsOnly = false,
  listOnly = false,
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ catNo: "", courseTitle: "" });
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");

  // Helper to generate a unique id
  const generateId = () =>
    window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  // When a program is selected, copy its courses to custom courses
  useEffect(() => {
    if (selectedSemester && selectedSemester.id !== "phantom") {
      // Only update customCourses for real programs, not phantom programs
      // Phantom programs are created with existing customCourses
      const coursesToSet = selectedSemester.courses || [];
      onCustomCoursesChange(coursesToSet);
    }
  }, [selectedSemester, onCustomCoursesChange]);

  // Auto-create phantom program if we have courses but no selected semester
  useEffect(() => {
    if (!selectedSemester && customCourses.length > 0 && setSelectedSemester) {
      setSelectedSemester({
        id: "phantom",
        name: "Custom Program",
        label: "Custom Program",
        program_info: "Custom Program",
        courses: customCourses,
      });
    }
  }, [selectedSemester, customCourses, setSelectedSemester]);

  // Use custom courses for everything
  const coursesToDisplay = customCourses;

  const handleAddCourse = () => {
    // If no program, create a phantom program using setTimeout to ensure proper state update
    if (!selectedSemester && setSelectedSemester) {
      const phantomProgram = {
        id: "phantom",
        name: "Custom Program",
        label: "Custom Program",
        program_info: "Custom Program",
        courses: [],
      };
      setSelectedSemester(phantomProgram);
      // Use setTimeout to ensure state update completes before opening dialog
      setTimeout(() => {
        setNewCourse({ catNo: "", courseTitle: "" });
        setEditingCourse(null);
        setEditDialogOpen(true);
      }, 0);
    } else {
      setNewCourse({ catNo: "", courseTitle: "" });
      setEditingCourse(null);
      setEditDialogOpen(true);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({ catNo: course.catNo, courseTitle: course.courseTitle });
    setEditDialogOpen(true);
  };

  const handleDeleteCourse = (courseToDelete) => {
    const updatedCourses = customCourses.filter(
      (course) => course.id !== courseToDelete.id
    );
    onCustomCoursesChange(updatedCourses);
  };

  const handleSaveCourse = () => {
    if (!newCourse.catNo.trim()) {
      return;
    }
    let updatedCourses;
    if (editingCourse) {
      // Update existing course
      updatedCourses = customCourses.map((course) =>
        course.id === editingCourse.id
          ? { ...newCourse, id: course.id }
          : course
      );
    } else {
      // Add new course with unique id
      updatedCourses = [...customCourses, { ...newCourse, id: generateId() }];
    }
    onCustomCoursesChange(updatedCourses);
    setEditDialogOpen(false);
    setEditingCourse(null);
    setNewCourse({ catNo: "", courseTitle: "" });
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingCourse(null);
    setNewCourse({ catNo: "", courseTitle: "" });
  };

  const handleClearAllCourses = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all courses? This action cannot be undone."
      )
    ) {
      onCustomCoursesChange([]);
      // Reset to no program selected state
      if (setSelectedSemester) {
        setSelectedSemester(null);
      }
    }
  };

  const handleBulkImport = () => {
    // If no program, create a phantom program first
    if (!selectedSemester && setSelectedSemester) {
      const phantomProgram = {
        id: "phantom",
        name: "Custom Program",
        label: "Custom Program",
        program_info: "Custom Program",
        courses: [],
      };
      setSelectedSemester(phantomProgram);
    }
    setBulkImportDialogOpen(true);
  };

  const handleSaveBulkImport = () => {
    if (!bulkImportText.trim()) {
      return;
    }

    // Parse the text input - split by lines and clean up
    const courseLines = bulkImportText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Create course objects from the lines
    const newCourses = courseLines.map((line) => {
      // Split by common delimiters to separate course code from title
      const parts = line.split(/[-–—:;|]/).map((part) => part.trim());
      const catNo = parts[0] || line;
      const courseTitle = parts.length > 1 ? parts.slice(1).join(" ") : "";

      return {
        id: generateId(),
        catNo,
        courseTitle,
      };
    });

    // Add to existing courses, avoiding duplicates
    const existingCatNos = customCourses.map((course) =>
      course.catNo.toLowerCase()
    );
    const uniqueNewCourses = newCourses.filter(
      (course) => !existingCatNos.includes(course.catNo.toLowerCase())
    );

    const updatedCourses = [...customCourses, ...uniqueNewCourses];
    onCustomCoursesChange(updatedCourses);

    setBulkImportDialogOpen(false);
    setBulkImportText("");
  };

  const handleCancelBulkImport = () => {
    setBulkImportDialogOpen(false);
    setBulkImportText("");
  };

  const filteredCourses = Array.isArray(coursesToDisplay)
    ? coursesToDisplay
    : [];

  // Create reusable buttons section
  const buttonsSection = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
      }}
    >
      {/* Primary Actions - Add, Bulk Import, and Clear on same level */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          size="medium"
          onClick={handleAddCourse}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 500,
            flex: 1,
            minWidth: 0,
          }}
        >
          Add
        </Button>

        <Button
          variant="outlined"
          size="medium"
          onClick={handleBulkImport}
          startIcon={<PostAddIcon />}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 500,
            flex: 1,
            minWidth: 0,
          }}
        >
          Bulk
        </Button>

        <Button
          variant="outlined"
          size="medium"
          onClick={handleClearAllCourses}
          startIcon={<DeleteSweepIcon />}
          color="error"
          disabled={customCourses.length === 0}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 500,
            flex: 1,
            minWidth: 0,
          }}
        >
          Clear
        </Button>
      </Box>

      {/* File Operations */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          justifyContent: "center",
          minHeight: "40px",
          alignItems: "center",
          width: "100%",
        }}
      >
        {onExportIPS && (
          <Button
            variant="outlined"
            size="medium"
            onClick={onExportIPS}
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              flex: 1,
            }}
          >
            Export IPS
          </Button>
        )}

        {onImportIPS && (
          <>
            <input
              type="file"
              accept=".json"
              onChange={onImportIPS}
              style={{ display: "none" }}
              id="import-ips-input-buttons"
            />
            <Button
              variant="outlined"
              size="medium"
              onClick={() =>
                document.getElementById("import-ips-input-buttons").click()
              }
              startIcon={<FileUploadIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                flex: 1,
              }}
            >
              Import IPS
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  // Create reusable list section
  const listSection = (
    <Box>
      {/* Header with clear filter button */}
      {selectedCourse && filteredCourses.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            px: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Filtered: {selectedCourse}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSelectedCourse(null)}
            color="secondary"
            title="Clear Course Filter"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          background: "inherit",
          boxShadow: "none",
          mt: 0,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <List dense sx={{ py: 1 }}>
          {filteredCourses.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2, textAlign: "center" }}
            >
              Choose a semester or add a course to get started!
            </Typography>
          ) : (
            filteredCourses.map((course) => (
              <ListItemButton
                key={course.id}
                selected={selectedCourse === course.catNo}
                onClick={() =>
                  setSelectedCourse(
                    selectedCourse === course.catNo ? null : course.catNo
                  )
                }
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  mx: 1,
                  bgcolor:
                    selectedCourse === course.catNo ? "#3b82f6" : "transparent",
                  color:
                    selectedCourse === course.catNo
                      ? "#ffffff"
                      : "text.primary",
                  "&:hover": {
                    bgcolor:
                      selectedCourse === course.catNo
                        ? "#2563eb"
                        : "rgba(255,255,255,0.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ListItemText
                  primary={course.catNo}
                  secondary={course.courseTitle || "No title provided"}
                  primaryTypographyProps={{
                    fontWeight: selectedCourse === course.catNo ? 700 : 600,
                    fontSize: "0.9rem",
                  }}
                  secondaryTypographyProps={{
                    fontSize: "0.8rem",
                    color:
                      selectedCourse === course.catNo
                        ? "#e5e7eb"
                        : "text.secondary",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    opacity: 0.7,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                    color="primary"
                    title="Edit Course"
                    sx={{
                      "&:hover": {
                        opacity: 1,
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course);
                    }}
                    color="error"
                    title="Delete Course"
                    sx={{
                      "&:hover": {
                        opacity: 1,
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );

  // Always render the dialog so it can open regardless of state
  // Move the dialog outside of the conditional return

  // Create reusable dialog component
  const courseDialog = (
    <Dialog
      open={editDialogOpen}
      onClose={handleCancelEdit}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "#1e1e1e",
          border: "1px solid #374151",
          borderRadius: 2,
          color: "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          pt: 3,
          color: "#ffffff",
          borderBottom: "1px solid #374151",
          mb: 0,
        }}
      >
        {editingCourse ? "Edit Course" : "Add New Course"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <TextField
            label="Course Number"
            value={newCourse.catNo}
            onChange={(e) =>
              setNewCourse({
                ...newCourse,
                catNo: e.target.value,
              })
            }
            placeholder="e.g., MATH 21, NSTP 11, PHILO 11, FLC 1"
            fullWidth
            required
            autoFocus
            variant="outlined"
            size="medium"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "#374151",
                },
                "&:hover fieldset": {
                  borderColor: "#4b5563",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#9ca3af",
                "&.Mui-focused": {
                  color: "#3b82f6",
                },
              },
            }}
          />
          <TextField
            label="Course Title (Optional)"
            value={newCourse.courseTitle}
            onChange={(e) =>
              setNewCourse({
                ...newCourse,
                courseTitle: e.target.value,
              })
            }
            placeholder="e.g., College Algebra, National Service Training Program"
            fullWidth
            variant="outlined"
            size="medium"
            multiline
            rows={2}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "#374151",
                },
                "&:hover fieldset": {
                  borderColor: "#4b5563",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#9ca3af",
                "&.Mui-focused": {
                  color: "#3b82f6",
                },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          borderTop: "1px solid #374151",
          mt: 2,
          pt: 2,
        }}
      >
        <Button
          onClick={handleCancelEdit}
          variant="outlined"
          sx={{
            borderColor: "#374151",
            color: "#9ca3af",
            "&:hover": {
              borderColor: "#4b5563",
              backgroundColor: "rgba(75, 85, 99, 0.1)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveCourse}
          variant="contained"
          disabled={!newCourse.catNo.trim()}
          sx={{
            backgroundColor: "#3b82f6",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
            "&:disabled": {
              backgroundColor: "#374151",
              color: "#6b7280",
            },
          }}
        >
          {editingCourse ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Create bulk import dialog
  const bulkImportDialog = (
    <Dialog
      open={bulkImportDialogOpen}
      onClose={handleCancelBulkImport}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "#1e1e1e",
          border: "1px solid #374151",
          borderRadius: 2,
          color: "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          pt: 3,
          color: "#ffffff",
          borderBottom: "1px solid #374151",
          mb: 0,
        }}
      >
        Bulk Import Courses
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ pt: 3 }}>
            Enter course codes, one per line. You can optionally include course
            titles by separating them with a hyphen (-), colon (:), or semicolon
            (;).
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
          >
            Examples:
            <br />
            MATH 21
            <br />
            ENGL 11 - College Writing
            <br />
            HIST 12: Philippine History
            <br />
            PHILO 11; Introduction to Philosophy
          </Typography>
          <TextField
            label="Course Codes"
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder="MATH 21&#10;ENGL 11 - College Writing&#10;HIST 12: Philippine History&#10;PHILO 11; Introduction to Philosophy"
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                fontFamily: "monospace",
                "& fieldset": {
                  borderColor: "#374151",
                },
                "&:hover fieldset": {
                  borderColor: "#4b5563",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#9ca3af",
                "&.Mui-focused": {
                  color: "#3b82f6",
                },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          borderTop: "1px solid #374151",
          mt: 2,
          pt: 2,
        }}
      >
        <Button
          onClick={handleCancelBulkImport}
          variant="outlined"
          sx={{
            borderColor: "#374151",
            color: "#9ca3af",
            "&:hover": {
              borderColor: "#4b5563",
              backgroundColor: "rgba(75, 85, 99, 0.1)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveBulkImport}
          variant="contained"
          disabled={!bulkImportText.trim()}
          sx={{
            backgroundColor: "#3b82f6",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
            "&:disabled": {
              backgroundColor: "#374151",
              color: "#6b7280",
            },
          }}
        >
          Import Courses
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Handle buttonsOnly mode
  if (buttonsOnly) {
    return (
      <>
        {buttonsSection}
        {courseDialog}
        {bulkImportDialog}
      </>
    );
  }

  // Handle listOnly mode
  if (listOnly) {
    return (
      <>
        {listSection}
        {courseDialog}
        {bulkImportDialog}
      </>
    );
  }

  // Render the "no program" state
  if (!selectedSemester) {
    return (
      <>
        <Paper
          elevation={1}
          sx={{
            borderRadius: 2,
            background: "inherit",
            boxShadow: "none",
            mt: 0,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <List dense sx={{ py: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2, textAlign: "center" }}
            >
              No program selected.
            </Typography>
          </List>
        </Paper>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Primary Actions - Add and Clear on same level */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              size="medium"
              onClick={handleAddCourse}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                flex: 1,
              }}
            >
              Add Course
            </Button>

            <Button
              variant="outlined"
              size="medium"
              onClick={handleClearAllCourses}
              startIcon={<DeleteSweepIcon />}
              color="error"
              disabled={customCourses.length === 0}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                flex: 1,
              }}
            >
              Clear All
            </Button>
          </Box>

          {/* File Operations */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "center",
              minHeight: "40px",
              alignItems: "center",
              width: "100%",
            }}
          >
            {onExportIPS && (
              <Button
                variant="outlined"
                size="medium"
                onClick={onExportIPS}
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                Export IPS
              </Button>
            )}

            {onImportIPS && (
              <>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportIPS}
                  style={{ display: "none" }}
                  id="import-ips-input-no-program"
                />
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() =>
                    document
                      .getElementById("import-ips-input-no-program")
                      .click()
                  }
                  startIcon={<FileUploadIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  Import IPS
                </Button>
              </>
            )}
          </Box>
        </Box>
        {courseDialog}
        {bulkImportDialog}
      </>
    );
  }

  return (
    <>
      {listSection}
      <Box sx={{ mt: 2 }}>{buttonsSection}</Box>
      {courseDialog}
      {bulkImportDialog}
    </>
  );
}
