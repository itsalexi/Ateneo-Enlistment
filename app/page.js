"use client"
import ColumnToggle from "@/components/ColumnToggle";
import CourseCard from "@/components/CourseCard";
import DepartmentSelector from "@/components/DepartmentSelector";
import OfferingsTable from "@/components/OfferingsTable";
import { Autocomplete, Chip, Pagination, TextField } from "@mui/material";
import { useState, useEffect, useMemo } from "react";

const initialColumnVisibility = {
  catNo: true,
  section: true,
  courseTitle: true,
  units: true,
  time: true,
  room: true,
  instructor: true,
}

const ITEMS_PER_PAGE = 10

export default function Home() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjectOffering, setSubjectOffering] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility)
  const [isMobile, setIsMobile] = useState(false)

  const [selectedInstructors, setSelectedInstructors] = useState([])
  const [selectedCatNos, setSelectedCatNos] = useState([])

  const [page, setPage] = useState(1)


  const filteredCourses = useMemo(() => {
    return subjectOffering.filter(course => 
      (selectedInstructors.length === 0 || selectedInstructors.includes(course.instructor)) &&
      (selectedCatNos.length === 0 || selectedCatNos.includes(course.catNo))
    )
  }, [selectedInstructors, selectedCatNos, subjectOffering])

  const paginatedCourses = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCourses, page])

  const pageCount = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)

  const instructors = useMemo(() => Array.from(new Set(subjectOffering.map(course => course.instructor))), [subjectOffering])
  const catNos = useMemo(() => Array.from(new Set(subjectOffering.map(course => course.catNo))), [subjectOffering])

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleColumnVisibility = (column) => {
    setColumnVisibility(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  useEffect(() => {
    const fetchOffering = async () => {
      const data = await fetch(`/api/offerings?deptCode=${selectedDepartment}`);
      const offering = await data.json();
      setSubjectOffering(offering);
      setPage(1);
    }
    if (selectedDepartment?.length > 0) {
      fetchOffering();
    }
  }, [selectedDepartment])

  useEffect(() => {
    setPage(1)
  }, [selectedInstructors, selectedCatNos])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Selection</h1>
        <DepartmentSelector setDepartment={setSelectedDepartment}/>
        <Autocomplete
  multiple
  options={instructors}
  renderInput={(params) => <TextField {...params} label="Filter by Instructor" />}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => {
      const { key, ...tagProps } = getTagProps({ index }); // Exclude the conflicting key
      return (
        <Chip
          key={`instructor-${index}`} // Use your own key
          variant="outlined"
          label={option}
          {...tagProps} // Spread other props
        />
      );
    })
  }
  onChange={(_, newValue) => setSelectedInstructors(newValue)}
  className="w-full"
/>
<Autocomplete
  multiple
  options={catNos}
  renderInput={(params) => <TextField {...params} label="Filter by Course Number" />}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => {
      const { key, ...tagProps } = getTagProps({ index });
      return (
        <Chip
          key={`cat-${index}`}
          variant="outlined"
          label={option}
          {...tagProps}
        />
      );
    })
  }
  onChange={(_, newValue) => setSelectedCatNos(newValue)}
  className="w-full"
/>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Courses</h2>
        {!isMobile &&
          <ColumnToggle
            columns={Object.keys(initialColumnVisibility)}
            columnVisibility={columnVisibility}
            onToggle={toggleColumnVisibility}
          />
        }
      </div>
      {isMobile ? (
        <div>
          {paginatedCourses?.length > 0 ?           paginatedCourses?.map(course => (
            <CourseCard key={course.id} course={course} columnVisibility={columnVisibility} />
          )): <div>There are no offerings available with your filter settings, try other filters.</div>}
        </div>
      ) : (
        <OfferingsTable offerings={paginatedCourses} columnVisibility={columnVisibility} />
      )}
            {filteredCourses.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </div>
      )}
    </div>
  )
}
