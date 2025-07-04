'use client';
import { Box, Autocomplete, TextField } from '@mui/material';

export default function ProgramIPSFilterCard({
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
            sx={{
                p: 0,
                borderRadius: 2,
                background: 'inherit',
                boxShadow: 'none',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                    options={programLabels}
                    value={
                        programLabels.find((p) => p.id === selectedProgram) ||
                        null
                    }
                    getOptionLabel={(option) => option.label}
                    onChange={(e, value) =>
                        setSelectedProgram(value ? value.id : null)
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="Program of Study" />
                    )}
                />
                <Autocomplete
                    options={yearOptions}
                    value={selectedYear}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, value) => setSelectedYear(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Year" />
                    )}
                    disabled={!selectedProgram}
                />
                <Autocomplete
                    options={semesterOptions}
                    value={selectedSemester}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, value) => setSelectedSemester(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Semester" />
                    )}
                    disabled={!selectedYear}
                />
            </Box>
        </Box>
    );
}
