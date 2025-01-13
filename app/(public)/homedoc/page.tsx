import Head from "next/head";
import Image from 'next/image';
import doc from '../public/doc.png';
import konsul from '../public/konsul.png';
import janji from '../public/janji.png';
import k0 from '../public/k0.png';
import k1 from '../public/k1.png';

export default function Home() {
    return (
        <div className="relative flex flex-col min-h-screen py-2 bg-white">
            <Head>
                <title>Halaman Utama</title>
                <meta name="description" content="Selamat datang di MediCare!" />
            </Head>

            <nav className="bg-white shadow fixed py-3 top-0 left-0 right-0 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center py-3">
                        <span className="text-green-500 text-2xl font-bold">Medi</span>
                        <span className="text-black text-2xl font-bold">Care</span>
                        <div className="flex space-x-4 ml-6">
                            <a href="#" className="text-green-600 hover:text-green-500 font-semibold">Beranda</a>
                            <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">Riwayat</a>
                        </div>
                        <div className="ml-auto"> 
                            <a href="#" className="text-white hover:text-black font-semibold bg-green-600 py-3 rounded-lg px-5">Login</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div className="flex flex-col items-start justify-start flex-grow mt-32 ml-32"> 
                <h1 className="text-2xl font-semibold mb-3 text-black">Solusi Kesehatan</h1>
                <p className="text-left text-2xl font-semibold text-black">
                    Konsultasi, Buat janji dan kunjungi rumah sakit
                </p>
                <p className="text-left text-2xl font-semibold text-black">
                    Tersedia di MediCare!
                </p>
            </div>

            <div className="flex flex-col items-center">
                <div className="fixed bottom-0 right-0"> 
                    <Image src={doc} alt="doc" width={300} height={400} placeholder='blur' />
                </div>

                <div className="fixed top-48 left-5 mt-20 ml-32 "> 

                <Image src={k0} alt="k0.png" width={100} height={500} placeholder='blur' />
              
               </div>

               <div className="fixed text-center top-48 left-40 mt-40">
    <a href="#" className="text-gray-800 hover:text-green-500 font-extrabold">
                        
                        Konsultasi
                        
                                <br/> Pasien
                        </a>
</div>



                <div className="fixed top-48 left-0 right-6 mt-20 ml-72"> 
                    <Image src={k1} alt="k1.png" width={100} height={500} placeholder='blur' />
                </div>

                <div className="fixed top-48 left-0 right-9 mt-40 ml-72">
    <a href="#" className="text-gray-800 hover:text-green-500 font-bold">Jadwal Janji RS</a>
</div>


            </div>
        </div>
    );
}
