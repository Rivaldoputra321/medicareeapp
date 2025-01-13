import Head from "next/head";
import Image from 'next/image'; 
import styles from "../styles/styles.module.css"; 
import user from '../public/user.jpg';
import gw from '../public/gw.png';
import hh from '../public/hh.png';
import kalender from '../public/kalender.png';
import height from '../public/height.png';
import berat from '../public/berat.png';

export default function Home() {
    return (
        <div className="relative flex flex-col min-h-screen py-2 bg-green-50">
            <Head>
                <title>Halaman Utama</title>
                <meta name="description" content="Selamat datang di MediCare!" />
            </Head>

            <nav className="bg-white shadow fixed py-3 top-0 left-0 right-0 z-10">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center py-3">
                        <span className="text-green-500 text-2xl font-bold">Medi</span>
                        <span className="text-black text-2xl font-bold">Care</span>
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

            <div className="flex flex-col items-start justify-start mt-24 ml-28 text-xl">
                <p className="text-left font-semibold text-gray-400">
                    Profile
                </p>
            </div>
                       
            <div className="relative flex mr-auto ml-20 mt-4">
                <Image src={gw} alt="gw" width={400} height={400} className="ml-3" placeholder='blur' />
                <Image src={hh} alt="hh" width={60} height={40} className="absolute top-6 left-1/2 transform -translate-x-1/2" placeholder='blur' />

                <p className="text-black absolute top-20 left-1/2 transform text-xl font-medium mt-2 -translate-x-1/2 ">User</p>
                <p className="text-black absolute top-28 left-1/2 transform -translate-x-1/2 ">asianboys@gmail.com</p>
                <a href ="#" className="text-white bg-gray-700 px-4 hover:text-green-500  absolute top-36 left-1/2  font-semibold text-xl -translate-x-1/2 ">Settings</a>

                <Image src={kalender} alt="kalender" width={35} height={50} className="absolute top-60 left-12 transform -translate-x-1/2" placeholder='blur' />
                <Image src={height} alt="height" width={35} height={50} className="absolute top-72 left-12 transform -translate-x-1/2" placeholder='blur' />
                <Image src={berat} alt="berat" width={35} height={50} className="absolute top-80 mt-7 left-12 transform -translate-x-1/2" placeholder='blur' />

                <p className="text-gray-500 absolute top-56 mt-3 left-24 transform font-semibold -translate-x-1/2 ">Usia</p>
                <p className="text-gray-500 absolute top-72 left-32 font-semibold transform -translate-x-1/2 ">Tinggi Badan</p>
                <p className="text-gray-500 absolute top-80 mt-7 left-32 font-semibold transform -translate-x-1/2 ">Berat Badan</p>
                <p className="text-gray-500 absolute top-56 -mr-80 mt-3 left-72 text-3xl transform font-semibold -translate-x-1/2 ">-</p>
                <p className="text-gray-500 absolute top-72 -mr-80 left-72 text-3xl font-semibold transform -translate-x-1/2 ">-</p>
                <p className="text-gray-500 absolute top-80 -mr-80 mt-5 left-72 text-3xl font-semibold transform -translate-x-1/2 ">-</p>

            </div>

            <div className="ml-28 mt-5 py-2 "> 
                            <a href="#" className="text-white hover:text-black font-semibold bg-red-500 py-3 rounded-lg px-16">Logout</a>
                        </div>

        </div> 
    );
}
