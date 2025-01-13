'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import router untuk navigasi programatis
import Image from 'next/image'; 

import dokterumum from '../public/dokterumum.png';
import doktergigi from '../public/doktergigi.png';
import bedah from '../public/bedah.png';
import tht from '../public/tht.png';
import paru from '../public/paru.png';
import jantung from '../public/jantung.png';
import look4 from '../public/look4.png'; 
import Navbar from "@/app/component/navbar";
import { fetchSpesialists, Spesialist } from '@/utils/spesialist';

const SPECIALIST_IMAGES: { [key: string]: any } = {
  'Umum': dokterumum,
  'Dokter Gigi': doktergigi,
  'Spesialis THT': tht,
  'Bedah': bedah,
  'Kesehatan Paru': paru,
  'Spesialis Jantung': jantung
};

export default function Home() {
    const [specialists, setSpecialists] = useState<Spesialist[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter(); // Inisialisasi router

    useEffect(() => {
        const loadSpecialists = async () => {
            const data = await fetchSpesialists();
            setSpecialists(data);
        };
        loadSpecialists();
    }, []);

    // In your Home component, modify the handleSearch function:
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
};

    return (
        <div className="relative flex flex-col min-h-screen py-2 bg-white">
            <Navbar />

            {/* Input Pencarian */}
            <div className="max-w-7xl mx-auto px-4 mt-16">
                <form 
                    onSubmit={handleSearch} // Tangani submit secara manual
                    className="flex items-center gap-4"
                >
                    <input 
                        type="text" 
                        placeholder="Cari dokter, spesialis atau gejala"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border text-black border-gray-300 rounded-lg p-3 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button 
                        type="submit" 
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Header Spesialis */}
            <div className="text-center mt-6">
                <h2 className="text-3xl font-semibold text-gray-700">Spesialisasi Medis</h2>
                <p className="text-lg text-gray-500">Berbagai pilihan spesialisasi dokter</p>
            </div>

            {/* Render Specialists */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mt-10 px-6">
                {specialists.map((specialist) => (
                    <Link 
                        key={specialist.id} 
                        href={`/doctors/${specialist.id}?spesialistName=${encodeURIComponent(specialist.name)}`}
                        className="flex flex-col items-center text-center group hover:text-green-600 transition-colors"
                    >
                        <Image 
                            src={SPECIALIST_IMAGES[specialist.name] || look4} 
                            alt={`${specialist.name} icon`} 
                            width={100} 
                            height={100} 
                            className="rounded-lg mb-2 transition-transform group-hover:scale-110"
                            placeholder="blur"
                        />
                        <p className="text-gray-600 text-lg font-medium">{specialist.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
