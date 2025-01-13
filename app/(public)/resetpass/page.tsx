import Head from "next/head";
import { FaGoogle, 
  FaRegEnvelope } 
  from 'react-icons/fa';
  import {MdLockOutline} from 'react-icons/md';

export default function Home() {
  return(
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
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
           <div className="py-10">
            <h2 className="text-3xl font-bold text-green-500 mb-2">
              Reset password
              </h2>
            <div className="border-2 w-10 border-green-500 inline-block mb-2"></div>
            <div className="flex justify-items-center my-2">
            </div>{/* Social login section */}
            <p className="text-gray-400 my-3">reset your new password</p>
            <div className="flex flex-col items-center">

              <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                <MdLockOutline className="text-gray-400 m-2" />
                <input type="password" name="password" placeholder="New password" className="bg-gray-100 outline-none text-sm
                flex-1" />
                </div>

                 <div className="bg-gray-100 w-64 p-2 flex items-center mb-3">
                <MdLockOutline className="text-gray-400 m-2" />
                <input type="password" name="password" placeholder="Confirm password" className="bg-gray-100 outline-none text-sm
                flex-1" />
                </div>
              <a 
           href="#" className="border-2 border-green-500 text-green-500 rounded-full px-12 py-2 inline-block font-semibold hover:bg-green-500
           hover:text-white"
        >
          Confirm
          </a>
            </div>
           </div>
        </div>
        {/* Sign in section */}
        <div className="w-2/5 bg-green-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
        <h2 className="text-3xl font-bold mb-2">Welcome</h2>
        <div className="border-2 w-10 border-white inline-block"></div>
        <p className="mb-10">Konsultasi, Buat janji, dan kunjungi rumah sakit sekarang tersedia di MediCare!
          </p> 
        <a 
           href="#" className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white
           hover:text-green-500 mb-3"
        >
          Sign in
          </a>

          <a 
           href="#" className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white
           hover:text-green-500"
        >
          Sign up
          </a>
        </div>
        {/* Sign up section */}
       </div>
        
      </main>
    </div>
  )
}