"use client"

import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Modal, Input, DatePicker, message, Spin, Tooltip } from 'antd';
import moment from 'moment';
import DoctorLayout from '@/app/component/doctorComponent/doctor.layout';
import { 
  Appointment, 
  getAppointmentsByStatus, 
  updateAppointmentStatus, 
  setMeetingLink,
  AppointmentStatus, 
  recordPresence,
  CompleteAppointmentDto,
  setDiagnosis
} from '@/utils/appointment';

const { TextArea } = Input;

interface ModalState {
  visible: boolean;
  appointmentId: string | null;
  type: 'meetingLink' | 'reject' | 'diagnosis' | null;
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
  const [diagnosisForm, setDiagnosisForm] = useState<CompleteAppointmentDto>({
    diagnosis: '',
    note: ''
  });
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
    // Refresh appointments every minute to update meeting availability
    const interval = setInterval(() => {
      loadAppointments(page);
    }, 60000);
    return () => clearInterval(interval);
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

  const handleJoinMeeting = async (appointmentId: string, meetingLink: string) => {
    try {
      await recordPresence(appointmentId);
      window.open(meetingLink, '_blank');
      message.success('Presence recorded successfully');
    } catch (error) {
      message.error('Failed to record presence');
    }
  };

 
  const checkTimeValidity = (schedule: Date) => {
    const appointmentTime = new Date(schedule).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (appointmentTime - now) / (1000 * 60);
    
    console.log('Time check:', {
      appointmentTime,
      now,
      diffInMinutes,
      schedule,
      currentTime: new Date(),
      scheduleFormatted: moment(schedule).format('YYYY-MM-DD HH:mm:ss'),
      currentFormatted: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    return diffInMinutes;
  };


  const getRemainingTime = (schedule: Date): string => {
    const diffInMinutes = checkTimeValidity(schedule);
    
    if (diffInMinutes > 10) {
      return `Meeting starts in ${Math.floor(diffInMinutes / 60)}h ${Math.floor(diffInMinutes % 60)}m`;
    } else if (diffInMinutes > 0) {
      return `Meeting starts in ${Math.floor(diffInMinutes)}m`;
    } else if (diffInMinutes >= -60) {
      return `Meeting started ${Math.abs(Math.floor(diffInMinutes))}m ago`;
    } else {
      return 'Meeting ended';
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
      [AppointmentStatus.AWAITING_JOIN_MEETING] : 'yellow',
      [AppointmentStatus.RESCHEDULED]: 'orange'
    };

    return <Tag color={colors[status]}>{status}</Tag>;
  };

  const handleSetDiagnosis = async () => {
    if (!modal.appointmentId) return;

    try {
      setActionLoading(true);
      await setDiagnosis(modal.appointmentId, diagnosisForm);
      message.success('Diagnosis set successfully');
      handleModalClose();
      loadAppointments(page);
    } catch (error) {
      message.error('Failed to set diagnosis');
    } finally {
      setActionLoading(false);
    }
  };

  const canSetDiagnosis = (appointment: Appointment): boolean => {
    if (appointment.status !== AppointmentStatus.IN_PROGRESS || !appointment.started_at) {
      return false;
    }
    
    const startTime = new Date(appointment.started_at).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (now - startTime) / (1000 * 60);
    
    return diffInMinutes >= 0;
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
      case 'diagnosis':
        handleSetDiagnosis();
        break;
    }
  };

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
      case 'diagnosis':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <TextArea
                placeholder="Enter diagnosis"
                value={diagnosisForm.diagnosis}
                onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                rows={4}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <TextArea
                placeholder="Enter additional notes"
                value={diagnosisForm.note}
                onChange={(e) => setDiagnosisForm(prev => ({ ...prev, note: e.target.value }))}
                rows={4}
                className="w-full"
              />
            </div>
          </div>
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
      case 'diagnosis':
        return 'Set Diagnosis and Notes';
      default:
        return '';
    }
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
      render: (schedule: Date) => (
        <div className="space-y-1">
          <div className="text-gray-600">
            {moment(new Date(schedule)).format('DD MMM YYYY HH:mm')}
          </div>
          <div className="text-sm text-gray-500">
            {getRemainingTime(schedule)}
          </div>
        </div>
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
        const hasMeetingLink = Boolean(record.meeting_link);
        const diffInMinutes = checkTimeValidity(record.schedule);
        const isJoinable = hasMeetingLink && (diffInMinutes <= 10 && diffInMinutes >= -60);
        const canDiagnose = canSetDiagnosis(record);

      console.log('Render action button:', {
        id: record.id,
        hasMeetingLink,
        diffInMinutes,
        isJoinable,
        status: record.status,
        schedule: moment(record.schedule).format('YYYY-MM-DD HH:mm:ss'),
        currentTime: moment().format('YYYY-MM-DD HH:mm:ss')
      });

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

            {(record.status === AppointmentStatus.PAID || 
              record.status === AppointmentStatus.AWAITING_JOIN_MEETING) && (
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
                  <Tooltip title={!isJoinable ? getRemainingTime(record.schedule) : 'Join the meeting now'}>
                    <Button
                      type="primary"
                      size="small"
                      className={`${isJoinable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}`}
                      onClick={() => isJoinable && handleJoinMeeting(record.id, record.meeting_link!)}
                      disabled={!isJoinable}
                    >
                      Join Meet ({Math.floor(diffInMinutes)} min)
                    </Button>
                  </Tooltip>
                )}
              </>
            )}

            {record.status === AppointmentStatus.IN_PROGRESS && (
              <Tooltip title={!canDiagnose ? 'Consultation must be at least 10 minutes long' : 'Set diagnosis and notes'}>
                <Button
                  type="primary"
                  size="small"
                  className={`${canDiagnose ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400'}`}
                  onClick={() => canDiagnose && handleModalOpen(record.id, 'diagnosis')}
                  disabled={!canDiagnose}
                >
                  Set Diagnosis
                </Button>
              </Tooltip>
            )}
          </div>
        );
      },
    }
  ];


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