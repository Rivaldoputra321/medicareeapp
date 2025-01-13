'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';
import Navbar from "@/app/component/navbar";
import { fetchSpesialists, Spesialist } from '@/utils/spesialist';
import defaultImage from '../public/bedah.png';

export default function Home() {
    const [specialists, setSpecialists] = useState<Spesialist[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const loadSpecialists = async () => {
            try {
                const data = await fetchSpesialists();
                setSpecialists(data);
            } catch (err) {
                setError('Failed to load specialists. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        loadSpecialists();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <Navbar />

            <main className="pt-20 pb-16">
                {/* Hero section with enhanced gradient */}
                <div className="bg-gradient-to-br from-green-100 via-green-50 to-white py-16 px-4 shadow-lg">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-green-800 mb-4 animate-fade-in">
                                Medicare
                            </h1>
                            <p className="text-lg text-green-700">
                                Temukan dokter spesialis terbaik untuk kebutuhan Anda
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Search className="text-green-500" size={20} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Cari Dokter, spesialisasi, atau rumah sakit"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Specialists section with enhanced cards */}
                <section className="max-w-7xl mx-auto px-4 mt-16">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-green-800">Spesialisasi Medis</h2>
                            <p className="text-green-600 mt-1">Berbagai pilihan spesialisasi dokter</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
                            <p className="text-green-600 mt-4">Memuat spesialisasi...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-red-50 rounded-lg">
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 text-red-600 hover:text-red-700 underline"
                            >
                                Coba lagi
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {specialists.map((specialist) => (
                                <Link 
                                    key={specialist.id} 
                                    href={`/doctors/${specialist.id}?spesialistName=${encodeURIComponent(specialist.name)}`}
                                    className="group"
                                >
                                    <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center h-full border border-green-100 hover:border-green-200 transform hover:-translate-y-1">
                                        <div className="relative mb-4 mx-auto w-24 h-24">
                                            <Image 
                                                src={specialist.gambar || defaultImage} 
                                                alt={`${specialist.name} icon`} 
                                                width={96} 
                                                height={96} 
                                                className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <h3 className="text-green-700 font-semibold group-hover:text-green-500 transition-colors">
                                            {specialist.name}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}