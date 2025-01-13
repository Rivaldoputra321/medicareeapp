import Head from "next/head";
import Image from 'next/image'; 
import styles from "../styles/styles.module.css"; 
import user from '../public/user.jpg';
import w from '../public/w.png';
import logo from '../public/logo.png';
import p4 from '../public/p4.png';
import p9 from '../public/p9.png';

export default function Home() {
    return (
        <div className="relative flex flex-col min-h-screen py-2 bg-white">
            <Head>
                <title>Halaman Utama</title>
                <meta name="description" content="Selamat datang di MediCare!" />
            </Head>

            <nav className="bg-white shadow fixed py-3 top-0 left-0 right-0 z-10">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center py-3">
                        <span className="text-green-500 text-2xl font-black">Medi</span>
                        <span className="text-black text-2xl font-black">Care</span>
                        <div className="flex space-x-4 ml-6">
                            <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">Beranda</a>
                            <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">Riwayat</a>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center">
                        <a href="#" className="text-black hover:text-green-500 font-semibold py-3 rounded-lg px-5">User</a>
                        <Image src={user} alt="user" width={40} height={40} className="ml-3" placeholder='blur' />
                    </div>
                </div>
            </nav>
                        
            <div className="flex justify-center items-center flex-grow mt-16 relative">
                <Image src={p4} alt="p4.png" width={500} height={500} className="ml-3" placeholder='blur' />
                <p className="text-black absolute top-20 left-1/3 ml-36 -mt-5 transform text-xl font-bold -translate-x-1/2">Ubah Profile</p>
                <p className="text-gray-400 absolute top-24 left-1/3 ml-32 transform font-semibold text-xs -translate-x-1/2">Nama Lengkap</p>
                
                <div className="absolute ml-64 top-44 left-1/3 w-80 -translate-x-1/2 -mt-10 mb-0">
                    <input 
                        type="text" 
                        placeholder="Masukkan nama lengkap" 
                        className="border text-black border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <p className="text-gray-400 absolute top-16 -left-1/3 ml-36 transform font-semibold text-xs -translate-x-1/2">Tanggal Lahir</p>
                </div>

                <div className="absolute ml-64 top-36 left-1/3 w-80 -translate-x-1/2 mt-24">
                    <input 
                        type="text" 
                        placeholder="Masukkan tanggal lahir" 
                        className="border text-black border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <p className="text-gray-400 absolute left-1/3 ml-64 -mt-30 transform font-semibold text-xs -translate-x-1/2">Jenis Kelamin</p>

                <select className="absolute mt-40 left-1/3 w-80 -translate-x-1/2 border ml-64 mb-12 text-black border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="" disabled selected>Pilih jenis kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                    <option value="other">Lainnya</option>
                </select>
            

                <div className="absolute left-1/3 ml-60 w-80 mb-30 -translate-x-1/2 mt-80 py-5 -right-3">
                <Image src={p9} alt="p9.png" width={500} height={500} className="ml-3" placeholder='blur' />
                    <a href="#" className="text-white -mt-16 hover:text-black font-semibold py-8 rounded-lg px-20 block text-center">Simpan Profil</a>
                </div>

            </div>
        </div> 
    );
}
