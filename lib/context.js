'use client';

import { createContext, useContext, useState } from 'react';

const FavoriteCoursesContext = createContext();

export const FavoriteCoursesProvider = ({ children }) => {
  const [favoriteCourses, setFavoriteCourses] = useState([]);

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
      value={{ favoriteCourses, toggleFavorite }}
    >
      {children}
    </FavoriteCoursesContext.Provider>
  );
};

export const useFavoriteCourses = () => useContext(FavoriteCoursesContext);
