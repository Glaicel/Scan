"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/app/supabase';
import {useRouter} from 'next/navigation'
import { User } from '@supabase/supabase-js';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Initialize useRouter
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null); // Clear user state after sign out
      router.push('/'); // Redirect to the login page
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link href="/homepage">Smart Scan</Link>
        </div>
        <div className="hidden md:flex ml-auto space-x-8">
          <Link href="/homepage" className="text-white hover:text-gray-400">
            Home
          </Link>
          <Link href="/student" className="text-white hover:text-gray-400">
            Student
          </Link>
        </div>
        <div className=" relative hidden md:flex relative ml-5"> {/* Hide for mobile */}
          {/* Avatar Button for larger screens */}
          <button
            id="dropdownUserAvatarButton"
            onClick={toggleDropdown}
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            type="button"
          >
            <span className="sr-only">Open user menu</span>
            <img className="w-8 h-8 rounded-full" src="logo.png" alt="user photo" />
          </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute mt-8 right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                    <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {user ? (
              <div>
                <h1>{user.email}</h1>
                {/* Other user information can be displayed here */}
              </div>
            ) : (
              <div>Please log in</div>
            )}
              </div>
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUserAvatarButton">
                <li>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Profile</a>
                </li>
               
              </ul>
              <div className="py-2">
              <button 
            onClick={handleSignOut} 
            className="bg-red-500 text-white rounded py-2 px-5 ms-3"
          >
            Sign Out
          </button>

              </div>
            </div>
          )}
        </div>
        <div className="md:hidden flex items-center"> {/* Show on mobile */}
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
          {/* Avatar Button next to hamburger menu for mobile */}
          <div className="relative ml-2"> 
            <button
              id="dropdownUserAvatarButtonMobile"
              onClick={toggleDropdown}
              className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              type="button"
            >
              <span className="sr-only">Open user menu</span>
              <img className="w-8 h-8 rounded-full" src="logo.png" alt="user photo" />
            </button>

            {/* Dropdown menu for mobile */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                {user ? (
        <div>
          <h1>{user.email}</h1>
          {/* Other user information can be displayed here */}
        </div>
      ) : (
        <div>Please log in</div>
      )}
                </div>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownUserAvatarButtonMobile">
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Profile</a>
                  </li>
                </ul>
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/homepage" className="block text-white hover:text-gray-400">
            Home
          </Link>
          <Link href="/student" className="block text-white hover:text-gray-400">
            Student
          </Link>
          {/* <Link href="/account" className="block text-white hover:text-gray-400">
            Account
          </Link> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
