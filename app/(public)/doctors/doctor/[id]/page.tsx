"use client";

import React, { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import Head from "next/head";
import Image from 'next/image';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { Doctor, fetchDoctorId } from '@/utils/doctor';
import { createAppointment, CreateAppointmentDto } from '@/utils/appointment';
import axios, { AxiosError } from 'axios';
import Navbar from '@/app/component/navbar';
import Swal from 'sweetalert2';


export default function DoctorDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ date: string; time: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = moment();
  const maxDate = moment().add(30, 'days');

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const data = await fetchDoctorId(params.id);
        setDoctor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [params.id]);

  const handleDateChange = (date: moment.Moment | null) => {
    if (date) {
      setSelectedDate({
        date: date.format('YYYY-MM-DD'),
        time: date.format('HH:mm')
      });
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a date and time',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    try {
      const appointmentData: CreateAppointmentDto = {
        doctorId: params.id,
        schedule: moment(`${selectedDate.date} ${selectedDate.time}`).toISOString()
      };

      const appointmentResponse = await createAppointment(appointmentData);
      
      await Swal.fire({
        title: 'Success!',
        text: 'Your appointment has been booked successfully',
        icon: 'success',
        confirmButtonText: 'View Appointments',
        confirmButtonColor: '#16a34a',
        timer: 3000,
        timerProgressBar: true
      });
      
      router.push('/payacc');
    } catch (error) {
      const err = error as AxiosError<any>;
      const statusCode = err.response?.status;
      
      switch (statusCode) {
        case 401:
          await Swal.fire({
            title: 'Session Expired',
            text: 'Please sign in to continue',
            icon: 'warning',
            confirmButtonText: 'Sign In',
            confirmButtonColor: '#16a34a'
          });
          router.push('/signin');
          break;
        
        case 409:
          Swal.fire({
            title: 'Appointment Exists',
            text: 'You already have an appointment scheduled for this time',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#16a34a'
          });
          break;

        default:
          Swal.fire({
            title: 'Booking Failed',
            text: err.response?.data?.message || 'Failed to book appointment',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#16a34a'
          });
      }
    }
  };
  
  

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center">Doctor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <br />
      <main className="pt-16">
        {/* Header Section */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-150"
              >
                Back
              </button>
              <span className="text-gray-600 font-medium">{doctor.user.name}</span>
            </div>
          </div>
        </div>

        {/* Doctor Profile Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <div className="h-48 w-full md:w-48 relative">
                  {doctor.user.photo_profile ? (
                    <Image
                      src={doctor.user.photo_profile}
                      alt={doctor.user.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{doctor.user.name}</h2>
                    <p className="mt-2 text-xl text-gray-600">{doctor.spesialist.name}</p>
                    <p className="mt-2 text-xl text-gray-600">{doctor.alumnus}</p>
                    <div className="mt-4 flex items-center">
                      <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="ml-2 text-gray-600">{doctor.experience} Tahun Pengalaman</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    Rp. {doctor.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Appointment Booking Section */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Pilih tanggal dan waktu kunjungan</h3>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                <DatePicker 
                  className="w-full border border-gray-300 rounded-lg shadow-sm p-2"
                  placeholder="Pilih tanggal dan waktu"
                  format="DD MMMM YYYY HH:mm"
                  showTime={{
                    format: 'HH:mm',
                    minuteStep: 1,
                    hideDisabledOptions: false,
                    disabledHours: () => [
                      ...Array.from({ length: 0 }, (_, i) => i),
                      ...Array.from({ length: 0}, (_, i) => i + 23)
                    ]
                  }}
                  disabledDate={(current) => {
                    const isOutOfRange = current < moment().startOf('day') || current > maxDate;

                    return isOutOfRange ;
                  }}
                  onChange={handleDateChange}
                />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Informasi Jadwal:</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">• Jadwal praktik Senin - Jumat</p>
                    <p className="text-sm text-gray-600">• Jam praktik: 08:00 - 16:00</p>
                    <p className="text-sm text-gray-600">• Sabtu & Minggu: Tutup</p>
                    <p className="text-sm text-gray-600">• Pemilihan jadwal maksimal 30 hari ke depan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Book Appointment Button */}
          <div className="mt-8 flex justify-end">
          <button 
  onClick={handleBookAppointment}
  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition duration-150"
>
  Buat Janji
</button>
          </div>
        </div>
      </main>
    </div>
  );
}