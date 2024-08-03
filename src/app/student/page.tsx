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
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const { data: students, error } = await supabase
          .from('students')
          .select('*');
  
        if (students) {
          setStudentList(students as Student[]);
        }
        if (error) {
          console.error('Error fetching students:', error);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent(); 
  }, []);

  const handleEditClick = (student: Student) => {
    setEditStudent(student);
  };

  const handleAddClick = () => {
    setNewStudent({ id: 0, name: '', email: '', qr_code: '', contact: '' });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent) {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: newStudent.name,
          email: newStudent.email,
          qr_code: newStudent.qr_code,
          contact: newStudent.contact,
        }])
        .select(); // Select the newly inserted student
  
      if (error) {
        console.error('Error adding student:', error);
      } else {
        console.log('Student added successfully:', data);
        if (data) {
          setStudentList((prev) => [...prev, data[0]]); // Add the new student to the list
        }
        setNewStudent(null); // Reset new student state
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault();
    if(editStudent && editStudent.id) {
      const { data, error } = await supabase
        .from('students')
        .update({
          name: editStudent.name,
          email: editStudent.email,
          qr_code: editStudent.qr_code,
          contact: editStudent.contact,
        })
        .eq('id', editStudent.id);
    
      if (error) {
        console.error('Error updating student:', error);
      } else {
        console.log('Update successful:', data);
        setStudentList((prev) =>
          prev.map((student) => (student.id === editStudent.id ? { ...student, ...editStudent } : student))
        );
        setEditStudent(null); // Reset editing state
        setIsLoading(false)
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editStudent) {
      setEditStudent({
        ...editStudent,
        [e.target.name]: e.target.value,
      });
    } else if (newStudent) {
      setNewStudent({
        ...newStudent,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const { data, error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);
  
        if (error) {
          console.error('Error deleting student:', error);
        } else {
          console.log('Delete successful:', data);
          setStudentList((prev) => prev.filter((student) => student.id !== id));
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className='flex justify-center min-h-screen bg-gray-100 p-4'>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <div className="flex justify-end mb-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleAddClick}
                >
                  Add Student
                </button>
              </div>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-3 px-4 border-b">ID Number</th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Contact Number</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="py-3 px-4 border-b text-center">{item.qr_code}</td>
                      <td className="py-3 px-4 border-b text-center">{item.name}</td>
                      <td className="py-3 px-4 border-b text-center">{item.email}</td>
                      <td className="py-3 px-4 border-b text-center">{item.contact}</td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editStudent && (
              <div id="default-modal" tabIndex={-1} className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center">
                <div className="relative p-4 w-50 max-w-2xl max-h-50">
                  <div className="relative bg-white rounded-lg shadow space-y-3">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-250">
                      <h3 className="text-xl font-semibold text-black">Edit Student</h3>
                      <button
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={() => setEditStudent(null)}
                      >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>
                    <div className="p-4 md:p-5 space-y-4 shadow-xl bg-white border-gray-500">
                      <form onSubmit={handleEdit}>
                        <div>
                          <label>Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editStudent.name}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div>
                          <label>Email:</label>
                          <input
                            type="email"
                            name="email"
                            value={editStudent.email}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div>
                          <label>QR Code:</label>
                          <input
                            type="text"
                            name="qr_code"
                            value={editStudent.qr_code}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div>
                          <label>Contact Number:</label>
                          <input
                            type="text"
                            name="contact"
                            value={editStudent.contact}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-250">
                          <button
                           disabled={isLoading}
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                          >
                             {isLoading ? (
                              <>
                                <svg
                                  aria-hidden="true"
                                  role="status"
                                  className="inline w-4 h-4 me-3 text-white animate-spin"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="#E5E7EB"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentColor"
                                  />
                                </svg>
                                Loading...
                              </>
                            ) : (
                              'Update'
                            )}
                                            
                          </button>
                          <button
                            type="button"
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10"
                            onClick={() => setEditStudent(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {newStudent && (
              <div id="add-modal" tabIndex={-1} className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center">
                <div className="relative p-4 w-50 max-w-2xl max-h-50">
                  <div className="relative bg-white rounded-lg shadow space-y-3">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-250">
                      <h3 className="text-xl font-semibold text-black">Add Student</h3>
                      <button
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={() => setNewStudent(null)}
                      >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>
                    <div className="p-4 md:p-5 space-y-4 shadow-xl bg-white border-gray-500">
                      <form onSubmit={handleAddStudent}>
                        <div>
                          <label>Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={newStudent.name}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div>
                          <label>Email:</label>
                          <input
                            type="email"
                            name="email"
                            value={newStudent.email}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div>
                          <label>QR Code:</label>
                          <input
                            type="text"
                            name="qr_code"
                            value={newStudent.qr_code}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div>
                          <label>Contact Number:</label>
                          <input
                            type="text"
                            name="contact"
                            value={newStudent.contact}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                            required
                          />
                        </div>
                        <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-250">
                          <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10"
                            onClick={() => setNewStudent(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
