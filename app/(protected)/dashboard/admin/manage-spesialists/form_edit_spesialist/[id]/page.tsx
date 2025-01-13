'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { fetchSpesialistById, updateSpesialist, type Spesialist } from '@/utils/spesialist';
import AdminLayout from '@/app/component/adminComponent/admin.layout.component';

interface EditSpesialistFormProps {
  params: {
    id: string;
  };
}

const EditSpesialistForm = ({ params }: EditSpesialistFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadSpesialist = async () => {
      try {
        setInitialLoading(true);
        const spesialist = await fetchSpesialistById(params.id);
        
        form.setFieldsValue({
          name: spesialist.name
        });

        if (spesialist.gambar) {
          setFileList([
            {
              uid: '-1',
              name: 'Current Image',
              status: 'done',
              url: spesialist.gambar,
            }
          ]);
        }
      } catch (error) {
        message.error('Failed to load spesialist data');
        router.push('/dashboard/admin/manage-spesialists');
      } finally {
        setInitialLoading(false);
      }
    };

    loadSpesialist();
  }, [params.id, form, router]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', values.name);
      
      if (fileList[0]?.originFileObj) {
        formData.append('gambar', fileList[0].originFileObj);
      }

      await updateSpesialist(params.id, formData);
      message.success('Spesialist updated successfully');
      router.push('/dashboard/admin/manage-spesialists');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to update spesialist');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/admin/manage-spesialists');
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

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <Card title="Edit Spesialist" className="shadow-sm">
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
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter spesialist name" />
            </Form.Item>

            <Form.Item
              label="Photo"
              name="gambar"
            >
              <Upload
                listType="picture"
                maxCount={1}
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={({ fileList }) => setFileList(fileList)}
                onRemove={() => setFileList([])}
              >
                <Button icon={<UploadOutlined />}>Change Photo</Button>
              </Upload>
            </Form.Item>

            <div className="flex justify-end space-x-4 mt-6">
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Update Spesialist
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditSpesialistForm;