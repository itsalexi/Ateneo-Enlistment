'use client';
import { createTheme, ThemeProvider } from '@mui/material';
import { Suspense } from 'react';
import ProgramOfferingsContent from '@/components/ProgramOfferingsContent';

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

const ITEMS_PER_PAGE = 30;
const currentSemesterString = 'First Semester 2025-2026';
const lastUpdated = 1751769902962;

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#90caf9' },
        secondary: { main: '#f48fb1' },
        background: { default: '#121212', paper: '#1e1e1e' },
    },
});

export default function ProgramOfferingsPage() {
    return (
        <ThemeProvider theme={darkTheme}>
            <Suspense fallback={<div>Loading...</div>}>
                <ProgramOfferingsContent
                    darkTheme={darkTheme}
                    initialTableVisibility={initialTableVisibility}
                    initialCardVisibility={initialCardVisibility}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    currentSemesterString={currentSemesterString}
                    lastUpdated={lastUpdated}
                />
            </Suspense>
        </ThemeProvider>
    );
}
