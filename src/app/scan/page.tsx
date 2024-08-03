"use client";

import Navbar from '../pages/components/Navbar';
import React, { useState, useRef, useEffect, useCallback } from "react";
import '../styles/qrstyle.css';
import QrScanner from "qr-scanner";
import qrFrame from '../assets/qr-frame.svg';
import supabase from '../supabase';
import debounce from 'lodash/debounce';

export default function Scan() {
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<string | undefined>("");
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedQRs, setProcessedQRs] = useState<Set<string>>(new Set());
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [attendanceType, setAttendanceType] = useState<string | null>('time_in');

  const attendanceTypeRef = useRef<string | null>(attendanceType);

  const onScanSuccess = useCallback(
    debounce((result: QrScanner.ScanResult) => {
      console.log(result);
      setScannedResult(result?.data);
      // Pass the current attendanceType when calling handleQRCodeScan
      handleQRCodeScan(result?.data, attendanceTypeRef.current);
    }, 500),
    [attendanceType]
  );

  const onScanFail = useCallback((err: string | Error) => {
    console.log(err);
  }, []);

  useEffect(() => {
    attendanceTypeRef.current = attendanceType; // Update the ref whenever attendanceType changes
  }, [attendanceType]);

  const handleQRCodeScan = async (scannedQRCode: string | undefined, attendanceType: string | null) => {
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
      setStudentInfo(student);
      setError(null);
      setProcessedQRs(prev => new Set(prev).add(scannedQRCode));
      const audio = new Audio('/beep.mp3');
      audio.play();
  
      // Call saveAttendance with the current attendanceType
      console.log(`Current Attendance Type: ${attendanceType}`);
      await saveAttendance(student.id, attendanceType);
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
  
  const saveAttendance = async (studentId: string, attendanceType: string | null) => {
    const today = new Date().toISOString().split('T')[0];

    // console.log(`Checking for existing record with Student ID: ${studentId}, Date: ${today}, Type: ${attendanceType}`);
    // const existingRecord = await supabase
    //   .from('attendance')
    //   .select('id')
    //   .eq('student_id', studentId)
    //   .eq('date', today)
    //   .eq('type', attendanceType)

    //   console.log('Existing Record:', existingRecord);

    //   if (existingRecord.error) {
    //     console.error('Error fetching existing records:', existingRecord.error.message);
    //     setError('Error checking existing records');
    //     return; // Early return on error
    //   }
    
    //   if (existingRecord.data.length > 0) {
    //     console.log('Cannot save: Time In already exists for this student today.');
    //     return; // Prevent saving another Time In
    //   }
        
    // if (attendanceType === 'time_in' && existingRecord) {
    //   console.log('Cannot save: Time In already exists for this student today.');
    //   return; // Prevent saving another Time In
    // }
  
    // if (attendanceType === 'time_out') {
    //   const timeInRecord = await supabase
    //     .from('attendance')
    //     .select('id')
    //     .eq('student_id', studentId)
    //     .eq('date', today)
    //     .eq('type', 'time_in')
    //     .single();
  
    //   if (!timeInRecord) {
    //     console.log('Cannot save: No Time In record found for this student today.');
    //     return; // Prevent saving Time Out if no Time In exists
    //   }
    // }
    // Save the attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        student_id: studentId,
        date: today,
        time: new Date().toISOString(),
        type: attendanceType,
        status: 'Present',
      });
  
    if (error) {
      console.error('Error recording attendance:', error.message);
      setError('Error recording attendance');
      return;
    }
  
    console.log('Recorded attendance:', data);
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
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 p-5 justify-center mx-auto mt-5">
        <div className="bg-white shadow-md rounded-xl p-5 w-full md:w-[33%] h-[50vh] relative">
          <div>

          </div>
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
        
        <div className="bg-white shadow-md rounded-xl p-6 w-full md:w-[33%] h-[50vh]">
          <h2 className="text-xl font-bold mb-4">Select Attendance Type</h2>
          <div className="flex flex-row mb-4">
            <div className="flex items-center mr-4">
              <input
                type="radio"
                id="time_in"
                name="attendance_type"
                value="time_in"
                checked={attendanceType === 'time_in'}
                onChange={(e) => {
                  console.log(`Selected attendance type: ${e.target.value}`); 
                  setAttendanceType(e.target.value);
              }}
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
            onChange={(e) => {
              const newAttendanceType = e.target.value;
              console.log(`Attendance type changed to: ${newAttendanceType}`); // Log the change
              setAttendanceType(e.target.value);
            }}
        />
              <label htmlFor="time_out" className="ml-2">Time Out</label>
            </div>
          </div>
          {studentInfo && (
            <div>
              <p><strong>Name:</strong> {studentInfo.name}</p>
              <p><strong>Email:</strong> {studentInfo.email}</p>
              <p><strong>Attendance Status:</strong> Present</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
