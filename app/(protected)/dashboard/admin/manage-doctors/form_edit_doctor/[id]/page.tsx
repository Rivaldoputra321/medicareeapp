'use client'

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, message, Card, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { fetchDoctorId, updateDoctor } from '@/utils/doctor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/component/adminComponent/admin.layout.component';

const EditDoctorPage = ({ params }: { params: { id: string } }) => {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card className="shadow-sm">
          <div className="mb-6">
            <div className="flex items-center mb-6">
              <Link href="/dashboard/admin/manage-doctors" className="mr-4">
                <Button icon={<ArrowLeftOutlined />} className="flex items-center">
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-semibold text-gray-800 m-0">Edit Doctor</h2>
            </div>
          </div>
          <EditDoctorForm id={params.id} onSuccess={() => window.location.href = '/dashboard/admin/manage-doctors'} />
        </Card>
      </div>
    </AdminLayout>
  );
};

const EditDoctorForm: React.FC<{ id: string; onSuccess: () => void }> = ({ id, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [photoFileList, setPhotoFileList] = useState<any[]>([]);
  const [fileSTRList, setFileSTRList] = useState<any[]>([]);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const doctor = await fetchDoctorId(id);
        form.setFieldsValue({
          name: doctor.user.name,
          email: doctor.user.email,
          experience: doctor.experience,
          alumnus: doctor.alumnus,
          no_str: doctor.no_str,
          price: doctor.price,
        });

        if (doctor.user.photo_profile) {
          setPhotoFileList([{
            uid: '-1',
            name: 'Current Photo',
            status: 'done',
            url: doctor.user.photo_profile,
          }]);
        }

        if (doctor.file_str) {
          setFileSTRList([{
            uid: '-1',
            name: 'Current STR File',
            status: 'done',
            url: doctor.file_str,
          }]);
        }

      } catch (error) {
        message.error('Failed to load doctor data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadDoctor();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(values).forEach(key => {
        if (key !== 'photo_profile' && key !== 'file_str') {
          formData.append(key, values[key]);
        }
      });

      if (photoFileList[0]?.originFileObj) {
        formData.append('photo', photoFileList[0].originFileObj);
      }

      if (fileSTRList[0]?.originFileObj) {
        formData.append('file_str', fileSTRList[0].originFileObj);
      }

      await updateDoctor(id, formData);
      message.success('Doctor updated successfully');
      onSuccess();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input the name' }]}
        >
          <Input placeholder="Enter doctor's name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input the email' },
            { type: 'email', message: 'Please input a valid email' }
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          label="Experience"
          name="experience"
          rules={[{ required: true, message: 'Please input the experience' }]}
        >
          <Input placeholder="e.g., 5 years in cardiology" />
        </Form.Item>

        <Form.Item
          label="Alumnus"
          name="alumnus"
          rules={[{ required: true, message: 'Please input the alumnus' }]}
        >
          <Input placeholder="Enter university name" />
        </Form.Item>

        <Form.Item
          label="STR Number"
          name="no_str"
          rules={[{ required: true, message: 'Please input the STR number' }]}
        >
          <Input placeholder="Enter STR number" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Please input the price' }]}
        >
          <InputNumber
            className="w-full"
            formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/Rp\s?|(,*)/g, '')}
            placeholder="Enter consultation price"
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Photo Profile"
        name="photo_profile"
        className="mt-4"
      >
        <Upload
          beforeUpload={() => false}
          fileList={photoFileList}
          onChange={({ fileList }) => setPhotoFileList(fileList)}
          maxCount={1}
          accept="image/*"
          listType="picture-card"
        >
          {photoFileList.length === 0 && (
            <div>
              <UploadOutlined className="text-xl" />
              <div className="mt-2">Upload Photo</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item
        label="File STR"
        name="file_str"
        className="mt-4"
      >
        <Upload
          beforeUpload={() => false}
          fileList={fileSTRList}
          onChange={({ fileList }) => setFileSTRList(fileList)}
          maxCount={1}
          accept=".pdf,.doc,.docx"
          listType="text"
        >
          {fileSTRList.length === 0 && (
            <div>
              <UploadOutlined className="text-xl" />
              <div className="mt-2">Upload File STR</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item className="mt-6">
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-base"
        >
          Update Doctor
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditDoctorPage;
