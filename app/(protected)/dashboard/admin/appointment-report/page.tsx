'use client';

import { useState, useEffect } from 'react';
import { Layout, Row, Col, Table, Select, Card, Statistic } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import AdminLayout from '../../../../component/adminComponent/admin.layout.component';
import { getAdminAppointmentReport, AppointmentStatus } from '@/utils/appointment';
import type { Appointment } from '@/utils/appointment';

const { Content } = Layout;

const AdminAppointmentReport = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAdminAppointmentReport(
        selectedStatuses,
        pagination.current,
        pagination.pageSize
      );
      
      setAppointments(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total
      }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [pagination.current, pagination.pageSize, selectedStatuses]);

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };

  // Calculate statistics
  const getStatusCount = (status: AppointmentStatus) => {
    return appointments.filter(app => app.status === status).length;
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
      key: "patientName"
    },
    {
      title: "Doctor Name",
      dataIndex: ["doctor", "user", "name"],
      key: "doctorName"
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      key: "schedule",
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: AppointmentStatus) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
          status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status.replace('_', ' ')}
        </span>
      )
    },
    {
      title: "Diagnosis",
      dataIndex: "diagnosis",
      key: "diagnosis",
      render: (diagnosis: string) => diagnosis || '-'
    },
    {
      title: "Notes",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || '-'
    }
  ];

  return (
    <AdminLayout>
      <Content className="p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Appointment Report</h2>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Pending Appointments"
                    value={getStatusCount(AppointmentStatus.PENDING)}
                    prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Completed Appointments"
                    value={getStatusCount(AppointmentStatus.COMPLETED)}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Cancelled Appointments"
                    value={getStatusCount(AppointmentStatus.CANCELLED)}
                    prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={16} className="items-center">
              <Col span={12}>
                <Select
                  mode="multiple"
                  placeholder="Filter by status"
                  value={selectedStatuses}
                  onChange={setSelectedStatuses}
                  className="w-full"
                >
                  {Object.values(AppointmentStatus).map(status => (
                    <Select.Option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </Select.Option>
                  ))}
                </Select>
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
            dataSource={appointments}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} appointments`,
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

export default AdminAppointmentReport;