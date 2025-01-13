"use client";

import React, { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import Head from "next/head";
import Image from 'next/image';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { Doctor, fetchDoctorId } from '@/utils/doctor';


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
        time: date.format('HH:mm'),
      });
    }
  };

  // const handleBookAppointment = async () => {
  //   if (!selectedDate) {
  //     alert('Please select a date and time');
  //     return;
  //   }

  //   try {
  //     const response = await fetch('/api/appointments', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         doctorId: params.id,
  //         appointmentDate: selectedDate.date,
  //         appointmentTime: selectedDate.time,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to book appointment');
  //     }

  //     alert('Appointment booked successfully!');
  //     router.push('/appointments');
  //   } catch (err) {
  //     alert('Failed to book appointment. Please try again.');
  //   }
  // };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center">Doctor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>MediCare - Book Appointment with {doctor.user.name}</title>
        <meta name="description" content={`Book your medical appointment with ${doctor.user.name}`} />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-green-600 text-2xl font-bold">Medi</span>
                <span className="text-gray-900 text-2xl font-bold">Care</span>
              </div>
              <div className="ml-6 flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 font-medium">Beranda</a>
                <a href="/appointments" className="text-gray-700 hover:text-green-600 px-3 py-2 font-medium">Riwayat</a>
              </div>
            </div>
            <div className="flex items-center">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-150">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
              // onClick={handleBookAppointment}
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