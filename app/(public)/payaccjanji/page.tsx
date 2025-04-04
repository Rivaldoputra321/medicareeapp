import Head from "next/head";
import Image from 'next/image'; 
import klm from '../public/klm.png';
import gr from '../public/gr.png';
import jmp from '../public/jmp.png';
import er from '../public/er.png';
import polmk from '../public/polmk.jpg';
import kol from '../public/kol.jpg';
import lpokm from '../public/lpokm.jpg';

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
                        src={kol} 
                        alt="kol.jpg"
                        layout="responsive" 
                         className="w-full h-auto shadow-lg" 
                        width={600} 
                        height={600} 
                    />

<div className=" absolute mt-24 py-12 px-64 left-60 font-semibold text-center z-20">
    <Image 
        src={lpokm} 
        alt="lpokm.jpg"
        layout="responsive" 
        className="w-full h-auto shadow-lg" 
        width={400} 
        height={600} 
    />
</div>

    
    
                    <div className="absolute mt-8 font-sans top-0 left-0 right-0 text-center">
                        <p className="font-bold text-3xl text-black">Antrean Pasien Konsultasi</p>
                    </div>
                    <div className="absolute mt-20 py-9 left-8 font-sans text-center">
                        <p className="font-sans text-2xl text-gray-600">Reza</p>
                    </div>
                    <div className="absolute mt-20 py-9 left-52 font-semibold text-center">
                        <p className="font-sans text-xl bg-green-400 shadow-lg text-gray-600">DIKONFIRM</p>
                    </div>

                    <div className="absolute mt-12 py-16 px-64 left-52  font-semibold text-center">
                        <p className="font-sans text-2xl shadow-lg text-gray-600">Antrean 2</p>
                    </div>
                    <div className="absolute mt-28 py-10 left-8 font-sans text-center">
                        <p className="font-sans mr-52 text-xl text-gray-500">Waktu Konsultasi</p>
                        <p className="font-sans ml-20 -mt-7 text-xl text-gray-400">09:30</p>
                    </div>
                    <div className="absolute mt-56 py-16 -right-10 mr-16 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 28.000</p>
                    </div>
                    <div className="absolute mt-64 py-28 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 2.000</p>
                    </div>
                   
                    <div className="absolute mt-40 top-2 py-14 left-8 font-sans text-center">
                        <p className="font-bold text-3xl text-gray-500">Rincian Janji Periksa</p>
                    </div>
                    <div className="absolute mt-52 py-20 left-8 font-sans text-center">
                        <p className="font-medium text-2xl text-gray-400">Biaya Sesi 30 Menit</p>
                    </div>
                    <div className="absolute mt-60 -top-1 py-32 left-8 font-sans text-center">
                        <p className="font-medium text-2xl text-gray-400">Biaya Layanan</p>
                    </div>
                </div>

                <div className="absolute mt-64 py-72 -top-7 mr-80 font-sans text-center">
                    <p className="font-bold text-xl -mr-60 text-gray-500">Segera Ke Rumah Sakit 
                    Untuk Menunggu Antrean </p>
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
