"use client"

import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Modal, Input, DatePicker, message, Spin } from 'antd';
import moment from 'moment';
import DoctorLayout from '@/app/component/doctorComponent/doctor.layout';
import { 
  Appointment, 
  getAppointmentsByStatus, 
  updateAppointmentStatus, 
  setMeetingLink,
  AppointmentStatus 
} from '@/utils/appointment';

const { TextArea } = Input;

interface ModalState {
  visible: boolean;
  appointmentId: string | null;
  type: 'meetingLink' | 'reject'  | null;
}

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'waiting' | 'completed' | 'failed'>('waiting');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    appointmentId: null,
    type: null
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [newSchedule, setNewSchedule] = useState<moment.Moment | null>(null);
  const [newMeetingLink, setNewMeetingLink] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const pageSize = 10;

  const loadAppointments = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await getAppointmentsByStatus(activeTab, currentPage, pageSize);
      setAppointments(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      message.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(page);
  }, [activeTab, page]);

  const handleModalOpen = (appointmentId: string, type: ModalState['type']) => {
    setModal({ visible: true, appointmentId, type });
  };

  const handleModalClose = () => {
    setModal({ visible: false, appointmentId: null, type: null });
    setRejectionReason('');
    setNewSchedule(null);
    setNewMeetingLink('');
  };

  const handleUpdateStatus = async (appointmentId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(true);
      const payload: any = { action };

      if (action === 'reject' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      await updateAppointmentStatus(appointmentId, payload);
      message.success(`Appointment ${action}ed successfully`);
      handleModalClose();
      loadAppointments(page);
    } catch (error) {
      message.error(`Failed to ${action} appointment`);
    } finally {
      setActionLoading(false);
    }
  };


  const handleSetMeetingLink = async () => {
    if (!modal.appointmentId || !newMeetingLink) return;

    try {
      setActionLoading(true);
      await setMeetingLink(modal.appointmentId, { meetingLink: newMeetingLink });
      message.success('Meeting link set successfully');
      handleModalClose();
      loadAppointments(page);
    } catch (error) {
      message.error('Failed to set meeting link');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusTag = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'warning',
      [AppointmentStatus.APPROVED]: 'processing',
      [AppointmentStatus.AWAITING_PAYMENT]: 'purple',
      [AppointmentStatus.PAID]: 'cyan',
      [AppointmentStatus.IN_PROGRESS]: 'blue',
      [AppointmentStatus.COMPLETED]: 'success',
      [AppointmentStatus.CANCELLED]: 'default',
      [AppointmentStatus.REJECTED]: 'error',
      [AppointmentStatus.RESCHEDULED]: 'orange'
    };

    return <Tag color={colors[status]}>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: ['patient', 'user', 'name'],
      key: 'patientName',
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <span className="text-gray-600">
          {moment(schedule).format('DD MMM YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => getStatusTag(status),
    },
    {
      title: 'Amount',
      dataIndex: ['transaction', 'amount'],
      key: 'amount',
      render: (amount: number) => (
        <span className="font-medium">
          Rp {amount?.toLocaleString() ?? '-'}
        </span>
      ),
    },
    {
      title: 'Meeting Link',
      dataIndex: 'meeting_link',
      key: 'meeting_link',
      render: (link: string) => (
        <div className="max-w-xs truncate">
          {link || '-'}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Appointment) => {
        const hasMeetingLink = !!record.meeting_link;
    
        return (
          <div className="space-x-2">
            {record.status === AppointmentStatus.PENDING && (
              <>
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleUpdateStatus(record.id, 'approve')}
                  loading={actionLoading}
                >
                  Approve
                </Button>
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={() => handleModalOpen(record.id, 'reject')}
                  loading={actionLoading}
                >
                  Reject
                </Button>
              </>
            )}
            {record.status === AppointmentStatus.APPROVED && (
              <Button
                type="default"
                size="small"
                onClick={() => handleModalOpen(record.id, 'meetingLink')}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Set Meeting Link
              </Button>
            )}
            {record.status === AppointmentStatus.PAID && (
              <>
                {!hasMeetingLink ? (
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleModalOpen(record.id, 'meetingLink')}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    Set Meeting Link
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="small"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => window.open(record.meeting_link, '_blank')}
                  >
                    Join Meet
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    }    
  ];

  const renderModalContent = () => {
    switch (modal.type) {
      case 'meetingLink':
        return (
          <Input
            placeholder="Enter Google Meet link"
            value={newMeetingLink}
            onChange={(e) => setNewMeetingLink(e.target.value)}
            className="w-full"
          />
        );
      case 'reject':
        return (
          <TextArea
            placeholder="Enter rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full"
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modal.type) {
      case 'meetingLink':
        return 'Set Meeting Link';
      case 'reject':
        return 'Rejection Reason';
      default:
        return '';
    }
  };

  const handleModalSubmit = () => {
    if (!modal.appointmentId) return;

    switch (modal.type) {
      case 'meetingLink':
        handleSetMeetingLink();
        break;
      case 'reject':
        handleUpdateStatus(modal.appointmentId, 'reject');
        break;
    }
  };

  return (
    <DoctorLayout>
      <div className="p-6">
        <Card className="shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Appointments Management
            </h2>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4">
              <Button
                type={activeTab === 'waiting' ? 'primary' : 'default'}
                onClick={() => {
                  setActiveTab('waiting');
                  setPage(1);
                }}
                className={`${
                  activeTab === 'waiting' ? 'bg-blue-500' : ''
                } min-w-[100px]`}
              >
                Waiting
              </Button>
              <Button
                type={activeTab === 'completed' ? 'primary' : 'default'}
                onClick={() => {
                  setActiveTab('completed');
                  setPage(1);
                }}
                className={`${
                  activeTab === 'completed' ? 'bg-blue-500' : ''
                } min-w-[100px]`}
              >
                Completed
              </Button>
              <Button
                type={activeTab === 'failed' ? 'primary' : 'default'}
                onClick={() => {
                  setActiveTab('failed');
                  setPage(1);
                }}
                className={`${
                  activeTab === 'failed' ? 'bg-blue-500' : ''
                } min-w-[100px]`}
              >
                Failed
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={appointments}
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

      <Modal
        title={getModalTitle()}
        open={modal.visible}
        onOk={handleModalSubmit}
        onCancel={handleModalClose}
        confirmLoading={actionLoading}
        okButtonProps={{
          className: 'bg-blue-500 hover:bg-blue-600',
        }}
      >
        {renderModalContent()}
      </Modal>
    </DoctorLayout>
  );
};

export default DoctorDashboard;