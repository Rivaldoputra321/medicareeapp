'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import defaultProfilePic from '@/public/default-profile.png';
import { getCurrentUser, logout, User } from '@/utils/auth';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedUser = getCurrentUser();
        setUser(savedUser);

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsDropdownOpen(false);
    };

    return (
        <nav className="bg-white shadow fixed py-3 top-0 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center py-3">
                    <span className="text-green-500 text-2xl font-bold">Medi</span>
                    <span className="text-black text-2xl font-bold">Care</span>
                    <div className="flex space-x-4 ml-6">
                        <Link href="/" className="text-green-600 hover:text-green-500 font-semibold">
                            Beranda
                        </Link>
                        <Link href="/riwayat" className="text-gray-700 hover:text-green-500 font-semibold">
                            Riwayat
                        </Link>
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                        {user && user.user_type === 'patient' ? (
                            <div className="relative" ref={dropdownRef}>
                                <div 
                                    className="flex items-center space-x-3 cursor-pointer"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <Image
                                            src={user.photo_profile || defaultProfilePic}
                                            alt="Profile"
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-black">{user.name}</span>
                                        <span className="text-xs text-gray-500 capitalize">{user.user_type}</span>
                                    </div>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link 
                                            href="/profile" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Edit Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/signin"
                                className="text-white hover:text-black font-semibold bg-green-600 py-3 rounded-lg px-5"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
