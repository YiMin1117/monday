import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';

export function NavBar() {
    const [isHw1DropdownOpen, setIsHw1DropdownOpen] = useState(false);
    const [isHw2DropdownOpen, setIsHw2DropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleHw1Dropdown = () => {
        setIsHw1DropdownOpen(!isHw1DropdownOpen);
        // 確保只打開 hw1 的下拉菜單時關閉 hw2
        if (isHw2DropdownOpen) setIsHw2DropdownOpen(false);
    };

    const toggleHw2Dropdown = () => {
        setIsHw2DropdownOpen(!isHw2DropdownOpen);
        // 確保只打開 hw2 的下拉菜單時關閉 hw1
        if (isHw1DropdownOpen) setIsHw1DropdownOpen(false);
    };

    // 登出功能
    const submitLogout = (e) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:8000/api/logout", {}, { withCredentials: true })
            .then((res) => {
                navigate('/'); // 登出後返回登入頁面
            })
            .catch((error) => {
                console.error("Logout Error:", error);
            });
    };

    return (
        <nav className="bg-teal-900 w-full left-0 fixed top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-white text-2xl font-bold">
                    YIMIN_finance
                </div>
                <div className="hidden md:flex space-x-8 relative">
                    <div className="relative">
                        <button 
                            onClick={toggleHw1Dropdown} 
                            className="text-white hover:underline focus:outline-none"
                        >
                            hw1
                        </button>
                        {isHw1DropdownOpen && (
                            <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg py-2 z-10 ">
                                <Link to="/finance" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">hw1-strategy</Link>
                                <Link to="/tracklist" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">hw1-tracklist</Link>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button 
                            onClick={toggleHw2Dropdown} 
                            className="text-white hover:underline focus:outline-none"
                        >
                            hw2
                        </button>
                        {isHw2DropdownOpen && (
                            <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg py-2 z-10 ">
                                <Link to="/rsi" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">hw2-1</Link>
                                <Link to="/backtrader" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">hw2-2</Link>
                            </div>
                        )}
                    </div>
                    <div className='relative'>
                        <Link to="/homepage" className="text-white hover:underline focus:outline-none">hw9</Link>
                    </div>
                    <button 
                        onClick={submitLogout} 
                        className="text-white hover:underline focus:outline-none"
                    >
                        Logout
                    </button>
                </div>
                <div className="flex md:hidden">
                    <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span className="sr-only">Open main menu</span>
                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
