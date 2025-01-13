import Head from "next/head";
import Image from 'next/image'; 
import user from '../public/user.jpg';
import hh from '../public/hh.png';
import dokterumum from '../public/dokterumum.png';
import doktergigi from '../public/doktergigi.png';
import bedah from '../public/bedah.png';
import tht from '../public/tht.png';
import paru from '../public/paru.png';
import jantung from '../public/jantung.png';


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

           
            <div className="max-w-7xl mx-auto px-4 mt-24">
                <input 
                    type="text" 
                    placeholder="Cari dokter, spesialis atau gejala"
                    className="border text-black border-gray-300 rounded-lg p-3 w-200 max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="flex flex-col items-start justify-start mt-6 ml-28 text-3xl">
                <p className="text-left font-normal text-gray-400">
                    Cari Dokter atau Spesialisasi
                </p>
            </div>

            <div className="flex flex-col items-start justify-start mt-1 ml-28 text-xl">
                <p className="text-left font-serif text-gray-400">
                    Pilih kategori yang tersedia sesuai kondisimu
                </p>
            </div>

            <div className="relative flex mr-auto ml-80 mt-4">

            <a href="#" className="text-gray-500 absolute top-28 hover:text-green-500 -right-80 -mr-80 transform text-xl font-light mt-2 -translate-x-1/2">Spesialis Jantung</a>

            </div>
                        
            <div className="relative flex mr-auto ml-40 mt-6">

                <a href="#" className="text-gray-500 absolute top-20 hover:text-green-500 -left-3 transform text-xl font-medium mt-4 -translate-x-1/2">Dokter Umum</a>
                
                <a href="#" className="text-gray-500 absolute top-20 hover:text-green-500 -right-48 transform text-xl font-light mt-4 -translate-x-1/2">Dokter Gigi</a>

                <a href="#" className="text-gray-500 absolute top-20 hover:text-green-500 -right-80 -mr-6 transform text-xl font-light mt-4 -translate-x-1/2">Spesialis THT</a>

                <a href="#" className="text-gray-500 absolute top-20 hover:text-green-500 -right-80 -mr-44 transform text-xl font-light mt-4 -translate-x-1/2">Spesialis Bedah</a>

                <a href="#" className="text-gray-500 absolute top-20 hover:text-green-500 -right-80 -mr-80 transform text-xl font-light mt-4 -translate-x-1/2">Kesehatan Paru</a>
                
                </div>
                


            <div className="ml-28 mt-36 py-9">
            <Image src={dokterumum} alt="dokterumum.png" width={100} height={200} className="absolute ml-9 -mt-44 transform -translate-x-1/2" placeholder='blur' />
            </div>

            
            <div className="ml-52 -mt-16 py-7">
            <Image src={doktergigi} alt="doktergigi.png" width={100} height={200} className="absolute ml-11 -mt-44 transform -translate-x-1/2" placeholder='blur' />
            </div>

            <div className="ml-56 -mt-16 py-6 -inset-1 -px-3">
            <Image src={tht} alt="tht.png" width={90} height={200} className="absolute ml-40 -mt-40 transform -translate-x-1/2" placeholder='blur' />
            </div>

            
            <div className="ml-80 -mt-16 py-8 -inset-1 px-10">
            <Image src={bedah} alt="bedah.png" width={100} height={200} className="absolute ml-40 -mt-40 transform -translate-x-1/2" placeholder='blur' />
            </div>

            <div className="ml-80 -mt-16 py-9 -inset-1 px-48">
            <Image src={paru} alt="paru.png" width={90} height={200} className="absolute ml-40 -mt-40 transform -translate-x-1/2" placeholder='blur' />
            </div>

            
            <div className="ml-80 -mt-16 py-6 -inset-1 px-80">
            <Image src={jantung} alt="jantung.png" width={100} height={200} className="absolute ml-44 -mt-40 transform -translate-x-1/2" placeholder='blur' />
            </div>
             
        </div> 
        
    );
}
