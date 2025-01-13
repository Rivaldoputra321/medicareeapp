import Head from "next/head";
import Image from 'next/image'; 
import klm from '../public/klm.png';
import gr from '../public/gr.png';
import jmp from '../public/jmp.png';

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

            <div className="relative flex flex-col items-center max-w-full mx-0 mt-14">
                <div className="relative flex justify-center mx-0 mt-16">
                    <Image 
                        src={klm} 
                        alt="Konsultasi Online"
                        layout="responsive" 
                        className="w-full h-auto shadow-lg" 
                        width={500} 
                        height={300} 
                    />
                    <div className="absolute mt-12 font-sans top-0 left-0 right-0 text-center">
                        <p className="font-semibold -mb-4 text-2xl text-gray-800">
                            Konsultasi Online untuk dr. Feronika RS Bhakti Medicare
                            <br />   Waktu 30 Menit
                        </p>
                    </div>
                    <div className="absolute mt-44 py-8 left-8 font-sans text-center">
                        <p className="font-bold text-2xl text-gray-600">Rincian Konsultasi Online</p>
                    </div>
                    <div className="absolute mt-56 py-10 left-8 font-sans text-center">
                        <p className="font-bold text-xl text-gray-400">Biaya Sesi 30 Menit</p>
                    </div>
                    <div className="absolute mt-56 py-10 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 28.000</p>
                    </div>

                    <div className="absolute mt-64 py-12 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">Rp. 2.000</p>
                    </div>

                    <div className="absolute mt-72 py-14 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-gray-400">-Rp. 5.500</p>
                    </div>

                    <div className="absolute mt-80 py-16 right-0 mr-8 font-sans text-right">
                        <p className="font-bold text-xl text-black"> Rp. 24.500</p>
                    </div>

                    <div className="absolute mt-64 py-12 left-8 font-sans text-center">
                        <p className="font-bold text-xl text-gray-400">Biaya Layanan</p>

                    </div>
                    <div className="absolute mt-72 py-14 left-8 font-sans text-center">
                        <p className="font-bold text-xl text-gray-400">Kupon (MEDICAREDISKON)</p>
                    </div>
                    <div className="absolute mt-80 py-16 left-8 font-sans text-center">
                        <p className="font-bold text-xl text-black">Biaya Konsultasi</p>
                    </div>
                    <div className="absolute mt-80 py-32 font-sans left-8 text-left">
                        <p className="font-bold text-xl text-gray-400">Setelah Melakukan Pembayaran Harap Menunggu</p>
                    </div>
                    <div className="absolute mt-80 py-40 font-sans left-8 text-left">
                        <p className="font-bold text-xl text-gray-400">Dokter Hingga Status Di Konfirmasi</p>
                    </div>
                </div>
                <div className="absolute mt-80 py-72 font-sans text-center">
                    <a href="#" className="font-bold text-xl text-white">Lanjutkan Pembayaran</a>
                </div>
            </div>

            <div className="relative flex justify-center mx-0 mt-12">
                <Image 
                    src={jmp} 
                    alt="jmp.png" 
                    layout="responsive" 
                    width={500} 
                    height={300} 
                />
            </div>
        </div>
    );
}
