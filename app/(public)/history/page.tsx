import Head from "next/head";
import Image from 'next/image'; 
import styles from "../styles/styles.module.css"; 
import plus from '../public/plus.png';


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
                            <a href="#" className="text-green-500 hover:text-green-500 font-semibold">Riwayat</a>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <a href="#" className="text-white hover:text-black font-semibold bg-green-600 py-3 rounded-lg px-5">Login</a>
                    </div>
                </div>
            </nav>
            
        
            <div className="flex justify-center mt-24 ml-200"> 
                <div className={styles["filter-container"]}>
                    <input
                        type="text"
                        placeholder="Filter"
                        className={styles["filter-input"]}
                    />
                    <button className={styles["filter-button"]}>
                        Filter
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-start justify-start flex-grow -mt-2 ml-20 text-xl"> 
                <h1 className="font-thin text-gray-500">Riwayat</h1>
            </div>
            
            <div className="flex justify-center -mt-80"> 
    <Image src={plus} alt="plus" width={100} height={500} placeholder='blur' />
</div>

<div className="flex justify-center mt-2 mb-80">
    <p className="text-gray-400 font-normal">No order history, Do an action and check the status here</p>
</div>



        </div> 
    );
}
