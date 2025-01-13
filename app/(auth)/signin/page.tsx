'use client'

import { useState, useEffect, FormEvent } from 'react';
import Head from "next/head";
import { useRouter } from 'next/navigation';
import { FaRegEnvelope } from 'react-icons/fa';
import { MdLockOutline } from 'react-icons/md';
import { login } from '@/utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false); // Untuk efek gemetar
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      setError('You are already logged in.');
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);

      switch (response.user.user_type) {
        case 'admin':
          router.push('/dashboard/admin/manage-doctors');
          break;
        case 'doctor':
          router.push('/doctor/dashboard');
          break;
        case 'patient':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      setError('Invalid email or password');
      setShake(true); // Aktifkan efek gemetar

      setTimeout(() => {
        setShake(false); // Matikan efek gemetar setelah 500ms
        setEmail('');
        setPassword('');
      }, 500);

      // Refresh otomatis setelah 3 detik
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <Head>
        <title>MediCare - Sign In</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white text-black rounded-2xl shadow-2xl flex w-2/3 max-w-4xl overflow-hidden">
          <div className="w-3/5 p-5">
            <div className="text-left font-bold">
              <span className="text-green-500">Medi</span>Care
            </div>
            <div className="py-10">
              <h2 className="text-3xl font-bold text-green-500 mb-2">
                Sign in to Account
              </h2>
              <div className="border-2 w-10 border-green-500 inline-block mb-2"></div>
              
              {error && (
                <div className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded animate-pulse">
                  {error}
                </div>
              )}

              <form 
                onSubmit={handleSubmit} 
                className={`flex flex-col items-center ${shake ? 'animate-shake' : ''}`}
              >
                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <FaRegEnvelope className="text-gray-400 m-2" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" 
                    required
                    className="bg-gray-100 outline-none text-sm flex-1" 
                    disabled={isLoading}
                  />
                </div>

                <div className="bg-gray-100 w-64 p-2 flex items-center mb-4">
                  <MdLockOutline className="text-gray-400 m-2" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    required
                    className="bg-gray-100 outline-none text-sm flex-1" 
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`border-2 border-green-500 rounded-full mt-3 px-12 py-2 inline-block font-semibold
                    ${isLoading 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'text-green-500 hover:bg-green-500 hover:text-white'}`}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="w-2/5 bg-green-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">Welcome</h2>
            <div className="border-2 w-10 border-white inline-block"></div>
            <p className="mb-10">
              Konsultasi, Buat janji, dan kunjungi rumah sakit sekarang tersedia di MediCare!
            </p> 
            <a 
              href="/signup"
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white
              hover:text-green-500"
            >
              Sign up
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
