'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Upload, message, Card } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { createSpesialist } from '@/utils/spesialist';
import AdminLayout from '@/app/component/adminComponent/admin.layout.component';
import Link from 'next/link'; // Updated import for Next.js compatibility

const CreateSpesialistPage = () => {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="p-6">
        <Card className="shadow-sm">
          <div className="mb-6">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 m-0 ml-4">
                Create New Spesialist
              </h2>
            </div>
            <Link href="/dashboard/admin/manage-spesialists">
                <Button icon={<ArrowLeftOutlined />} className="flex items-center">
                  Back
                </Button>
              </Link>
          </div>
          <CreateSpesialistForm onSuccess={() => router.push('/dashboard/admin/manage-spesialists')} />
        </Card>
      </div>
    </AdminLayout>
  );
};

const CreateSpesialistForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', values.name);

      if (fileList[0]?.originFileObj) {
        formData.append('gambar', fileList[0].originFileObj);
      }

      await createSpesialist(formData);
      message.success('Spesialist created successfully');
      onSuccess();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Failed to create spesialist'
      );
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return true;
  };

  return (
    <div className="p-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        className="max-w-2xl mx-auto"
      >
        <Form.Item
          label="Spesialist Name"
          name="name"
          rules={[
            { required: true, message: 'Please input the spesialist name!' },
            { min: 3, message: 'Name must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter spesialist name" />
        </Form.Item>

        <Form.Item
          label="Image"
          name="image"
          rules={[{ required: true, message: 'Please upload a photo' }]}
          className="mt-4"
        >
          <Upload
            listType="picture"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            maxCount={1}
            accept="image/*"
            onRemove={() => setFileList([])}
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined className="text-xl" />
                <div className="mt-2">Upload Photo</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Create Spesialist
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateSpesialistPage;
