"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/component/navbar';
import { Appointment, getAppointmentsByStatus, AppointmentStatus } from '@/utils/appointment';
import { Spin } from 'antd';

const AppointmentHistory = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'waiting' | 'completed' | 'failed'>('waiting');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await getAppointmentsByStatus(activeTab, page);
        
        if (page === 1) {
          setAppointments(response.data);
        } else {
          setAppointments(prev => [...prev, ...response.data]);
        }
        
        setHasMore(response.meta.page < response.meta.totalPages);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            router.push('/signin');
            return;
          }
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [activeTab, page, router]);

  useEffect(() => {
    setPage(1);
    setAppointments([]);
  }, [activeTab]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusStyle = (status: AppointmentStatus) => {
    const styles = {
      [AppointmentStatus.PENDING]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      },
      [AppointmentStatus.APPROVED]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      },
      [AppointmentStatus.AWAITING_PAYMENT]: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200'
      },
      [AppointmentStatus.PAID]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      },
      [AppointmentStatus.IN_PROGRESS]: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200'
      },
      [AppointmentStatus.COMPLETED]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      },
      [AppointmentStatus.CANCELLED]: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      },
      [AppointmentStatus.REJECTED]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      },
      [AppointmentStatus.RESCHEDULED]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      }
    };

    return styles[status];
  };

  const getStatusText = (status: AppointmentStatus) => {
    const text = {
      [AppointmentStatus.PENDING]: 'Menunggu Konfirmasi',
      [AppointmentStatus.APPROVED]: 'Disetujui',
      [AppointmentStatus.AWAITING_PAYMENT]: 'Menunggu Pembayaran',
      [AppointmentStatus.PAID]: 'Sudah Dibayar',
      [AppointmentStatus.IN_PROGRESS]: 'Sedang Berlangsung',
      [AppointmentStatus.COMPLETED]: 'Selesai',
      [AppointmentStatus.CANCELLED]: 'Dibatalkan',
      [AppointmentStatus.REJECTED]: 'Ditolak',
      [AppointmentStatus.RESCHEDULED]: 'Perlu Reschedule'
    };
    return text[status] || status;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Meeting link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-6">Riwayat Konsultasi</h1>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'waiting', label: 'Sedang Diproses' },
                { key: 'completed', label: 'Selesai' },
                { key: 'failed', label: 'Dibatalkan/Ditolak' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as 'waiting' | 'completed' | 'failed')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">{error}</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Tidak ada riwayat konsultasi</div>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => {
              const statusStyle = getStatusStyle(appointment.status);
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden relative bg-gray-200">
                          {appointment.doctor?.user.photo_profile && (
                            <Image
                              src={appointment.doctor.user.photo_profile}
                              alt={appointment.doctor.user.name}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-full"
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.doctor?.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {moment(appointment.schedule).format('DD MMMM YYYY, HH:mm')} WIB
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="border-t border-gray-100 pt-4">
                      {/* Price Info */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-600">Biaya Konsultasi</span>
                        <span className="font-semibold text-gray-900">
                          Rp {(appointment.transaction?.amount || appointment.doctor?.price || 0).toLocaleString()}
                        </span>
                      </div>

                      {appointment.status === AppointmentStatus.AWAITING_PAYMENT && (
                            <div className="mb-4">
                            <button
                                onClick={() => router.push(`/payment/${appointment.transaction?.id}`)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Bayar Sekarang
                            </button>
                            </div>
                        )}

                      {/* Meeting Link */}
                      {appointment.meeting_link && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link Google Meet
                          </label>
                          <a
                            href={appointment.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}


                      {/* Rejection Reason */}
                      {appointment.rejection_reason && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg">
                          <h4 className="text-sm font-medium text-red-800 mb-1">
                            Alasan Penolakan:
                          </h4>
                          <p className="text-sm text-red-600">
                            {appointment.rejection_reason}
                          </p>
                        </div>
                      )}

                      {/* Reschedule Info */}
                      {appointment.status === AppointmentStatus.RESCHEDULED && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">
                            Informasi Reschedule:
                          </h4>
                          <p className="text-sm text-yellow-600">
                            Jadwal perlu diatur ulang. Silahkan hubungi dokter untuk menentukan jadwal baru.
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Jumlah reschedule: {appointment.reschedule_count}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className={`
                    inline-flex items-center px-6 py-2.5 border border-transparent 
                    text-sm font-medium rounded-md shadow-sm text-white 
                    ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} 
                    transition-colors duration-200 disabled:cursor-not-allowed
                  `}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Spin size="small" className="mr-2" /> Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;