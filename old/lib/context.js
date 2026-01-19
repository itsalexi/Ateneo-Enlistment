"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { findConflictingCourses } from "./helper";

const FavoriteCoursesContext = createContext();

export const FavoriteCoursesProvider = ({ children }) => {
  const [favoriteCourses, setFavoriteCourses] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("favoriteCourses");
      if (savedFavorites) {
        setFavoriteCourses(JSON.parse(savedFavorites));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && favoriteCourses.length > 0) {
      localStorage.setItem("favoriteCourses", JSON.stringify(favoriteCourses));
    } else if (typeof window !== "undefined" && favoriteCourses.length === 0) {
      localStorage.removeItem("favoriteCourses");
    }
  }, [favoriteCourses]);

  const toggleFavorite = (course) => {
    setFavoriteCourses((prev) => {
      const index = prev.findIndex((c) => c.id === course.id);
      if (index > -1) {
        return prev.filter((c) => c.id !== course.id);
      } else {
        return [...prev, course];
      }
    });
  };

  return (
    <FavoriteCoursesContext.Provider
      value={{ favoriteCourses, toggleFavorite, setFavoriteCourses }}
    >
      {children}
    </FavoriteCoursesContext.Provider>
  );
};

export const useFavoriteCourses = () => useContext(FavoriteCoursesContext);

// Multiple Schedules Context
const SchedulesContext = createContext();

export const SchedulesProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSchedules = localStorage.getItem("schedules");
      const savedActiveId = localStorage.getItem("activeScheduleId");

      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        setSchedules(parsedSchedules);

        if (
          savedActiveId &&
          parsedSchedules.some((s) => s.id === savedActiveId)
        ) {
          setActiveScheduleId(savedActiveId);
        } else if (parsedSchedules.length > 0) {
          setActiveScheduleId(parsedSchedules[0].id);
        }
      } else {
        // Create default schedule if none exists
        const defaultSchedule = {
          id: "schedule-1",
          name: "Schedule 1",
          selectedCourses: [],
        };
        setSchedules([defaultSchedule]);
        setActiveScheduleId(defaultSchedule.id);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("schedules", JSON.stringify(schedules));
      if (activeScheduleId) {
        localStorage.setItem("activeScheduleId", activeScheduleId);
      }
    }
  }, [schedules, activeScheduleId]);

  const createSchedule = (name) => {
    const newSchedule = {
      id: `schedule-${Date.now()}`,
      name: name || `Schedule ${schedules.length + 1}`,
      selectedCourses: [],
    };
    setSchedules((prev) => [...prev, newSchedule]);
    setActiveScheduleId(newSchedule.id);
    return newSchedule;
  };

  const deleteSchedule = (scheduleId) => {
    if (schedules.length <= 1) return false;

    setSchedules((prev) => {
      const filtered = prev.filter((s) => s.id !== scheduleId);
      if (activeScheduleId === scheduleId && filtered.length > 0) {
        setActiveScheduleId(filtered[0].id);
      }
      return filtered;
    });
    return true;
  };

  const renameSchedule = (scheduleId, newName) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, name: newName } : schedule
      )
    );
  };

  const updateScheduleCourses = (scheduleId, courses) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, selectedCourses: courses }
          : schedule
      )
    );
  };

  const toggleSelectedInSchedule = (scheduleId, course) => {
    setSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id === scheduleId) {
          const index = schedule.selectedCourses.findIndex(
            (c) => c.id === course.id
          );

          if (index > -1) {
            const newSelectedCourses = schedule.selectedCourses.filter(
              (c) => c.id !== course.id
            );
            return { ...schedule, selectedCourses: newSelectedCourses };
          }

          const conflictingCourses = findConflictingCourses(
            course,
            schedule.selectedCourses
          );
          if (conflictingCourses.length > 0) {
            return schedule;
          }

          const newSelectedCourses = [...schedule.selectedCourses, course];
          return { ...schedule, selectedCourses: newSelectedCourses };
        }
        return schedule;
      })
    );

    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      const index = schedule.selectedCourses.findIndex(
        (c) => c.id === course.id
      );
      if (index === -1) {
        const conflictingCourses = findConflictingCourses(
          course,
          schedule.selectedCourses
        );
        return conflictingCourses.length === 0;
      }
    }
    return true;
  };

  const getActiveSchedule = () => {
    return schedules.find((s) => s.id === activeScheduleId);
  };

  const getSelectedCourses = () => {
    const activeSchedule = getActiveSchedule();
    return activeSchedule ? activeSchedule.selectedCourses : [];
  };

  const toggleSelected = (course) => {
    if (activeScheduleId) {
      return toggleSelectedInSchedule(activeScheduleId, course);
    }
    return false;
  };

  const setSelectedCourses = (courses) => {
    if (activeScheduleId) {
      updateScheduleCourses(activeScheduleId, courses);
    }
  };

  return (
    <SchedulesContext.Provider
      value={{
        schedules,
        activeScheduleId,
        setActiveScheduleId,
        createSchedule,
        deleteSchedule,
        renameSchedule,
        toggleSelected,
        getSelectedCourses,
        setSelectedCourses,
        getActiveSchedule,
        selectedCourses: getSelectedCourses(),
      }}
    >
      {children}
    </SchedulesContext.Provider>
  );
};

export const useSchedules = () => useContext(SchedulesContext);

const SelectedCoursesContext = createContext();

export const SelectedCoursesProvider = ({ children }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSelected = localStorage.getItem("selectedCourses");
      if (savedSelected) {
        setSelectedCourses(JSON.parse(savedSelected));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedCourses.length > 0) {
      localStorage.setItem("selectedCourses", JSON.stringify(selectedCourses));
    } else if (typeof window !== "undefined" && selectedCourses.length === 0) {
      localStorage.removeItem("selectedCourses");
    }
  }, [selectedCourses]);

  const toggleSelected = (course) => {
    setSelectedCourses((prev) => {
      const index = prev.findIndex((c) => c.id === course.id);
      if (index > -1) {
        return prev.filter((c) => c.id !== course.id);
      } else {
        return [...prev, course];
      }
    });
  };

  return (
    <SelectedCoursesContext.Provider
      value={{ selectedCourses, toggleSelected, setSelectedCourses }}
    >
      {children}
    </SelectedCoursesContext.Provider>
  );
};

export const useSelectedCourses = () => useContext(SelectedCoursesContext);

export const useSelectedCoursesWithSchedules = () => {
  const schedulesContext = useContext(SchedulesContext);
  const selectedCoursesContext = useContext(SelectedCoursesContext);

  if (schedulesContext) {
    return {
      selectedCourses: schedulesContext.selectedCourses,
      toggleSelected: schedulesContext.toggleSelected,
      setSelectedCourses: schedulesContext.setSelectedCourses,
    };
  }

  return selectedCoursesContext;
};
