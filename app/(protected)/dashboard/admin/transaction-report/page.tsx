'use client';

import { useState, useEffect } from 'react';
import { Layout, Row, Col, Table, Input, DatePicker, Select, Card, Statistic } from 'antd';
import { SearchOutlined, DollarOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import AdminLayout from '../../../../component/adminComponent/admin.layout.component';
import { getAdminTransactionList, AppointmentStatus, Transaction } from '@/utils/appointment';
import type { Appointment } from '@/utils/appointment';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const AdminTransactionPage = () => {
  const [transactions, setTransactions] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    adminTotal: 0,
    doctorTotal: 0
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getAdminTransactionList(
        pagination.current,
        pagination.pageSize,
        searchQuery,
        dateRange[0] || undefined,
        dateRange[1] || undefined
      );
      
      setTransactions(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total
      }));
      setMonthlyTotals({
        adminTotal: response.monthlyAdminTotal || 0,
        doctorTotal: response.monthlyDoctorTotal || 0
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [pagination.current, pagination.pageSize, searchQuery, dateRange]);

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, 300);

  const formatStatus = (status: AppointmentStatus | undefined) => {
    if (!status) return '';
    return status.toString().split('_').join(' ');
  };
  
  const getStatusStyle = (status: AppointmentStatus | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case AppointmentStatus.PAID:
        return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRupiah = (amount: number | string | undefined) => {
    if (!amount) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatAmount = (amount: number | string | undefined) => {
    if (!amount) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '-' : `$${numAmount.toFixed(2)}`;
  };

 const columns = [
    {
      title: "No",
      key: "no",
      width: 80,
      render: (_: any, __: any, index: number) => (
        (pagination.current - 1) * pagination.pageSize + index + 1
      )
    },
    {
      title: "Patient Name",
      dataIndex: ["patient", "user", "name"],
      key: "patientName",
      render: (name: string | undefined) => name || '-'
    },
    {
      title: "Doctor Name",
      dataIndex: ["doctor", "user", "name"],
      key: "doctorName",
      render: (name: string | undefined) => name || '-'
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      key: "schedule",
      render: (date: string) => date ? new Date(date).toLocaleDateString('id-ID') : '-'
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: AppointmentStatus) => (
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(status)}`}>
          {formatStatus(status)}
        </span>
      )
    },
    {
      title: "Total Amount",
      dataIndex: ["transaction", "amount"],
      key: "amount",
      render: (amount: number | string | undefined) => formatRupiah(amount)
    },
    {
      title: "Doctor Fee",
      dataIndex: ["transaction", "doctorFee"],
      key: "doctorFee",
      render: (doctorFee: number | string | undefined) => formatRupiah(doctorFee)
    },
    {
      title: "Admin Fee",
      dataIndex: ["transaction", "adminFee"],
      key: "adminFee",
      render: (adminFee: number | string | undefined) => formatRupiah(adminFee)
    },
    {
      title: "Payment Status",
      dataIndex: ["transaction", "status"],
      key: "paymentStatus",
      render: (status: string | undefined) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'CAPTURE' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status || '-'}
        </span>
      )
    }
  ];

  return (
    <AdminLayout>
      <Content className="p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Transaction List</h2>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Monthly Admin Revenue"
                    value={monthlyTotals.adminTotal}
                    prefix={<DollarOutlined />}
                    precision={0}
                    formatter={(value) => formatRupiah(value)}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={16} className="items-center">
              <Col span={8}>
                <Input
                  placeholder="Search transaction..."
                  prefix={<SearchOutlined />}
                  onChange={e => debouncedSearch(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={8}>
                <RangePicker
                  onChange={(dates) => {
                    setDateRange(dates ? [dates[0]?.toDate() || null, dates[1]?.toDate() || null] : [null, null]);
                  }}
                  className="w-full"
                />
              </Col>
              <Col span={4}>
                <Select
                  value={pagination.pageSize}
                  onChange={(value) => setPagination(prev => ({ ...prev, pageSize: value, current: 1 }))}
                  className="w-full"
                >
                  <Select.Option value={5}>5 Data</Select.Option>
                  <Select.Option value={10}>10 Data</Select.Option>
                  <Select.Option value={20}>20 Data</Select.Option>
                  <Select.Option value={50}>50 Data</Select.Option>
                </Select>
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} transactions`,
              className: "text-emerald-600 flex justify-center",
              position: ['bottomCenter']
            }}
            onChange={handleTableChange}
            loading={loading}
            className="shadow-sm"
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>
      </Content>
    </AdminLayout>
  );
};

export default AdminTransactionPage;