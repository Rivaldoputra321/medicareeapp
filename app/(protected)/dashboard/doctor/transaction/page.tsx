"use client"

import React, { useEffect, useState } from 'react';
import { Card, Table, DatePicker, Input, message } from 'antd';
import moment from 'moment';
import DoctorLayout from '@/app/component/doctorComponent/doctor.layout';
import { 
  Appointment,
  getDoctorTransactionList,
} from '@/utils/appointment';

const { RangePicker } = DatePicker;
const { Search } = Input;

const DoctorTransactionReport = () => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null]>([null, null]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const pageSize = 10;

  const loadTransactions = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await getDoctorTransactionList(
        currentPage,
        pageSize,
        search,
        dateRange[0]?.toDate(),
        dateRange[1]?.toDate()
      );

      setData(response.data);
      setTotal(response.meta.total);
      setMonthlyTotal(response.monthlyDoctorTotal || 0);
    } catch (error) {
      message.error('Failed to load transactions');
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatToRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    loadTransactions(page);
  }, [page, search, dateRange]);

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: ['patient', 'user', 'name'],
      key: 'patientName',
      render: (_: any, record: Appointment) => (
        <div>
          <span className="font-medium text-gray-900">{record.patient?.user.name}</span>
        </div>
      ),
    },
    {
      title: 'Consultation Date',
      dataIndex: 'completed_at',
      key: 'date',
      render: (date: string) => (
        <span className="text-gray-600">
          {moment(date).format('DD MMM YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: ['transaction', 'amount'],
      key: 'amount',
      render: (amount: number) => (
        <span className="font-medium">
          {formatToRupiah(amount || 0)}
        </span>
      ),
    },
    {
      title: 'Doctor Fee',
      dataIndex: ['transaction', 'doctorFee'],
      key: 'doctorFee',
      render: (fee: number) => (
        <span className="font-medium text-green-600">
          {formatToRupiah(fee || 0)}
        </span>
      ),
    }
  ];

  return (
    <DoctorLayout>
      <div className="p-6">
        <Card className="shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Transaction Report
            </h2>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Search
                  placeholder="Search patient name..."
                  allowClear
                  onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                  style={{ width: 250 }}
                />
                <RangePicker
                  onChange={(dates) => {
                    setDateRange([
                      dates?.[0] ? moment(dates[0].valueOf()) : null,
                      dates?.[1] ? moment(dates[1].valueOf()) : null
                    ]);
                    setPage(1);
                  }}
                />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Monthly Earnings</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatToRupiah(monthlyTotal)}
                </p>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              total,
              pageSize,
              current: page,
              onChange: (newPage) => setPage(newPage),
              showSizeChanger: false,
            }}
            className="border border-gray-200 rounded-lg"
          />
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorTransactionReport;