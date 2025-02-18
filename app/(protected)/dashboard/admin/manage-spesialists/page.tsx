'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Typography, Row, Col, Popconfirm, Table, Input, message, Select, Tabs } from 'antd';
import { DeleteOutlined, PlusCircleOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import { deleteSpesialist, fetchAdminSpesialists, fetchDeletedSpesialists, fetchSpesialistById, restoreSpesialist, Spesialist } from '@/utils/spesialist';
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
        message.success('Spesialist restored successfully');
      } else {
        await onDelete(id);
        message.success('Spesialist deleted successfully');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : `Failed to ${isDeleted ? 'restore' : 'delete'} Spesialist`);
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
      title="Are you sure you want to delete this Spesialist?"
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

const AdminSpesialistPage = () => {
  const [spesialists, setSpesialists] = useState<Spesialist[]>([
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const router = useRouter();

  const loadSpesialists = async () => {
    try {
      setLoading(true);
      let response;
      
      // Check if we're on deleted tab
      if (activeTab === 'deleted') {
        response = await fetchDeletedSpesialists(
          pagination.current,
          pagination.pageSize,
          searchQuery
        );
      } else {
        response = await fetchAdminSpesialists(
          pagination.current,
          pagination.pageSize,
          searchQuery
        );
      }
      
      setSpesialists(response.data);
      setPagination(prev => ({
        ...prev,
        total: Number(response.total)
      }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch speisialists');
      message.error('Failed to load speisialists data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSpesialists();
  }, [pagination.current, pagination.pageSize, searchQuery, activeTab]);

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
      await deleteSpesialist(id);
      await loadSpesialists();
      message.success('Spesialist deleted successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to delete Spesialist');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await restoreSpesialist(id);
      await loadSpesialists();
      message.success('Spesialist restored successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to restore Spesialist');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEditClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, [`edit-${id}`]: true }));
      await fetchSpesialistById(id);
      router.push(`/dashboard/admin/manage-spesialists/form_edit_spesialist/${id}`);
    } catch (error) {
      message.error('Failed to access specialist details');
    } finally {
      setActionLoading(prev => ({ ...prev, [`edit-${id}`]: false }));
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
      title: "Image", 
      dataIndex: "photo", 
      key: "photo",
      render: (text: string, record: Spesialist) => (
        <div className="flex items-center space-x-3">
          {record.gambar && (
            <img 
              src={record.gambar} 
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
        dataIndex: "name", 
        key: "name" 
      },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Spesialist) => (
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
                  <h2 className="text-2xl font-semibold text-gray-800">Specialists Data</h2>
                  <Link href="/dashboard/admin/manage-spesialists/form_create_spesialist">
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Add New Speisalist
                    </Button>
                  </Link>
                </div>

                <Row gutter={16} className="items-center">
                  <Col span={8}>
                    <Input
                      placeholder="Search spesialist..."
                      prefix={<SearchOutlined />}
                      onChange={e => debouncedSearch(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col span={6}>
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

                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  className="border-b border-gray-200"
                >
                  <TabPane tab="Active Spesialists" key="active" />
                  <TabPane tab="Deleted Spesialists" key="deleted" />
                </Tabs>
              </div>
              
              {error ? (
                <ErrorDisplay error={error} onRetry={loadSpesialists} />
              ) : (
                <Table
                  columns={columns}
                  dataSource={spesialists}
                  rowKey="id"
                  pagination={{
                    ...pagination,
                    showSizeChanger: false,
                    showTotal: (total) => `Total ${total} spesialists`,
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

export default AdminSpesialistPage;