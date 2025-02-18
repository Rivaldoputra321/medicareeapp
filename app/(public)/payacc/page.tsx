"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/component/navbar';

import { 
  Appointment, 
  getAppointmentsByStatus, 
  AppointmentStatus, 
  recordPresence,
  rescheduleAppointment, 
  RescheduleAppointmentDto
} from '@/utils/appointment';
import { Spin, Modal, DatePicker, message } from 'antd';

const AppointmentHistory = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'waiting' | 'completed' | 'failed'>('waiting');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newSchedule, setNewSchedule] = useState<{ date: string; time: string } | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false)

  const maxDate = moment().add(30, 'days');

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
          if (err.message.includes('unauthorized')) {
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
  
  const handleDateChange = (date: moment.Moment | null) => {
    if (date) {
      setNewSchedule({
        date: date.format('YYYY-MM-DD'),
        time: date.format('HH:mm')
      });
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
      },
      [AppointmentStatus.AWAITING_JOIN_MEETING]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-900',
        border: 'border-yellow-300'
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
      [AppointmentStatus.AWAITING_JOIN_MEETING]: 'Silahkan Join Meeting',
      [AppointmentStatus.RESCHEDULED]: 'Perlu Reschedule'
    };
    return text[status] || status;
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newSchedule) {
      message.error('Silakan pilih jadwal baru');
      return;
    }
  
    try {
      setRescheduleLoading(true);
      const updateData: RescheduleAppointmentDto = {
        reschedule: moment(`${newSchedule.date} ${newSchedule.time}`).toISOString()
      };
      
      await rescheduleAppointment(selectedAppointment.id, updateData);
      
      message.success('Jadwal berhasil diubah');
      setIsRescheduleModalOpen(false);
      
      // Refresh appointments
      const response = await getAppointmentsByStatus(activeTab, 1);
      setAppointments(response.data);
      setPage(1);
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setRescheduleLoading(false);
      setSelectedAppointment(null);
      setNewSchedule(null);
    }
  };
  
  const handleJoinMeeting = async (appointmentId: string, meetingLink: string) => {
    try {
      await recordPresence(appointmentId);
      window.open(meetingLink, '_blank');
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };
  
  const handlePayment = (appointment: Appointment) => {
    if (!appointment.transaction) {
      message.error('Transaction not found');
      return;
    }
  
    const paymentUrl = appointment.transaction.payment_link;
    
    if (!paymentUrl) {
      message.error('Payment link not found');
      return;
    }
  
    window.location.href = paymentUrl;
  };

  const openRescheduleModal = (appointment: Appointment) => {
    if (appointment.reschedule_count >= 3) {
      message.error('Anda telah mencapai batas maksimal pengajuan reschedule');
      return;
    }
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  const shouldShowJoinButton = (schedule: Date) => {
    const now = moment();
    const appointmentTime = moment(schedule);
    return appointmentTime.diff(now, 'minutes') <= 5 && appointmentTime.diff(now, 'minutes') >= -30;
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

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-center">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Tidak ada riwayat konsultasi</div>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => {
              const statusStyle = getStatusStyle(appointment.status);
              const canReschedule = appointment.status === AppointmentStatus.REJECTED && 
                                  appointment.reschedule_count < 3;
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
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
                              fill
                              className="object-cover rounded-full"
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
                        className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyle?.bg} ${statusStyle?.text}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-600">Biaya Konsultasi</span>
                        <span className="font-semibold text-gray-900">
                          Rp {(appointment.transaction?.amount || appointment.doctor?.price || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4">
                        {appointment.status === AppointmentStatus.AWAITING_PAYMENT && (
                         <button
                         onClick={() => handlePayment(appointment)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                       >
                         {paymentLoading ? (
                           <>
                             <Spin className="mr-2" />
                             Redirecting...
                           </>
                         ) : (
                           'Bayar Sekarang'
                         )}
                       </button>
                        )}

                        {appointment.status === AppointmentStatus.AWAITING_JOIN_MEETING && shouldShowJoinButton(appointment.schedule) && (
                          <button
                            onClick={() => handleJoinMeeting(appointment.id, appointment.meeting_link || '')}
                            className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Join Meeting
                          </button>
                        )}
                      </div>

                      {/* Rejection Info */}
                      {appointment.rejection_reason && (
                          <div className="mt-4 p-4 bg-red-50 rounded-lg">
                            <h4 className="text-sm font-medium text-red-800 mb-1">
                              Alasan Penolakan:
                            </h4>
                            <p className="text-sm text-red-600 mb-3">
                              {appointment.rejection_reason}
                            </p>
                            {canReschedule && (
                              <button
                                onClick={() => openRescheduleModal(appointment)}
                                className="w-full inline-flex justify-center items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                              >
                                Ajukan Reschedule ({3 - appointment.reschedule_count} kesempatan tersisa)
                              </button>
                            )}
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
                    <>
                      <Spin className="mr-2" /> 
                      Memuat...
                    </>
                  ) : (
                    'Muat Lebih Banyak'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reschedule Modal */}
        <Modal
          title="Atur Ulang Jadwal"
          open={isRescheduleModalOpen}
          onCancel={() => {
            setIsRescheduleModalOpen(false);
            setSelectedAppointment(null);
            setNewSchedule(null);
          }}
          footer={[
            <button
              key="cancel"
              onClick={() => {
                setIsRescheduleModalOpen(false);
                setSelectedAppointment(null);
                setNewSchedule(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>,
            <button
              key="submit"
              onClick={handleReschedule}
              disabled={rescheduleLoading || !newSchedule}
              className={`
                ml-3 px-4 py-2 text-sm font-medium text-white rounded-md
                ${rescheduleLoading || !newSchedule 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
                }
              `}
            >
              {rescheduleLoading ? (
                <>
                  <Spin className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          ]}
        >
          <div className="mt-4">
            <DatePicker 
              className="w-full border border-gray-300 rounded-lg shadow-sm p-2"
              placeholder="Pilih tanggal dan waktu"
              format="DD MMMM YYYY HH:mm"
              showTime={{
                format: 'HH:mm',
                minuteStep: 30,
                hideDisabledOptions: true,
                disabledHours: () => [
                  ...Array.from({ length: 8 }, (_, i) => i),
                  ...Array.from({ length: 8 }, (_, i) => i + 16)
                ]
              }}
              disabledDate={(current) => {
                const isOutOfRange = current < moment().startOf('day') || current > maxDate;
                const isWeekend = current.day() === 0 || current.day() === 6;
                return isOutOfRange || isWeekend;
              }}
              onChange={handleDateChange}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentHistory;
