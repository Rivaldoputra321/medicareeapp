'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from "@/app/component/navbar";
import look4 from '../../public/look4.png';
import { Doctor, fetchDoctors } from '@/utils/doctor';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DoctorsPageProps {
  params: {
    spesialistId: string;
  },
  searchParams: {
    spesialistName?: string;
    search?: string;
  }
}

export default function DoctorsPage({ params, searchParams }: DoctorsPageProps) {
  const spesialistId = params.spesialistId;
  const router = useRouter();
  const spesialistName = searchParams.spesialistName || 'Spesialis';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.search || '');

  const loadDoctors = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDoctors(spesialistId, page, pagination.limit, searchParams.search || '');
      
      if (response && response.data) {
        setDoctors(response.data);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } else {
        setError('Data tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal memuat data dokter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors(pagination.page);
  }, [pagination.page, searchParams.search]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to the search results page with the search term
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Dokter Offline {spesialistName}
        </h1>

        {/* Search Bar with Navigation */}
        <div className="w-full mb-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Cari dokter atau spesialis"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button 
                type="submit" 
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        <div className="bg-transparent w-full mb-8">
          
          <div className="flex gap-5">
            <button 
              onClick={() => router.back()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-150"
            >
              Back
            </button>
            <span className="bg-white py-2 px-4 rounded-lg text-gray-600 font-medium ">{spesialistName}</span>
          </div>
        </div>
        
        {doctors.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Tidak ada dokter ditemukan
          </div>
        ) : (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="w-full bg-white border rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src={doctor.user?.photo_profile || look4}
                      alt={doctor.user?.name || 'Dokter'}
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{doctor.user?.name}</h2>
                      <p className="text-green-600 font-medium">{spesialistName}</p>
                      <p className="text-gray-600 mt-1">
                        Pengalaman: {doctor.experience || 'Tidak tersedia'}
                      </p>
                      <p className="mt-1 font-medium">
                        <span
                          className={`ml-2 px-2 py-1 rounded-lg text-white text-sm ${
                            doctor.user.status === 1 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {doctor.user.status === 1 ? 'Online' : 'Offline'}
                        </span>
                      </p>
                      <p className="text-gray-800 mt-2 font-bold">
                        {doctor.price
                          ? `Rp ${doctor.price.toLocaleString()}`
                          : "Tidak tersedia"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/doctors/doctor/${doctor.id}`)}
                    className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors duration-200 self-end"
                  >
                    Pilih Dokter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination component remains the same */}
        {doctors.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-8 mb-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 
              ${pagination.page === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'}`}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const current = pagination.page;
                return page === 1 || 
                      page === pagination.totalPages || 
                      (page >= current - 1 && page <= current + 1);
              })
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2 py-2 text-gray-500">...</span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 
                      ${page === pagination.page
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'}`}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || doctors.length === 0}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 
              ${pagination.page === pagination.totalPages || doctors.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>

      )}
      </div>
    </div>
  );
}