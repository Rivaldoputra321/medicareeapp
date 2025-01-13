'use client'
import Head from "next/head";
import { FaRegEnvelope } from 'react-icons/fa';
import { MdLockOutline } from 'react-icons/md';
import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Home() {
  // State untuk menangani input form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Password dan konfirmasi password tidak sama.');
      return;
    }

    const data = {
      name,
      email,
      password,
      date_of_birth: dateOfBirth,
      gender,
      telp: phoneNumber
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, { // Sesuaikan endpoint backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/signin');
        
      } else {
        alert('Gagal mendaftar');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white text-black rounded-2xl shadow-2xl flex w-2/3 max-w-4xl">
          <div className="w-3/5 p-5">
            <div className="text-left font-bold">
              <span className="text-green-500">Medi</span>Care
            </div>
            <div className="py-8">
              <h2 className="text-3xl font-bold text-green-500 mb-2">
                Sign up to Account
              </h2>
              <div className="border-2 w-10 border-green-500 inline-block mb-2"></div>
              <p className="text-gray-400 my-3">or use your email account</p>
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-100 outline-none text-sm flex-1"
                  />
                </div>

                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <FaRegEnvelope className="text-gray-400 m-2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-100 outline-none text-sm flex-1"
                  />
                </div>

                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <MdLockOutline className="text-gray-400 m-2" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-100 outline-none text-sm flex-1"
                  />
                </div>

                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <MdLockOutline className="text-gray-400 m-2" />
                  <input
                    type="password"
                    name="confirm password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-100 outline-none text-sm flex-1"
                  />
                </div>

                {/* Pemilihan Tanggal Lahir */}
                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-gray-100 outline-none text-sm flex-1"
                  />
                </div>

                {/* Pemilihan Gender */}
                <div className="w-64 mb-3">
                  <label className="mr-3">Gender:</label>
                  <label className="mr-2">
                    <input
                      type="radio"
                      value="male"
                      checked={gender === 'male'}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Male
                  </label>
                  <label className="mr-2">
                    <input
                      type="radio"
                      value="female"
                      checked={gender === 'female'}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Female
                  </label>
                </div>

                {/* Phone Number */}
                <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                  <input
                    type="text"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-100 outline-none text-sm flex-1"
                  />
                </div>

                <button
                  onClick={handleRegister}
                  className="border-2 border-green-500 text-green-500 rounded-full px-12 py-2 mt-3 inline-block font-semibold hover:bg-green-500 hover:text-white"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>

          <div className="w-2/5 bg-green-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">Have an account?</h2>
            <div className="border-2 w-10 border-white inline-block mb-2"></div>
            <p className="mb-4">
              Silahkan Login Jika Sudah Memiliki Akun
            </p>
            <p className="mb-5">
              Konsultasi, Buat janji, dan kunjungi rumah sakit sekarang tersedia di MediCare!
            </p>
            <a
              href="#"
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500"
            >
              Sign in
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
