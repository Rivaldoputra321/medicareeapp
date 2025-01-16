'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Menu, Button, Typography, Row, Col, Popconfirm, Table, Badge, Input, message, Select, Tabs } from 'antd';
import { UserAddOutlined, AppstoreAddOutlined, LogoutOutlined, DeleteOutlined, PlusCircleOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { deleteDoctor, restoreDoctor, fetchDoctors, fetchDoctorId, type Doctor, type DoctorResponse, fetchDeletedDoctors } from '@/utils/doctor';
import debounce from 'lodash/debounce';
import { fetchSpesialists, Spesialist } from '@/utils/spesialist';
import AdminLayout from '../../../../component/adminComponent/admin.layout.component';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

interface ActionButtonProps {
  id: string;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  isDeleted: boolean;
  loading?: boolean;
}

const ActionButton = ({ 
  id, 
  onDelete,
  onRestore,
  isDeleted,
  loading = false
}: ActionButtonProps) => {
  const handleAction = async () => {
    try {
      if (isDeleted) {
        await onRestore(id);
        message.success('Doctor restored successfully');
      } else {
        await onDelete(id);
        message.success('Doctor deleted successfully');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : `Failed to ${isDeleted ? 'restore' : 'delete'} doctor`);
    }
  };

  if (isDeleted) {
    return (
      <Button
        type="primary"
        icon={<UndoOutlined />}
        loading={loading}
        onClick={handleAction}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Restore
      </Button>
    );
  }

  return (
    <Popconfirm
      title="Are you sure you want to delete this doctor?"
      onConfirm={handleAction}
      okText="Yes"
      cancelText="No"
    >
      <Button 
        danger 
        icon={<DeleteOutlined />}
        loading={loading}
        className="hover:bg-red-100 transition-colors"
      />
    </Popconfirm>
  );
};

const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center p-8">
    <div className="text-red-500 text-lg mb-4">{error}</div>
    <Button 
      onClick={onRetry}
      type="primary"
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      Retry
    </Button>
  </div>
);

const AdminDoctorPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('active');
  const [specialists, setSpecialists] = useState<Spesialist[]>([]);
  const router = useRouter();

  const loadDoctors = async () => {
    try {
      setLoading(true);
      let response;
      
      // Check if we're on deleted tab
      if (activeTab === 'deleted') {
        response = await fetchDeletedDoctors(
          pagination.current,
          pagination.pageSize,
          searchQuery
        );
      } else {
        response = await fetchDoctors(
          selectedSpecialist,
          pagination.current,
          pagination.pageSize,
          searchQuery
        );
      }
      
      setDoctors(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
      message.error('Failed to load doctors data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadSpecialists = async () => {
      const data = await fetchSpesialists();
      setSpecialists(data);
    };
    loadSpecialists();
  }, []);
  
  useEffect(() => {
    loadDoctors();
  }, [pagination.current, pagination.pageSize, selectedSpecialist, searchQuery, activeTab]);

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

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await deleteDoctor(id);
      await loadDoctors();
      message.success('Doctor deleted successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to delete doctor');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await restoreDoctor(id);
      await loadDoctors();
      message.success('Doctor restored successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to restore doctor');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEditClick = async (e: React.MouseEvent, doctorId: string) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, [`edit-${doctorId}`]: true }));
      await fetchDoctorId(doctorId);
      router.push(`/dashboard/admin/manage-doctors/form_edit_doctor/${doctorId}`);
    } catch (error) {
      message.error('Failed to access doctor details');
    } finally {
      setActionLoading(prev => ({ ...prev, [`edit-${doctorId}`]: false }));
    }
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
      title: "Photo Profile", 
      dataIndex: "name", 
      key: "photo",
      render: (text: string, record: Doctor) => (
        <div className="flex items-center space-x-3">
          {record.user.photo_profile && (
            <img 
              src={record.user.photo_profile} 
              alt={text} 
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-avatar.png';
              }}
            />
          )}
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    { 
      title: "Name", 
      dataIndex: ["user", "name"],
      key: "name",
    },
    {
      title: "Specialist",
      dataIndex: ["spesialist", "name"],
      key: "specialist"
    },
    { 
      title: "Experience", 
      dataIndex: "experience", 
      key: "experience" 
    },
    { 
      title: "Alumnus", 
      dataIndex: "alumnus", 
      key: "alumnus" 
    },
    { 
      title: "STR Number", 
      dataIndex: "no_str", 
      key: "no_str" 
    },
    { 
      title: "Price", 
      dataIndex: "price", 
      key: "price",
      render: (price: number) => `Rp ${price.toLocaleString()}`
    },
    { 
      title: "File STR", 
      key: "file_str",
      render: (text: string, record: Doctor) => (
        <div className="flex items-center space-x-3">
          {record.file_str ? (
            <a 
              href={record.file_str} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800"
            >
              Preview STR
            </a>
          ) : (
            <span className="text-gray-500 italic">No file</span>
          )}
        </div>
      )
    },    
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Doctor) => (
        <div className="space-x-2">
          {!record.deleted_at && (
            <Link 
              href={`/edit/${record.id}`}
              className="inline-block"
              onClick={(e) => handleEditClick(e, record.id)}
            >
              <Button 
                type="primary"
                loading={actionLoading[`edit-${record.id}`]}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Edit
              </Button>
            </Link>
          )}
          <ActionButton 
            id={record.id} 
            onDelete={handleDelete} 
            onRestore={handleRestore}
            isDeleted={!!record.deleted_at}
            loading={actionLoading[record.id]}
          />
        </div>
      ),
    },
  ];

  return (
        <AdminLayout>
          <Content className="p-6">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">Doctors Data</h2>
                  <Link href="/dashboard/admin/manage-doctors/form_create_doctor">
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Add New Doctor
                    </Button>
                  </Link>
                </div>

                <Row gutter={16} className="items-center">
                  <Col span={8}>
                    <Input
                      placeholder="Search doctors..."
                      prefix={<SearchOutlined />}
                      onChange={e => debouncedSearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={6}>
                  <Select
                    placeholder="Filter by specialist"
                    value={selectedSpecialist}
                    onChange={(value) => {
                      setSelectedSpecialist(value);
                      setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    allowClear
                    className="w-full"
                  >
                    {specialists.map(specialist => (
                      <Select.Option key={specialist.id} value={specialist.id}>
                        {specialist.name}
                      </Select.Option>
                    ))}
                  </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      value={pagination.pageSize}
                      onChange={(value) => setPagination(prev => ({ ...prev, pageSize: value, current: 1 }))}
                      className="w-full"
                    >
                      <Select.Option value={5}>5 entries</Select.Option>
                      <Select.Option value={10}>10 entries</Select.Option>
                      <Select.Option value={20}>20 entries</Select.Option>
                      <Select.Option value={50}>50 entries</Select.Option>
                    </Select>
                  </Col>
                </Row>

                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  className="border-b border-gray-200"
                >
                  <TabPane tab="Active Doctors" key="active" />
                  <TabPane tab="Deleted Doctors" key="deleted" />
                </Tabs>
              </div>
              
              {error ? (
                <ErrorDisplay error={error} onRetry={loadDoctors} />
              ) : (
                <Table
                  columns={columns}
                  dataSource={doctors}
                  rowKey="id"
                  pagination={{
                    ...pagination,
                    showSizeChanger: false,
                    showTotal: (total) => `Total ${total} doctors`,
                    className: "text-emerald-600 flex justify-center",
                    position: ['bottomCenter']
                  }}
                  onChange={handleTableChange}
                  loading={loading}
                  className="shadow-sm"
                  rowClassName="hover:bg-gray-50 transition-colors"
                />
              )}
            </div>
          </Content>
        </AdminLayout>

  );
};

export default AdminDoctorPage;