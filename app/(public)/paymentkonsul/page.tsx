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
import lopi2 from '../public/lopi2.png'; 
import bru from '../public/bru.png';
import w from '../public/w.jpg';
import cw from '../public/cw.png';
import koper from '../public/koper.png';
import co from '../public/co.png';
import huhy from '../public/huhy.png';
import ui from '../public/ui.png';
import ty from '../public/ty.png';
import pok from '../public/pok.png';
import ppay from '../public/ppay.png';
import byr from '../public/byr.jpg';
import op from '../public/op.png';
import om from '../public/om.png';
import dd from '../public/dd.png'

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

            <div className="relative flex justify-start max-w-full mx-0 mt-14">
                <a href="#" className="absolute mt-6 left-4 bg-green-600 text-white py-1 px-3 rounded-lg shadow hover:bg-green-500">
                    Back
                </a>

                <p className="absolute mt-6 ml-20 text-black py-1 px-5 rounded-lg shadow">
                    Ringkasan Pembayaran
                </p>
            </div>

            <div className="flex justify-start mx-0 mt-4">
                <Image 
                    src={w} 
                    alt="w.jpg" 
                    layout="responsive" 
                    placeholder='blur'
                    height={1000}
                    width={1000}
                />
            </div>

            <div className="max-w-32xl -mt-12 mx-auto mb-3 relative">
                <Image 
                    src={op} 
                    alt="op.png" 
                    layout="responsive" 
                    className="w-full  h-auto shadow-lg" 
                    placeholder='blur'
                />
            </div>
            
            <div className="mr-auto -mt-40 mb-14 ml-6 py-3 relative flex items-center">
                <Image 
                    src={cw} 
                    alt="cw.png" 
                    layout="fixed" 
                    width={110} 
                    height={100} 
                    placeholder='blur'
                />
                <a href="#" className="ml-4 -mt-20 mb-6 hover:text-green-500 text-black text-lg">Dr Feronika</a>
            </div>

            <div className="mr-auto -mt-44 ml-44 py-4 relative flex items-center">
                <a href="#" className="hover:text-green-500 -ml-7 font-bold text-xs text-gray-500">Dokter Umum</a>
            </div>

            <div className="max-w-32xl mt-20 mx-auto relative">
                <Image 
                    src={op} 
                    alt="lopi2.png" 
                    layout="responsive" 
                    className="w-full h-auto" 
                    placeholder='blur'
                />
            </div>

            <div className="flex justify-between -mt-40 ml-4 py-8 relative">
                <p className="font text-xl text-gray-500">Biaya Sesi 30 Menit</p>
                <p className="text-xl mr-9 text-gray-500">Rp. 28.000</p>
            </div>

            <div className="mr-auto ml-36 py-2 -mt-2 mb-7 relative flex items-center">
                <span className="ml-1 text-black text-lg">Rp. 120.000</span>
            </div>

            <div className="max-w-32xl -mt-20 mb-11 mx-auto relative">
                <Image 
                    src={op} 
                    alt="lopi2.png" 
                    layout="responsive" 
                    className="w-full  h-auto shadow-lg" 
                    placeholder='blur'
                />
            </div>

            <div className="flex justify-between -mt-60 ml-12 py-8 relative">
                <p className="-ml-8 text-xl mt-2 text-gray-500">Biaya Layanan</p>
                <p className="text-xl mt-2 mr-9 text-gray-500">Rp. 2.000</p> 
            </div>

            <div className="flex justify-between -mt-12 ml-4 py-8 relative">
                <p className="ml-1 text-gray-500 text-xl">Kupon (MEDICAREDISKON)</p>
                <p className="text-gray-500 mr-9 text-xl">-Rp. 5.500</p> 
            </div>

            <div className="flex justify-between -mt-2 ml-4 py-8 relative">
                <p className="font-extrabold text-2xl -mt-6 text-black">Pembayaranmu</p>
                <p className="text-black font-semibold text-2xl -mt-6 mr-9">Rp. 24.500</p> 
            </div>


            <div className="max-w-32xl mt-12 mx-auto relative">
                <Image 
                    src={op} 
                    alt="op.png" 
                    layout="responsive" 
                    className="w-full h-auto shadow-lg" 
                    placeholder='blur'
                />
            </div>
            <div className="max-w-32xl -mt-28 -left-72 ml-80 mx-auto relative">
    <div className="relative">
        <Image 
            src={om} 
            alt="om.png" 
            layout="responsive" 
            className="w-full h-auto" 
            placeholder='blur'
        />
        <a href="#" className="absolute bottom -mt-16 left-16 text-red-600 font-sans text-xs px-2 py-8 rounded">sambungkan gopay sebagai metode pembayaran</a>
        <p className="absolute bottom -mt-24 left-40 text-black font-sans text-xl px-2 py-3 rounded">gopay</p>
        <p className="absolute bottom -mt-32 left-5 text-black font-black text-2xl px-2 py-1 rounded">Metode Pembayaran</p>
    </div>
</div>
             
             

<div className="ml-96 -mt-9 px-24 relative"> 
    <a href="#" className="text-white font-sans -top-5 ml-96 px-7 left-2 text-xl relative">Bayar&</a>
    <a href="#" className="text-white font-sans left-1 -ml-32 mt-6 top-1 px-8 text-xl relative">Konfimasi</a>



    <div className="-mt-12 top-2 ml-96 left-7 -mx-3 "> 
        <Image 
            src={dd} 
            alt="dd.png" 
            layout="relative" 
            width={170} 
            height={120} 
            placeholder='blur'
        />
</div>
</div>



        </div>
    );
}
