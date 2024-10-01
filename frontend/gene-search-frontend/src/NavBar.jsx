import {  Link } from 'react-router-dom';
import React from 'react';

export function NavBar() {
    return (
        <nav className="bg-teal-900 w-full left-0 fixed top-0 z-50 ">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-white text-2xl font-bold">
                    YIMIN_Gene_Search
                </div>
                <div className="hidden md:flex space-x-8">
                    <Link to="/" className="text-white hover:underline">Search</Link> {/* 根路徑指向 Filter */}
                    <Link to="/browse" className="text-white hover:underline">Browse</Link>
                </div>
                <div className="flex md:hidden">
                    <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span className="sr-only">Open main menu</span>
                        {/* Icon when menu is closed */}
                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {/* Icon when menu is open */}
                        <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {/* <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Search</a>
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Browse</a>
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Filter</a>
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Statistics</a>
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Download</a>
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Tutorial</a>
                    <a href="#" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Contact</a>
                </div>
            </div> */}
        </nav>
    );
}
