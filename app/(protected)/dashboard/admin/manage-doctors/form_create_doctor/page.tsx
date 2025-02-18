'use client'

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, Select, message, Spin, Card } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { createDoctor } from '@/utils/doctor';
import { fetchSpesialists, type Spesialist } from '@/utils/spesialist';
import Link from 'next/link';
import AdminLayout from '../../../../../component/adminComponent/admin.layout.component';

const CreateDoctorPage = () => {
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
              <h2 className="text-2xl font-semibold text-gray-800 m-0">Create New Doctor</h2>
            </div>
          </div>
          <CreateDoctorForm onSuccess={() => window.location.href = '/dashboard/admin/manage-doctors'} />
        </Card>
      </div>
    </AdminLayout>
  );
};

const CreateDoctorForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photoFileList, setPhotoFileList] = useState<any[]>([]);
  const [strFileList, setStrFileList] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<Spesialist[]>([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(true);

  useEffect(() => {
    const loadSpecialists = async () => {
      try {
        setLoadingSpecialists(true);
        const data = await fetchSpesialists();
        setSpecialists(data);
      } catch (error) {
        message.error('Failed to load specialists');
      } finally {
        setLoadingSpecialists(false);
      }
    };

    loadSpecialists();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all non-file fields
      Object.keys(values).forEach(key => {
        if (key !== 'photo_profile' && key !== 'file_str') {
          formData.append(key, values[key]);
        }
      });

      // Append photo_profile if exists
      if (photoFileList[0]) {
        formData.append('photo_profile', photoFileList[0].originFileObj);
      }

      // Append file_str if exists
      if (strFileList[0]) {
        formData.append('file_str', strFileList[0].originFileObj);
      }

      await createDoctor(formData);
      message.success('Doctor created successfully');
      form.resetFields();
      setPhotoFileList([]);
      setStrFileList([]);
      onSuccess();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSpecialists) {
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
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input the password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          label="Specialist"
          name="spesialist"
          rules={[{ required: true, message: 'Please select a specialist' }]}
        >
          <Select placeholder="Select specialist">
            {specialists.map(specialist => (
              <Select.Option key={specialist.id} value={specialist.id}>
                {specialist.name}
              </Select.Option>
            ))}
          </Select>
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
        rules={[{ required: true, message: 'Please upload a photo' }]}
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
        rules={[{ required: true, message: 'Please upload a file' }]}
        className="mt-4"
      >
        <Upload
          beforeUpload={() => false}
          fileList={strFileList}
          onChange={({ fileList }) => setStrFileList(fileList)}
          maxCount={1}
          accept=".pdf"
          listType="text"
        >
          <Button icon={<UploadOutlined />}>Upload STR File</Button>
        </Upload>
      </Form.Item>

      <Form.Item className="mt-6">
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-base"
        >
          Create Doctor
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDoctorPage;