import React from 'react';
import Link from 'next/link';
import Navbar from '../pages/components/Navbar';

export default function Homepage() {
  return (
    <div>
      <Navbar/>
      <div className='flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100'>
        {/* Logo Image */}
        <img 
          src="logo.png" 
          alt="Logo" 
          className="w-32 h-32 object-cover mb-8"
        />

        {/* Container for the cards */}
        <div className="flex flex-wrap justify-center gap-4 max-w-6xl w-full px-4 mb-[10%]">
         
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bg-white shadow-md rounded-lg p-4 text-center">
          <Link href='/scan'>
            <h2 className="text-lg font-semibold">Scan here</h2>
            <p className="text-gray-700 mt-2">Tap this to scan.</p>
            </Link>
          </div>
        
          {/* Card 1 */}
        

          {/* Card 2 */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bg-white shadow-md rounded-lg p-4 text-center">
          <Link href='/timeinlist'>
            <h2 className="text-lg font-semibold">Timein List</h2>
            <p className="text-gray-700 mt-2">See the present student.</p>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
