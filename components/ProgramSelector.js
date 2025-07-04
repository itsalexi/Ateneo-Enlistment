'use client';
import { Autocomplete, TextField } from '@mui/material';
import { useState, useEffect } from 'react';

export default function ProgramSelector({
    setCurriculum,
    className,
    selectedSemester,
    setSelectedSemester,
}) {
    const [programLabels, setProgramLabels] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [programData, setProgramData] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

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

    useEffect(() => {
        setCurriculum({ courses: [] });
        setProgramData(null);
        const fetchProgramData = async (program) => {
            const data = await fetch(`/api/programs/?id=${program}`);
            setProgramData(await data.json());
        };
        if (selectedProgram) {
            fetchProgramData(selectedProgram);
            setSelectedYear(null);
            setSelectedSemester(null);
        }
    }, [selectedProgram, setCurriculum, setSelectedSemester]);

    useEffect(() => {
        setCurriculum({ courses: selectedSemester?.courses || [] });
    }, [selectedSemester, setCurriculum]);

    return (
        <div className={className}>
            <Autocomplete
                getOptionLabel={(option) => option.label}
                options={programLabels}
                onChange={(e, value) => {
                    setSelectedProgram(value ? value.id : null);
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Program of Study" />
                )}
            />
            {programData && programData.length > 0 && (
                <Autocomplete
                    options={programData[0].years.map((yearObj, index) => ({
                        year: yearObj.year,
                        label: `${yearObj.year} Year`,
                        index,
                    }))}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, value) => {
                        if (value) {
                            setSelectedYear(null);
                            setTimeout(() => {
                                setSelectedYear(
                                    programData[0].years[value.index]
                                );
                            }, 0);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Year" />
                    )}
                />
            )}
            {programData && selectedYear && (
                <Autocomplete
                    options={selectedYear.semesters.map(
                        (semesterObj, index) => ({
                            label: `${semesterObj.name}`,
                            index,
                        })
                    )}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, value) => {
                        if (value) {
                            setSelectedSemester(
                                selectedYear.semesters[value.index]
                            );
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Semester" />
                    )}
                />
            )}
        </div>
    );
}
