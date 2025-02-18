'use client'

import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Upload, Spin } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { Doctor, fetchDoctorId, updateDoctorProfile } from '@/utils/doctor';
import { useAuth } from '@/utils/useAuth';

interface DoctorData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo_profile?: string;
  };
  spesialist: {
    id: string;
    name: string;
  };
  experience: string;
  alumnus: string;
  no_str: string;
  price: number;
}

const DoctorProfilePage = () => {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    let mounted = true;

    const loadDoctor = async () => {
      try {
        if (!user?.id) return;
        
        const response = await fetch(`http://localhost:8000/doctors/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctor profile');
        }
        
        const doctorData = await response.json();
        
        if (mounted) {
          setDoctor(doctorData);
          form.setFieldsValue({
            name: doctorData?.user?.name || '',
            email: doctorData?.user?.email || '',
            experience: doctorData?.experience || '',
            alumnus: doctorData?.alumnus || '',
            no_str: doctorData?.no_str || '',
            price: doctorData?.price || 0,
          });
        }
      } catch (error) {
        if (mounted) {
          message.error('Failed to load doctor profile. Please ensure you have a doctor account.');
          console.error('Error loading doctor profile:', error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      loadDoctor();
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (!doctor?.id || !user?.id) return;
      
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      if (values.photo_profile?.[0]?.originFileObj) {
        formData.append('photo_profile', values.photo_profile[0].originFileObj);
      }

      await updateDoctorProfile(doctor.id, formData);
      message.success('Profile updated successfully');
      setIsEditing(false);
      
      const response = await fetch(`/api/doctors/user/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to refresh doctor profile');
      }
      const updatedDoctor = await response.json();
      setDoctor(updatedDoctor);
    } catch (error) {
      message.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-6">Please log in to view your profile.</div>;
  }

  if (!doctor && !loading) {
    return (
      <div className="p-6">
        <Card>
          <p>No doctor profile found. Please contact an administrator if you believe this is an error.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card 
        title="Doctor Profile" 
        extra={
          isEditing ? (
            <div className="space-x-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="primary" onClick={() => form.submit()}>Save</Button>
            </div>
          ) : (
            <Button type="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={!isEditing}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Profile Picture">
              {doctor?.user?.photo_profile && (
                <img
                  src={doctor.user.photo_profile}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
              )}
              {isEditing && (
                <Form.Item name="photo_profile" noStyle>
                  <Upload maxCount={1} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>Upload Photo</Button>
                  </Upload>
                </Form.Item>
              )}
            </Form.Item>

            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input type="email" />
            </Form.Item>

            <Form.Item
              name="experience"
              label="Experience"
              rules={[{ required: true, message: 'Experience is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="alumnus"
              label="Alumnus"
              rules={[{ required: true, message: 'Alumnus is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="no_str"
              label="STR Number"
              rules={[{ required: true, message: 'STR Number is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="price"
              label="Consultation Price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="Specialist"
            >
              <Input disabled value={doctor?.spesialist?.name || ''} />
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DoctorProfilePage;