'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from "@/app/component/navbar";
import look4 from '../../public/look4.png';
import { Doctor, fetchDoctors } from '@/utils/doctor';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({
    page: currentPage,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(query);

  const loadDoctors = async (page: number, search: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchDoctors(undefined, page, pagination.limit, search);

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
    loadDoctors(currentPage, query);
  }, [currentPage, query]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchTerm.trim());
      params.set('page', '1');
      router.push(`/search?${params.toString()}`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-lg text-red-600">{error}</div>
    </div>
  );

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Hasil Pencarian untuk "{query}"
        </h1>

        {/* Improved Search Bar */}
        <div className="w-full mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari dokter"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              Cari
            </button>
          </div>
        </div>

        <div className="bg-transparent w-full mb-8">
          
            <div className="flex gap-5">
              <button 
                onClick={() => router.back()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-150"
              >
                Back
              </button>
              <span className="bg-white py-2 px-4 rounded-lg text-gray-600 font-medium ">{query}</span>
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
                      <p className="text-green-600 font-medium">{doctor.spesialist.name}</p>
                      <p className="text-gray-600 mt-1">
                        Pengalaman: {doctor.experience || 'Tidak tersedia'}
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

        {/* Improved Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || pagination.totalPages === 1}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
                currentPage === 1 || pagination.totalPages === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const current = currentPage;
                  return page === 1 || 
                        page === pagination.totalPages || 
                        (page >= current - 1 && page <= current + 1);
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-3 py-2">...</span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={pagination.totalPages === 1}
                      className={`w-10 h-10 rounded-lg transition-colors duration-200 ${
                        page === currentPage
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || pagination.totalPages === 1}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
                currentPage === pagination.totalPages || pagination.totalPages === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}