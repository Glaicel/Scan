"use client";

import Navbar from '../pages/components/Navbar';
import React, { useState, useRef, useEffect, useCallback } from "react";
import '../styles/qrstyle.css';
import QrScanner from "qr-scanner";
import qrFrame from '../assets/qr-frame.svg';
import supabase from '../supabase';
import debounce from 'lodash/debounce'; // Import debounce function from lodash

export default function Scan() {
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<string | undefined>("");// Result
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedQRs, setProcessedQRs] = useState<Set<string>>(new Set()); // Track processed QR codes
  const [studentsList, setStudentsList] = useState<any[]>([]); // List of scanned students
  const [attendanceType, setAttendanceType] = useState<string | null>('time_in');
  const [isLoading, setIsLoading] = useState(false);
  

  const onScanSuccess = useCallback(
    debounce((result: QrScanner.ScanResult) => {
      console.log(result);
      setScannedResult(result?.data);
      handleQRCodeScan(result?.data);
    }, 500), // Debounce interval to limit scan processing
    []
  );

  const onScanFail = useCallback((err: string | Error) => {
    console.log(err);
  }, []);

  const handleQRCodeScan = async (scannedQRCode: string | undefined) => {
    if (!scannedQRCode) {
      setError('No QR code data found.');
      return;
    }

    if (processedQRs.has(scannedQRCode)) {
      console.log('QR Code has already been processed.');
      return;
    }

    try {
      console.log('Handling QR Code Scan for:', scannedQRCode);

      const { data: student, error } = await supabase
        .from('students')
        .select('id, name, email')
        .eq('qr_code', scannedQRCode)
        .single();

      if (error) {
        console.error('Error fetching student:', error.message);
        setError('Student not found');
        setStudentInfo(null);
        return;
      }
      if (!student) {
        console.warn('No student found for QR Code:', scannedQRCode);
        setError('Student not found');
        setStudentInfo(null);
        return;
      }
      console.log('Found student:', student);
      const isAlreadyInList = studentsList.some(item => item.id === student.id);
      if (isAlreadyInList) {
        console.log('Student is already in the list.');
        return;
      }
      setStudentInfo(student);
      setError(null);
      setProcessedQRs(prev => new Set(prev).add(scannedQRCode));
      setStudentsList(prevList => [...prevList, student]);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error in handleQRCodeScan:', err.message);
        setError(err.message);
      } else {
        console.error('Unexpected error in handleQRCodeScan:', err);
        setError('An unexpected error occurred');
      }
      setStudentInfo(null);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
      .from('attendance')
      .insert(
        studentsList.map(student => ({
          student_id: student.id,
          date: new Date().toISOString().split('T')[0], // Set the current date
          time: new Date().toISOString(), // Set the current time
          type: attendanceType, // Include the selected attendance type
          status: 'Present', // Optional status
        }))
      );

      if (error) {
        console.error('Error recording attendance:', error.message);
        setError('Error recording attendance');
        return;
      }

      console.log('Recorded attendance:', data);
      setError(null);
      setStudentsList([]);
      setProcessedQRs(new Set());
      setAttendanceType(null); // Reset to null
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error in handleQRCodeScan:', err.message);
        setError(err.message);
      } else {
        console.error('Unexpected error in handleQRCodeScan:', err);
        setError('An unexpected error occurred');
      }
      setStudentInfo(null);
    } finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl?.current || undefined,
        maxScansPerSecond: 2,
      });

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
  }, [onScanSuccess, onScanFail]);

  useEffect(() => {
    if (!qrOn)
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
      );
  }, [qrOn]);

  return (
    <div className='bg-gray-100'>
      <Navbar />
      <div className="flex space-x-4 p-5 max-w-6xl mx-auto mt-5">
        <div className="bg-white shadow-md rounded-xl p-5 w-[33%] h-[80vh] relative">
          <video
            ref={videoEl}
            className="w-full h-full object-cover rounded-xl"
            autoPlay
          />
          <div
            ref={qrBoxEl}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          >
            <img
              src={qrFrame}
              className="w-70 h-70"
            />
          </div>
          {scannedResult && (
            <p className="absolute top-0 left-0 z-50 bg-white text-black p-2 rounded-md">
              Scanned Result: {scannedResult}
            </p>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-6 w-[33%] h-[80vh]">
        <h2 className="text-xl font-bold mb-4">Select Attendance Type</h2>
          <div className="flex flex-row mb-4">
          <div className="flex items-center mr-4">
            <input
              type="radio"
              id="time_in"
              name="attendance_type"
              value="time_in"
              checked={attendanceType === 'time_in'}
              onChange={(e) => setAttendanceType(e.target.value)}
            />
            <label htmlFor="time_in" className="ml-2">Time In</label>
          </div>
          <div className="flex items-center mr-4">
            <input
              type="radio"
              id="time_out"
              name="attendance_type"
              value="time_out"
              checked={attendanceType === 'time_out'}
              onChange={(e) => setAttendanceType(e.target.value)}
            />
            <label htmlFor="time_out" className="ml-2">Time Out</label>
          </div>
          </div>
          {/* Present Students section */}
          {/* <h2 className="text-xl font-bold mb-4">Present Students</h2> */}
          {studentInfo && (
            <div>
              <p><strong>Name:</strong> {studentInfo.name}</p>
              <p><strong>Email:</strong> {studentInfo.email}</p>
              <p><strong>Attendance Status:</strong> Present</p>
            </div>
          )}
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 w-[33%] h-[80vh] flex flex-col">
          <h2 className="text-xl font-bold mb-4">Present Students</h2>
          {studentsList.length > 0 ? (
            <ul className="flex-grow overflow-auto">
              {studentsList.map((student, index) => (
                <li key={index} className="border-b py-2">
                  <p><strong>Name:</strong> {student.name}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No students scanned yet</p>
          )}
          <button
            className="bg-blue-500 text-white p-2 rounded-md mt-4"
            onClick={handleSaveAttendance}
            disabled={studentsList.length === 0 || attendanceType === null} // Disable if no students or attendance type is not selected
          >{isLoading ? (
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
            'Save Attendance'
          )}
          </button>
        </div>
      </div>
    </div>
  );
}
