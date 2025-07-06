'use client';

import { Autocomplete, TextField } from '@mui/material';

const departmentLabels = [
  { label: 'ALL INTERDISCIPLINARY ELECTIVES', id: '**IE**' },
  { label: 'BIOLOGY', id: 'BIO' },
  { label: 'CHEMISTRY', id: 'CH' },
  { label: 'CHINESE STUDIES PROGRAM', id: 'CHN' },
  { label: 'COMMUNICATION', id: 'COM' },
  {
    label: 'DEPARTMENT OF CATHOLIC EDUCATION PHILOSOPHY AND PRACTICE',
    id: 'CEPP',
  },
  { label: 'DEPARTMENT OF CURRICULUM, PEDAGOGY AND ASSESSMENT', id: 'CPA' },
  { label: 'DEPARTMENT OF EDUCATIONAL LEADERSHIP AND MANAGEMENT', id: 'ELM' },
  { label: 'DEVELOPMENT STUDIES PROGRAM', id: 'DS' },
  { label: 'ECONOMICS', id: 'EC' },
  { label: 'ELECTRONICS, COMPUTER and COMMUNICATIONS ENG.', id: 'ECE' },
  { label: 'ENGLISH', id: 'EN' },
  { label: 'ENVIRONMENTAL SCIENCE', id: 'ES' },
  { label: 'EUROPEAN STUDIES', id: 'EU' },
  { label: 'FILIPINO', id: 'FIL' },
  { label: 'FINANCE AND ACCOUNTING', id: 'FAA' },
  { label: 'FINE ARTS', id: 'FA' },
  { label: 'HEALTH SCIENCES PROGRAM', id: 'HSP' },
  { label: 'HISTORY', id: 'HI' },
  { label: 'HUMANITIES', id: 'SOHUM' },
  { label: 'INFORMATION SYSTEMS AND COMPUTER SCIENCE', id: 'DISCS' },
  {
    label: 'INSTITUTE FOR THE SCIENCE AND ART OF LEARNING AND TEACHING (SALT)',
    id: 'SALT',
  },
  { label: 'INTAC', id: 'INTAC' },
  { label: 'INTERDISCIPLINARY STUDIES DEPARTMENT', id: 'IS' },
  { label: 'JAPANESE STUDIES PROGRAM', id: 'JSP' },
  { label: 'KOREAN STUDIES PROGRAM', id: 'KSP' },
  { label: 'LEADERSHIP AND STRATEGY', id: 'LAS' },
  { label: 'MARKETING AND LAW', id: 'MAL' },
  { label: 'MATHEMATICS', id: 'MA' },
  { label: 'MODERN LANGUAGES', id: 'ML' },
  { label: 'NATIONAL SERVICE TRAINING PROGRAM (ADAST)', id: 'NSTP (ADAST)' },
  { label: 'NATIONAL SERVICE TRAINING PROGRAM (OSCI)', id: 'NSTP (OSCI)' },
  { label: 'PHILOSOPHY', id: 'PH' },
  { label: 'PHYSICAL EDUCATION', id: 'PE' },
  { label: 'PHYSICS', id: 'PS' },
  { label: 'POLITICAL SCIENCE', id: 'POS' },
  { label: 'PSYCHOLOGY', id: 'PSY' },
  { label: 'QUANTITATIVE METHODS AND INFORMATION TECHNOLOGY', id: 'QMIT' },
  { label: 'SCIENCE BLOCK', id: 'SB' },
  { label: 'SOCIAL SCIENCES', id: 'SOCSCI' },
  { label: 'SOCIOLOGY/ANTHROPOLOGY', id: 'SA' },
  { label: 'THEOLOGY', id: 'TH' },
  { label: 'THEOLOGY AND MINISTRY PROGRAM', id: 'TMP' },
];

export default function DepartmentSelector({ setDepartment, value }) {
  return (
    <Autocomplete
      options={departmentLabels}
      onChange={(e, value) => {
        setDepartment(value ? value.id : null);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Selected Department" />
      )}
      value={departmentLabels.find((dept) => dept.id === value) || null}
    ></Autocomplete>
  );
}
