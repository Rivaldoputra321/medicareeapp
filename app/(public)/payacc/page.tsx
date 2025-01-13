import Head from "next/head";
import Image from 'next/image'; 
import klm from '../public/klm.png';
import gr from '../public/gr.png';
import jmp from '../public/jmp.png';
import er from '../public/er.png';
import polmk from '../public/polmk.jpg';

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
                        <span className="text-green-500 text-2xl font-bold">Medi</span>
                        <span className="text-black text-2xl font-bold">Care</span>
                        <div className="flex space-x-4 ml-6">
                            <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">Beranda</a>
                            <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">Riwayat</a>
                        </div>
                    </div>
                    <div className="ml-auto"> 
                        <a href="#" className="text-white hover:text-black font-semibold bg-green-600 py-3 rounded-lg px-5">Login</a>
                    </div>
                </div>
            </nav> 

            <div className="relative flex flex-col items-center mt-14">
                <div className="relative flex justify-center -mx-10 mt-16">
                    <Image 
                        src={polmk} 
                        alt="polmk.jpg"
                        layout="responsive" 
                         className="w-full h-auto shadow-lg" 
                        width={400} 
                        height={600} 
                    />
                    <div className="absolute mt-8 font-sans top-0 left-0 right-0 text-center">
                        <p className="font-bold text-3xl text-black">Antrean Pasien Konsultasi</p>
                    </div>
                    <div className="absolute mt-20 py-9 left-8 font-sans text-center">
                        <p className="font-sans text-2xl text-gray-600">Reza</p>
                    </div>
                    <div className="absolute mt-20 py-9 left-52 font-semibold text-center">
                        <p className="font-sans text-xl bg-green-400 shadow-lg text-gray-600">DIKONFIRM</p>
                    </div>
                    <div className="absolute mt-28 py-10 left-8 font-sans text-center">
                        <p className="font-sans mr-52 text-xl text-gray-500">Waktu Konsultasi</p>
                        <p className="font-sans ml-20 -mt-7 text-xl text-gray-400">30 Menit</p>
                    </div>
                    <div className="absolute mt-56 py-12 -right-10 mr-16 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 28.000</p>
                    </div>
                    <div className="absolute mt-64 py-16 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 2.000</p>
                    </div>
                    <div className="absolute mt-72 py-20 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">-Rp. 5.500</p>
                    </div>
                    <div className="absolute mt-80 py-24 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 24.500</p>
                    </div>
                    <div className="absolute mt-40 top-2 py-14 left-8 font-sans text-center">
                        <p className="font-bold text-3xl text-black">Rincian Konsultasi Online</p>
                    </div>
                    <div className="absolute mt-52 py-16 left-8 font-sans text-center">
                        <p className="font-medium text-2xl text-gray-400">Biaya Sesi 30 Menit</p>
                    </div>
                    <div className="absolute mt-56 -top-1 py-24 left-8 font-sans text-center">
                        <p className="font-medium text-2xl text-gray-400">Biaya Layanan</p>
                    </div>
                    <div className="absolute -top-2 mt-56 py-36 font-sans left-8 text-left">
                        <p className="font-medium text-2xl text-gray-400">Kupon (MEDICAREDISKON)</p>
                    </div>
                    <div className="absolute mt-64 py-40 -top-3 font-sans left-8 text-left">
                        <p className="font-medium text-2xl text-gray-400">Biaya Konsultasi</p>
                    </div>
                </div>

                <div className="absolute mt-64 py-72 -top-7 mr-80 font-sans text-center">
                    <p className="font-bold text-xl mr-12 text-black">Link Google Meet</p>
                    <input 
                        type="text" 
                        placeholder="Link Google Meet"
                        className="mt-1 py-2 border mr-12 border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>

            <div className="relative flex justify-center mx-0 mt-12">
                <Image 
                    src={jmp} 
                    alt="jmp.png" 
                    layout="responsive" 
                    className="w-full h-auto shadow-lg" 
                    width={500} 
                    height={300} 
                />
            </div>
        </div>
    );
}
