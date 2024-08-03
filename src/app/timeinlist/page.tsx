"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../pages/components/Navbar';
import supabase from '../supabase';

// Define the types
type Student = {
  id: number;
  name: string;
  email: string;
  qr_code: string;
};

type Attendance = {
  id: number;
  date: string;
  type: string;
  student: Student;
  status: string;
};

export default function Page() {
  const [studentList, setStudentList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceType, setAttendanceType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: attendance, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:student_id (id, name, email, qr_code)
        `);
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setStudentList(attendance);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  // Filtering Logic
  const filteredStudents = studentList.filter(item => {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
    const itemDate = item.date ? new Date(item.date).toISOString().split('T')[0] : '';
    const isDateMatch = formattedDate ? itemDate === formattedDate : true;
    const isSearchMatch = item.student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isAttendanceTypeMatch = attendanceType ? item.type.toLowerCase() === attendanceType.toLowerCase() : true;

    console.log({
      itemDate,
      formattedDate,
      itemType: item.type,
      attendanceType,
      isDateMatch,
      isSearchMatch,
      isAttendanceTypeMatch
    });

    return isDateMatch && isSearchMatch && isAttendanceTypeMatch;
  });

  return (
    <div>
      <Navbar />
      <div className='flex items-center justify-center bg-gray-100 p-4'>
        <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-3xl">
          <h2 className="font-bold text-lg">Students Information</h2>

          {/* Filter Inputs */}
          <div className="mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
                 className="border rounded p-2 mb-2 sm:mb-0"
              placeholder="Filter by Date"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                 className="border rounded p-2 mb-2 sm:mb-0"
              placeholder="Search by Name"
            />
            <select
              value={attendanceType}
              onChange={(e) => setAttendanceType(e.target.value)}
              className="border rounded p-2"
            >
              <option value="">All Attendance Types</option>
              <option value="time_in">Time In</option>
              <option value="time_out">Time Out</option>
            </select>
          </div>

          {filteredStudents.length === 0 ? (
            <p className="text-gray-500">No present students yet.</p>
          ) : (
            <ul className="mb-4">
              {filteredStudents.map((item) => (
                <li key={item.id} className="mb-2">
                  ID Number: {item.student?.qr_code}, Name: {item.student?.name}, Status: {item.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
