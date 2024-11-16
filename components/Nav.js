'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FavoritesPopout from './FavoritePopout';

export default function Nav({ favoriteCourses }) {
  return (
    <div className="bg-[#121212] flex w-full justify-center p-2">
      <nav className="top-8 flex w-fit items-center gap-6 rounded-lg border-[1px] border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-500">
        <Logo />

        <NavLink>Enlistment Helper</NavLink>

        <FavoritesPopout favoriteCourses={favoriteCourses} />
      </nav>
    </div>
  );
}

const Logo = () => {
  return (
    <svg
      width="24"
      height="auto"
      viewBox="0 0 50 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-2 fill-neutral-50"
    >
      <path
        d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        stopColor="#000000"
      ></path>
      <path
        d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        stopColor="#000000"
      ></path>
    </svg>
  );
};

const NavLink = ({ children }) => {
  return (
    <a href="#" rel="nofollow" className="block overflow-hidden">
      <motion.div
        whileHover={{ y: -20 }}
        transition={{ ease: 'backInOut', duration: 0.5 }}
        className="h-[20px]"
      >
        <span className="flex h-[20px] items-center">{children}</span>
        <span className="flex h-[20px] items-center text-neutral-50">
          {children}
        </span>
      </motion.div>
    </a>
  );
};
