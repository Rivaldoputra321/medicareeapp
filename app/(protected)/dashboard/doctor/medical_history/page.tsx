"use client"

import React, { useEffect, useState } from 'react';
import { Card, Table, Input, message, Modal } from 'antd';
import moment from 'moment';
import DoctorLayout from '@/app/component/doctorComponent/doctor.layout';
import { 
  Appointment,
  getDoctorConsultations
} from '@/utils/appointment';

const { Search } = Input;

interface DetailModalState {
  visible: boolean;
  record: Appointment | null;
}

const DoctorConsultationHistory = () => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    visible: false,
    record: null,
  });
  const pageSize = 10;

  const loadHistory = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await getDoctorConsultations(
        search,
        currentPage,
        pageSize
      );
      
      setData(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      message.error('Failed to load consultation history');
      console.error('Error loading consultation history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(page);
  }, [page, search]);

  const handleViewDetail = (record: Appointment) => {
    setDetailModal({
      visible: true,
      record,
    });
  };

  const calculateAge = (dateOfBirth: string | null | undefined): string => {
    if (!dateOfBirth) return 'N/A';
    
    const birthDate = moment(dateOfBirth);
    const today = moment();
    const age = today.diff(birthDate, 'years');
    
    return `${age} tahun`;
  };

  const calculateDuration = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start || !end) return 0;
    const duration = moment.duration(moment(end).diff(moment(start)));
    return Math.floor(duration.asMinutes());
  };

  const columns = [
    {
      title: 'Patient Information',
      key: 'patientInfo',
      render: (_: any, record: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.patient?.user?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Consultation Date',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (date: string) => (
        <span className="text-gray-600">
          {moment(date).format('DD MMM YYYY HH:mm')}
        </span>
      ),
    },
    
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (diagnosis: string) => (
        <div className="max-w-md">
          <p className="text-gray-900 truncate">{diagnosis || '-'}</p>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Appointment) => (
        <button
          onClick={() => handleViewDetail(record)}
          className="text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      ),
    }
  ];

  const renderDetailModal = (record: Appointment) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Patient Information</h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <p><span className="font-medium">Name:</span> {record.patient?.user?.name}</p>
          <p><span className="font-medium">Height:</span> {record.patient?.height}</p>
          <p><span className="font-medium">Weight:</span> {record.patient?.weight}</p>
          <p><span className="font-medium">Gender:</span> {record.patient?.gender}</p>
          <p><span className="font-medium">Age:</span> {calculateAge(record.patient?.date_of_birth)}</p>
          <p><span className="font-medium">Consultation Date:</span> {moment(record.schedule).format('DD MMM YYYY HH:mm')}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Medical Record</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Diagnosis</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{record.diagnosis || '-'}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{record.note || '-'}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Consultation Timeline</h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <p>
            <span className="font-medium">Scheduled Time:</span> {moment(record.schedule).format('DD MMM YYYY HH:mm')}
          </p>
          <p>
            <span className="font-medium">Started:</span> {
              record.started_at 
                ? moment(record.started_at).format('HH:mm')
                : '-'
            }
          </p>
          <p>
            <span className="font-medium">Completed:</span> {
              record.completed_at
                ? moment(record.completed_at).format('HH:mm')
                : '-'
            }
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DoctorLayout>
      <div className="p-6">
        <Card className="shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Consultation History
            </h2>
          </div>

          <div className="mb-6">
            <Search
              placeholder="Search patient name..."
              allowClear
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              style={{ width: 250 }}
            />
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

        <Modal
          title="Consultation Details"
          open={detailModal.visible}
          onCancel={() => setDetailModal({ visible: false, record: null })}
          footer={null}
          width={700}
        >
          {detailModal.record && renderDetailModal(detailModal.record)}
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default DoctorConsultationHistory;