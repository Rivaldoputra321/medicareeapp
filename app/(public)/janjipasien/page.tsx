'use client'; 

import Head from "next/head";
import { Table } from "antd";
import Link from "next/link"; 


const DetailButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/detail/${id}`} className="text-blue-600 hover:underline">
      Lihat Detail
    </Link>
  );
};

export default function Home() {
  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Nama Pasien",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Poli",
      dataIndex: "poli",
      key: "poli",
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
    },
    {
      title: "Detail",
      key: "detail",
      render: (_, record) => (
        <DetailButton id={record.key} /> 
      ),
    },
  ];

  const data = [
    {
      key: "1",
      no: "001",
      nama: "Reza",
      status: "DIPESAN",
      poli: "Dokter Umum",
      tanggal: "2024-11-01",
    },
    {
      key: "2",
      no: "002",
      nama: "Wati",
      status: "DIPESAN",
      poli: "Dokter Umum",
      tanggal: "2024-11-02",
    },
    {
      key: "3",
      no: "003",
      nama: "Budi",
      status: "SELESAI",
      poli: "Dokter Umum",
      tanggal: "2024-11-03",
    },
    {
      key: "4",
      no: "004",
      nama: "Siti",
      status: "DIPESAN",
      poli: "Dokter Umum",
      tanggal: "2024-11-04",
    },
    {
      key: "5",
      no: "005",
      nama: "Andi",
      status: "SELESAI",
      poli: "Dokter Umum",
      tanggal: "2024-11-05",
    },
    {
      key: "6",
      no: "006",
      nama: "Tina",
      status: "DIPESAN",
      poli: "Dokter Umum",
      tanggal: "2024-11-06",
    },
    {
      key: "7",
      no: "007",
      nama: "Ahmad",
      status: "DIPESAN",
      poli: "Dokter Umum",
      tanggal: "2024-11-07",
    },
    {
      key: "8",
      no: "008",
      nama: "Dewi",
      status: "SELESAI",
      poli: "Dokter Umum",
      tanggal: "2024-11-08",
    },
  ];

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
              <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">
                Beranda
              </a>
              <a href="#" className="text-gray-700 hover:text-green-500 font-semibold">
                Riwayat
              </a>
            </div>
          </div>
          <div className="ml-auto">
            <a href="#" className="text-white hover:text-black font-semibold bg-green-600 py-3 rounded-lg px-5">
              Login
            </a>
          </div>
        </div>
      </nav>

      <div className="relative flex justify-start max-w-full mx-0 mt-14">
        <a href="#" className="absolute mt-6 left-4 bg-green-600 text-white py-1 px-3 rounded-lg shadow hover:bg-green-500">
          Back
        </a>

        <p className="absolute mt-6 ml-20 text-black py-1 px-5 rounded-lg shadow">Pasien Umum</p>
      </div>

      <div className="mt-20 mx-4">
        <h2 className="text-2xl text-black font-sans mb-4">Data Janji Temu</h2>
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ y: 400 }}
          pagination={false}
          rowClassName="ant-table-row"
          sticky
        />
      </div>
    </div>
  );
}
