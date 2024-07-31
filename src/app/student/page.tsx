"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../pages/components/Navbar';
import supabase from '../supabase';

type Student = {
  id: number;
  name: string;
  email: string;
  qr_code: string;
  contact: string;
};

export default function Student() {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data: students, error } = await supabase
          .from('students')
          .select('*');

        if (error) {
          console.error('Error fetching students:', error);
        } else {
          setStudentList(students);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
      finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchStudent(); // Call the fetch function
  }, []); // Ensure this is always an empty array if no dependencies

  return (
    <div>
      <Navbar />
      <div className='flex justify-center min-h-screen bg-gray-100 p-4'>
        {loading ? ( // Conditional rendering based on loading state
          <div className="flex items-center justify-center h-full">
            <div className="loader"></div> {/* Add loader */}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-4 border-b">ID Number</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="py-3 px-4 border-b text-center">{item.qr_code}</td>
                    <td className="py-3 px-4 border-b text-center">{item.name}</td>
                    <td className="py-3 px-4 border-b text-center">{item.email}</td>
                    <td className="py-3 px-4 border-b text-center">{item.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

  );
}
