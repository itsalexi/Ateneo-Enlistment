'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const FavoriteCoursesContext = createContext();

export const FavoriteCoursesProvider = ({ children }) => {
  const [favoriteCourses, setFavoriteCourses] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('favoriteCourses');
      if (savedFavorites) {
        setFavoriteCourses(JSON.parse(savedFavorites));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && favoriteCourses.length > 0) {
      localStorage.setItem('favoriteCourses', JSON.stringify(favoriteCourses));
    } else if (typeof window !== 'undefined' && favoriteCourses.length === 0) {
      localStorage.removeItem('favoriteCourses');
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
const SelectedCoursesContext = createContext();

export const SelectedCoursesProvider = ({ children }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSelected = localStorage.getItem('selectedCourses');
      if (savedSelected) {
        setSelectedCourses(JSON.parse(savedSelected));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedCourses.length > 0) {
      localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
    } else if (typeof window !== 'undefined' && selectedCourses.length === 0) {
      localStorage.removeItem('selectedCourses');
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
